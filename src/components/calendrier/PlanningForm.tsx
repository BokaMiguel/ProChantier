import React, { useState, useEffect, useMemo } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  FaCalendarDay,
  FaPlus,
  FaClock,
  FaBuilding,
  FaMapMarkerAlt,
  FaEdit,
  FaSign,
  FaTrash,
  FaFlask,
  FaCog,
  FaSave,
  FaFileImport,
  FaPencilAlt,
  FaClipboardList,
} from "react-icons/fa";
import { format, startOfWeek, endOfWeek, addDays, parseISO, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CreatePlanifModal from "./CreatePlanifModal"; 
import { ActivitePlanif } from "../../models/JournalFormModel";
import { useAuth } from "../../context/AuthContext";
import {
  createOrUpdatePlanifChantier,
  createOrUpdatePlanifActivites,
  deletePlanifActivites,
  getPlanifChantierByProjet,
  getPlanifActivites,
} from "../../services/JournalService";
import './PlanningButton.css';

const PlanningForm: React.FC = () => {
  const {
    activitesPlanif,
    activites,
    lieux,
    sousTraitants,
    signalisations,
    selectedProject,
    fetchActivitesPlanif
  } = useAuth();

  // Logs pour déboguer
  useEffect(() => {
    console.log('Données du PlanningForm:', {
      activitesPlanif,
      activites,
      lieux,
      sousTraitants,
      signalisations,
      selectedProject
    });
  }, [activitesPlanif, activites, lieux, sousTraitants, signalisations, selectedProject]);

  // Assurez-vous que les données sont chargées quand un projet est sélectionné
  useEffect(() => {
    if (selectedProject && (!activites || !lieux || !sousTraitants || !signalisations)) {
      console.log('Projet sélectionné mais données manquantes, rechargement...');
      // Les données devraient être chargées automatiquement via le contexte Auth
      // quand selectedProject change
    }
  }, [selectedProject, activites, lieux, sousTraitants, signalisations]);

  const [activities, setActivities] = useState<{
    [key: string]: ActivitePlanif[];
  }>({
    Lundi: [],
    Mardi: [],
    Mercredi: [],
    Jeudi: [],
    Vendredi: [],
    Samedi: [],
    Dimanche: [],
  });
  
  const [localActivities, setLocalActivities] = useState<{
    [key: string]: ActivitePlanif[];
  }>(activities);
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [planifToEdit, setPlanifToEdit] = useState<ActivitePlanif | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedActivities, setSelectedActivities] = useState<{
    [key: string]: Set<number>;
  }>({});

  const [existingPlanifications, setExistingPlanifications] = useState<Map<string, number>>(new Map());

  // Calcul des dates de début et fin de semaine
  const start = useMemo(() => {
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    console.log("Début de semaine:", startDate);
    return startDate;
  }, [currentDate]);

  const end = useMemo(() => {
    const endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
    console.log("Fin de semaine:", endDate);
    return endDate;
  }, [currentDate]);

  // Générer les dates de la semaine
  const weekDates = useMemo(() => {
    const dates = [];
    let current = start;
    
    while (current <= end) {
      dates.push(current);
      current = addDays(current, 1);
    }
    return dates;
  }, [start, end]);

  useEffect(() => {
    const fetchExistingPlanifications = async () => {
      if (!selectedProject?.ID) return;
      
      try {
        const planifResponse = await getPlanifChantierByProjet(selectedProject.ID);
        console.log("Planifications reçues:", planifResponse);
        
        if (planifResponse && Array.isArray(planifResponse)) {
          const planifMap = new Map<string, number>();
          const newActivities: { [key: string]: ActivitePlanif[] } = {};

          // Initialiser les jours avec des tableaux vides
          const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
          daysOfWeek.forEach(day => {
            newActivities[day] = [];
          });

          // Pour chaque planification
          for (const planif of planifResponse) {
            // Créer une date à partir de la date reçue
            const planifDate = parseISO(planif.date);
            console.log("Date de planification:", planif.date, "=>", planifDate);
            
            if (!isValid(planifDate)) {
              console.error('Date invalide reçue:', planif.date);
              continue;
            }

            // Obtenir le jour de la semaine en français
            const dayKey = format(planifDate, 'EEEE', { locale: fr });
            // Capitaliser la première lettre pour correspondre à notre format de clé
            const formattedDayKey = dayKey.charAt(0).toUpperCase() + dayKey.slice(1).toLowerCase();
            console.log("Jour de la semaine:", formattedDayKey);
            
            // Créer une nouvelle activité avec les données de la planification
            const newActivity: ActivitePlanif = {
              id: planif.id,
              projetId: selectedProject.ID,
              lieuID: planif.lieuID,
              hrsDebut: planif.hrsDebut,
              hrsFin: planif.hrsFin,
              defaultEntrepriseId: planif.defaultEntrepriseId,
              signalisationId: planif.signalisationId,
              note: planif.note || '',
              isLab: planif.isLab,
              date: planif.date,
              activiteIDs: planif.activites ? planif.activites.map((a: { activiteID: number }) => a.activiteID) : [],
              quantite: planif.quantite || 0,
              nomActivite: ''
            };

            console.log("Ajout de l'activité au jour:", formattedDayKey, newActivity);
            newActivities[formattedDayKey].push(newActivity);
            planifMap.set(`${formattedDayKey}-${planif.id}`, planif.id);
          }

          console.log("Nouvelles activités par jour:", newActivities);
          setExistingPlanifications(planifMap);
          setActivities(newActivities);
          setLocalActivities(newActivities);
          setHasUnsavedChanges(false);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des planifications:', error);
      }
    };

    fetchExistingPlanifications();
  }, [selectedProject?.ID]);

  useEffect(() => {
    if (activitesPlanif) {
      const newActivities: { [key: string]: ActivitePlanif[] } = {
        Lundi: [],
        Mardi: [],
        Mercredi: [],
        Jeudi: [],
        Vendredi: [],
        Samedi: [],
        Dimanche: [],
      };

      activitesPlanif.forEach((planif) => {
        const planifDate = parseISO(planif.date);
        
        // Vérifier si la date est dans la semaine courante
        const isInCurrentWeek = weekDates.some(weekDate => 
          format(weekDate, 'yyyy-MM-dd') === format(planifDate, 'yyyy-MM-dd')
        );

        if (isInCurrentWeek) {
          // Obtenir le jour en français
          const dayName = format(planifDate, 'EEEE', { locale: fr });
          const formattedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1).toLowerCase();
          
          if (newActivities[formattedDayName]) {
            newActivities[formattedDayName].push(planif);
          }
        }
      });

      console.log("Activités organisées par jour:", newActivities);
      setActivities(newActivities);
      setLocalActivities(newActivities);
    }
  }, [activitesPlanif, weekDates, currentDate]);

  const handleSavePlanif = async (planif: ActivitePlanif, selectedActivities: Set<number>) => {
    if (!selectedDay || !selectedProject?.ID) {
      console.error("Aucun jour sélectionné ou projet non sélectionné");
      return;
    }

    const selectedActivitiesArray = Array.from(selectedActivities);
    console.log("Activités sélectionnées pour la sauvegarde:", selectedActivitiesArray);
    
    // Obtenir le jour de la semaine à partir de la date de la planification
    const planifDate = parseISO(planif.date);
    const dayOfWeek = format(planifDate, 'EEEE', { locale: fr });
    const targetDay = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
    
    console.log("Date de la planification:", planif.date);
    console.log("Jour ciblé:", targetDay);
    
    // Créer la nouvelle planification avec les activités sélectionnées
    const updatedPlanif = {
      ...planif,
      projetId: selectedProject.ID,
      activiteIDs: selectedActivitiesArray,
      // Garder la date exactement comme elle était
      date: planif.date
    };

    // Mise à jour uniquement de l'état local pour la prévisualisation
    setLocalActivities(prev => {
      const updatedActivities = { ...prev };
      
      // Si c'est une modification d'une planif existante, on doit d'abord la supprimer de son ancien emplacement
      if (planif.id) {
        // Parcourir tous les jours pour trouver et supprimer l'ancienne entrée
        Object.keys(updatedActivities).forEach(day => {
          const index = updatedActivities[day].findIndex(p => p.id === planif.id);
          if (index !== -1) {
            updatedActivities[day].splice(index, 1);
          }
        });
      }
      
      // S'assurer que le tableau pour le jour cible existe
      if (!updatedActivities[targetDay]) {
        updatedActivities[targetDay] = [];
      }
      
      // Ajouter ou mettre à jour la planification dans le jour cible
      if (planif.id) {
        updatedActivities[targetDay].push({
          ...updatedPlanif,
          activiteIDs: selectedActivitiesArray
        });
      } else {
        // Nouvelle planif - générer un ID temporaire négatif
        const tempId = -Date.now();
        updatedActivities[targetDay].push({
          ...updatedPlanif,
          id: tempId,
          activiteIDs: selectedActivitiesArray
        });
      }

      // Nettoyer la clé de date si elle existe
      if (updatedActivities[planif.date]) {
        delete updatedActivities[planif.date];
      }

      console.log("État local mis à jour avec les activités:", updatedActivities);
      return updatedActivities;
    });

    // Mettre à jour l'état des activités sélectionnées avec la clé correcte
    const key = planif.id ? `${targetDay}-${planif.id}` : `${targetDay}-${-Date.now()}`;
    setSelectedActivities(prev => {
      const newSelectedActivities = { ...prev };
      // Supprimer les anciennes références aux activités sélectionnées
      Object.keys(newSelectedActivities).forEach(k => {
        if (k.endsWith(`-${planif.id}`)) {
          delete newSelectedActivities[k];
        }
      });
      // Ajouter la nouvelle référence
      newSelectedActivities[key] = new Set(selectedActivitiesArray);
      return newSelectedActivities;
    });

    setHasUnsavedChanges(true);
    setShowModal(false);
  };

  const handleEditActivity = (activity: ActivitePlanif) => {
    // Stocker les activités sélectionnées dans l'état selectedActivities
    const key = `${activity.date}-${activity.id}`;
    if (activity.activiteIDs) {
      setSelectedActivities(prev => ({
        ...prev,
        [key]: new Set(activity.activiteIDs)
      }));
    }
    setPlanifToEdit(activity);
    setSelectedDay(activity.date);
    setShowModal(true);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sourceDay = source.droppableId;
    const destinationDay = destination.droppableId;

    setLocalActivities(prev => {
      const updatedActivities = { ...prev };
      
      // Trouver l'activité déplacée
      const [movedActivity] = updatedActivities[sourceDay].splice(source.index, 1);
      
      // S'assurer que le tableau de destination existe
      if (!updatedActivities[destinationDay]) {
        updatedActivities[destinationDay] = [];
      }

      // Trouver la date correspondant au jour de destination
      const dayIndex = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]
        .indexOf(destinationDay.toLowerCase());
      
      if (dayIndex === -1) {
        console.error("Jour invalide:", destinationDay);
        return prev;
      }

      // Calculer la nouvelle date en ajoutant le nombre de jours à la date de début de semaine
      const newDate = format(addDays(start, dayIndex), 'yyyy-MM-dd');
      
      // Mettre à jour l'activité avec la nouvelle date
      const updatedActivity = {
        ...movedActivity,
        date: newDate
      };

      // Insérer l'activité à sa nouvelle position
      updatedActivities[destinationDay].splice(destination.index, 0, updatedActivity);

      return updatedActivities;
    });

    setHasUnsavedChanges(true);
  };

  const handleDeletePlanif = async (day: string, id: number) => {
    try {
      // Supprimer d'abord les activités associées
      await deletePlanifActivites(id);
      
      setLocalActivities((prev) => ({
        ...prev,
        [day]: prev[day].filter((planif) => planif.id !== id),
      }));

      // Supprimer aussi les activités sélectionnées pour cette planif
      setSelectedActivities((prev) => {
        const newState = { ...prev };
        delete newState[`${day}-${id}`];
        return newState;
      });
    } catch (error) {
      console.error("Failed to delete planif:", error);
      alert("Une erreur est survenue lors de la suppression de la planification");
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setCurrentDate(date);
    }
  };

  const handleCheckboxChange = (id: string) => {
    setLocalActivities((prevActivities) => {
      const updatedActivities = { ...prevActivities };
      for (const day in updatedActivities) {
        updatedActivities[day] = updatedActivities[day].map((activity) => {
          if (activity.id.toString() === id) {
            return { ...activity, isLab: !activity.isLab };
          }
          return activity;
        });
      }
      return updatedActivities;
    });
  };

  const handleSaveActivity = (activity: ActivitePlanif) => {
    setLocalActivities((prevActivities) => {
      const updatedActivities = { ...prevActivities };

      // Trouver le jour correspondant à l'activité en fonction de sa date
      const dayOfWeek = Object.keys(updatedActivities).find((day) =>
        updatedActivities[day].some((act) => act.id === activity.id)
      );

      if (dayOfWeek) {
        // Mettre à jour l'activité existante
        updatedActivities[dayOfWeek] = updatedActivities[dayOfWeek].map((act) =>
          act.id === activity.id ? activity : act
        );
      } else {
        // Si l'activité n'existe pas dans les activités du jour, on l'ajoute
        updatedActivities[selectedDay].push(activity);
      }
      return updatedActivities;
    });

    setShowModal(false);
  };

  const handleDeleteActivity = (day: string, id: number) => {
    setLocalActivities((prevActivities) => {
      const updatedActivities = { ...prevActivities };
      updatedActivities[day] = updatedActivities[day].filter(
        (activity) => activity.id !== id
      );
      return updatedActivities;
    });
  };

  const getActivityName = (id: number) => {
    const activity = activites?.find((act) => act.id === id);
    return activity ? activity.nom : "Inconnu";
  };

  const getLieuName = (id: number) => {
    const lieu = lieux?.find((l) => l.id === id);
    return lieu ? lieu.nom : "Inconnu";
  };

  const getEntrepriseName = (id: number) => {
    const entreprise = sousTraitants?.find((ent) => ent.id === id);
    return entreprise ? entreprise.nom : "Inconnu";
  };

  const getSignalisationName = (id: number) => {
    const signalisation = signalisations?.find((sig) => sig.id === id);
    return signalisation ? signalisation.nom : "Inconnu";
  };

  const handleToggleActivity = (day: string, activityId: number) => {
    setSelectedActivities((prev) => {
      const newSelected = { ...prev };
      if (!newSelected[day]) {
        newSelected[day] = new Set<number>();
      }
      
      if (newSelected[day].has(activityId)) {
        newSelected[day].delete(activityId);
      } else {
        newSelected[day].add(activityId);
      }
      
      return newSelected;
    });
  };

  const handleImportActivities = (activitiesToImport: ActivitePlanif[]) => {
    setLocalActivities((prevActivities) => {
      const updatedActivities = { ...prevActivities };
      activitiesToImport.forEach((activity) => {
        updatedActivities[selectedDay] = [
          ...updatedActivities[selectedDay],
          { ...activity, id: Date.now() },
        ];
      });
      return updatedActivities;
    });

    setSelectedActivities({ [selectedDay]: new Set<number>() });
    setShowImportModal(false);
  };

  const handleSavePlanning = async () => {
    if (!selectedProject?.ID) return;

    try {
      // Pour chaque jour
      for (const day of Object.keys(localActivities)) {
        const activitiesForDay = localActivities[day];
        
        for (const activity of activitiesForDay) {
          try {
            const dayIndex = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].indexOf(day);
            const currentDate = addDays(start, dayIndex);
            const formattedDate = format(currentDate, 'yyyy-MM-dd');

            // 1. Créer ou mettre à jour la planification
            const planifData = {
              ID: activity.id > 0 ? activity.id : 0, // Si ID négatif, c'est une nouvelle planif
              LieuID: activity.lieuID,
              ProjetID: selectedProject.ID,
              HrsDebut: activity.hrsDebut,
              HrsFin: activity.hrsFin,
              DefaultEntrepriseId: activity.defaultEntrepriseId,
              IsLab: activity.isLab,
              SignalisationId: activity.signalisationId || 0,
              Note: activity.note || "",
              Date: formattedDate
            };

            console.log("Envoi des données de planification:", planifData);
            
            // Créer/mettre à jour la planification
            const savedPlanif = await createOrUpdatePlanifChantier(planifData);
            console.log("Planification créée/mise à jour:", savedPlanif);

            if (!savedPlanif || !savedPlanif.id) {
              throw new Error("La création/mise à jour de la planification a échoué");
            }

            // 2. Gérer les associations d'activités
            if (activity.activiteIDs && activity.activiteIDs.length > 0) {
              const planifId = activity.id > 0 ? activity.id : savedPlanif.id;
              
              // Récupérer les activités existantes
              const existingActivites = await getPlanifActivites(planifId);
              const existingActiviteIds = existingActivites ? existingActivites.map((a: { activiteID: number; }) => a.activiteID) : [];
              
              // Trouver les nouvelles activités à ajouter (éviter les doublons)
              const newActiviteIds = activity.activiteIDs.filter(id => !existingActiviteIds.includes(id));
              
              if (newActiviteIds.length > 0) {
                console.log("Nouvelles activités à ajouter:", newActiviteIds);
                
                // Créer seulement les nouvelles associations
                for (const activiteId of newActiviteIds) {
                  const planifActivitesData = {
                    planifId: planifId,
                    activiteId: activiteId
                  };

                  console.log("Création nouvelle association activité:", planifActivitesData);
                  const savedActivite = await createOrUpdatePlanifActivites(planifActivitesData);
                  
                  if (savedActivite) {
                    // Mettre à jour l'état local pour refléter la nouvelle activité
                    setLocalActivities(prev => {
                      const updatedActivities = { ...prev };
                      const dayActivities = [...(updatedActivities[day] || [])];
                      const activityIndex = dayActivities.findIndex(a => a.id === planifId);
                      
                      if (activityIndex !== -1) {
                        dayActivities[activityIndex] = {
                          ...dayActivities[activityIndex],
                          activiteIDs: [...existingActiviteIds, activiteId]
                        };
                        updatedActivities[day] = dayActivities;
                      }
                      
                      return updatedActivities;
                    });
                  }
                }
              } else {
                console.log("Aucune nouvelle activité à ajouter");
              }
            }
          } catch (error) {
            console.error("Erreur lors de la création/mise à jour:", error);
            throw error;
          }
        }
      }

      // Mise à jour réussie
      setActivities(localActivities);
      setHasUnsavedChanges(false);
      alert("Modifications enregistrées avec succès !");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error);
      alert("Une erreur est survenue lors de la sauvegarde des modifications.");
    }
  };

  const handleActivityChange = (day: string, activityId: number, field: string, value: any) => {
    setLocalActivities((prevActivities) => {
      const updatedActivities = { ...prevActivities };
      updatedActivities[day] = updatedActivities[day].map((activity) => {
        if (activity.id === activityId) {
          return { ...activity, [field]: value };
        }
        return activity;
      });
      return updatedActivities;
    });
  };

  const getActivitiesNames = (activiteIDs: number[]) => {
    if (!activites || !activiteIDs) return [];
    return activiteIDs
      .map(id => activites.find(a => a.id === id))
      .filter(a => a !== undefined)
      .map(a => a!.nom);
  };

  // Initialisation des jours de la semaine
  const daysOfWeek = useMemo(() => {
    return ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  }, []);

  // Fonction pour capitaliser la première lettre
  const formatDayName = (date: Date) => {
    const dayName = format(date, 'EEEE', { locale: fr });
    return dayName.charAt(0).toUpperCase() + dayName.slice(1).toLowerCase();
  };

  const renderActivity = (activity: ActivitePlanif) => (
    <div className="font-bold text-gray-900">
      {activity.nomActivite || (
        activity.activiteIDs && activity.activiteIDs.length > 0 ? (
          <>
            {getActivitiesNames(activity.activiteIDs)[0]}
            {activity.activiteIDs.length > 1 && (
              <span className="ml-2 text-xs font-bold text-blue-600">
                +{activity.activiteIDs.length - 1} autres
              </span>
            )}
          </>
        ) : (
          "Aucune activité"
        )
      )}
    </div>
  );

  const handleSaveAllChanges = async () => {
    try {
      if (!selectedProject?.ID) return;

      console.log("Début de la sauvegarde globale");
      console.log("État local des activités:", localActivities);

      // Parcourir toutes les activités locales
      for (const day in localActivities) {
        for (const planif of localActivities[day]) {
          console.log(`Sauvegarde de la planification pour ${day}:`, planif);

          try {
            // Préparer les données de la planification
            const planifData = {
              ID: planif.id > 0 ? planif.id : 0, // Si ID négatif, c'est une nouvelle planif
              LieuID: planif.lieuID,
              ProjetID: selectedProject.ID,
              HrsDebut: planif.hrsDebut,
              HrsFin: planif.hrsFin,
              DefaultEntrepriseId: planif.defaultEntrepriseId,
              IsLab: planif.isLab,
              SignalisationId: planif.signalisationId || 0,
              Note: planif.note || "",
              Date: planif.date
            };

            console.log("Données de planification à sauvegarder:", planifData);

            // Sauvegarder la planification
            const savedPlanif = await createOrUpdatePlanifChantier(planifData);
            console.log("Réponse de la sauvegarde:", savedPlanif);

            const planifId = savedPlanif?.id || planif.id;
            if (!planifId) {
              throw new Error(`Échec de la sauvegarde de la planification pour ${day}`);
            }

            // Si on a des activités associées
            if (planif.activiteIDs && planif.activiteIDs.length > 0) {
              console.log("Sauvegarde des associations d'activités:", planif.activiteIDs);

              // Récupérer les associations existantes
              const existingActivites = await getPlanifActivites(planifId);
              console.log("Associations existantes:", existingActivites);

              // Pour chaque activité
              for (const activiteId of planif.activiteIDs) {
                // Vérifier si l'association existe déjà
                const existingAssociation = existingActivites?.find((a: { activiteID: number; }) => a.activiteID === activiteId);
                
                const planifActivitesData = {
                  ID: existingAssociation ? existingAssociation.id : 0,
                  PlanifID: planifId,
                  ActiviteID: activiteId
                };

                console.log("Sauvegarde de l'association:", planifActivitesData);
                await createOrUpdatePlanifActivites(planifActivitesData);
              }

              // Supprimer les associations qui ne sont plus présentes
              if (existingActivites) {
                for (const existingActivite of existingActivites) {
                  if (!planif.activiteIDs.includes(existingActivite.activiteID)) {
                    console.log("Suppression de l'association:", existingActivite);
                    await deletePlanifActivites(existingActivite.id);
                  }
                }
              }
            }
          } catch (error) {
            console.error("Erreur lors de la sauvegarde d'une planification:", error);
            throw error;
          }
        }
      }

      console.log("Sauvegarde globale terminée avec succès");
      //await fetchActivitesPlanif(selectedProject.ID);
      setHasUnsavedChanges(false);

    } catch (error) {
      console.error("Erreur lors de la sauvegarde globale:", error);
      alert("Une erreur est survenue lors de la sauvegarde des planifications");
    }
  };

  const getSelectedActivitiesForPlanif = (planif: ActivitePlanif) => {
    const key = `${planif.date}-${planif.id}`;
    return selectedActivities[key] || new Set(planif.activiteIDs || []);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* En-tête sticky avec DatePicker et boutons */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-lg shadow-sm">
        <div className="flex flex-col gap-4 p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <DatePicker
                  selected={currentDate}
                  onChange={handleDateChange}
                  dateFormat="dd/MM/yyyy"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  locale={fr}
                />
                <FaCalendarDay className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <div className="text-sm font-medium text-gray-600">
                Semaine du {format(start, "d MMMM", { locale: fr })} au{" "}
                {format(end, "d MMMM yyyy", { locale: fr })}
              </div>
            </div>
            
            <div className="flex gap-2">  
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <FaFileImport className="text-sm" />
                Importer une planification
              </button>  
              <button
                onClick={() => {
                  setSelectedDay("Lundi");
                  setShowModal(true);
                }}
                className="continue-application"
              >
                <div>
                  <div className="pencil"></div>
                  <div className="folder">
                    <div className="top">
                      <svg viewBox="0 0 24 27">
                        <path d="M1,0 L23,0 C23.5522847,-1.01453063e-16 24,0.44771525 24,1 L24,8.17157288 C24,8.70200585 23.7892863,9.21071368 23.4142136,9.58578644 L20.5857864,12.4142136 C20.2107137,12.7892863 20,13.2979941 20,13.8284271 L20,26 C20,26.5522847 19.5522847,27 19,27 L1,27 C0.44771525,27 6.76353751e-17,26.5522847 0,26 L0,1 C-6.76353751e-17,0.44771525 0.44771525,1.01453063e-16 1,0 Z"></path>
                      </svg>
                    </div>
                    <div className="paper"></div>
                  </div>
                </div>
                Créer une planification
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="p-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 gap-4">
            {weekDates.map((date, index) => {
              const dayName = formatDayName(date);
              const formattedDate = format(date, 'dd/MM/yyyy');
              
              return (
                <Droppable key={dayName} droppableId={dayName}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`bg-white rounded-lg border ${
                        snapshot.isDraggingOver ? "border-blue-300 bg-blue-50" : "border-gray-200"
                      }`}
                    >
                      {/* En-tête du jour */}
                      <div className="flex items-center justify-between p-4 bg-blue-600 text-white rounded-t-lg">
                        <div className="flex items-center gap-2">
                          <FaCalendarDay />
                          <span className="font-bold">{dayName}</span>
                          <span className="text-sm text-blue-200">- {formattedDate}</span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedDay(dayName);
                            setShowModal(true);
                          }}
                          className="p-1 text-white hover:text-blue-200 transition-colors duration-200"
                        >
                          <FaPlus className="text-lg" />
                        </button>
                      </div>
                      
                      {/* Headers des colonnes */}
                      <div className="grid grid-cols-12 gap-4 bg-gray-50 px-4 py-2 border-b border-gray-200 text-sm font-medium text-gray-600">
                        <div className="col-span-3 flex items-center gap-2">
                          <FaClipboardList size={14} className="text-blue-500" />
                          <span>Activité</span>
                        </div>
                        <div className="col-span-2 flex items-center gap-2">
                          <FaClock size={14} className="text-blue-500" />
                          <span>Horaire</span>
                        </div>
                        <div className="col-span-2 flex items-center gap-2">
                          <FaBuilding size={14} className="text-blue-500" />
                          <span>Entreprise</span>
                        </div>
                        <div className="col-span-2 flex items-center gap-2">
                          <FaMapMarkerAlt size={14} className="text-blue-500" />
                          <span>Lieu</span>
                        </div>
                        <div className="col-span-2 flex items-center gap-2">
                          <FaSign size={14} className="text-blue-500" />
                          <span>Signalisation</span>
                        </div>
                        <div className="col-span-1 flex justify-end items-center gap-2">
                          <FaCog size={14} className="text-blue-500" />
                        </div>
                      </div>

                      {/* Liste des activités */}
                      <div className="p-4 space-y-2">
                        {localActivities[dayName]?.map((activity, index) => (
                          <Draggable
                            key={activity.id.toString()}
                            draggableId={activity.id.toString()}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="grid grid-cols-12 gap-4 items-center bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200"
                              >
                                <div className="col-span-3">
                                  <div className="group relative">
                                    {renderActivity(activity)}
                                    
                                    {/* Tooltip avec la liste complète des activités */}
                                    {activity.activiteIDs && activity.activiteIDs.length > 1 && (
                                      <div 
                                        className="absolute invisible group-hover:visible bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px] mt-1" 
                                        style={{ 
                                          zIndex: 1000,
                                          transform: 'translateY(0)',
                                          pointerEvents: 'auto'
                                        }}
                                      >
                                        <div className="text-sm font-bold text-gray-700 mb-2">
                                          Toutes les activités :
                                        </div>
                                        <ul className="space-y-1">
                                          {activity.activiteIDs.map((id) => {
                                            const act = activites!.find((a) => a.id === id);
                                            return act ? (
                                              <li key={id} className="text-sm text-gray-600">
                                                {act.nom}
                                              </li>
                                            ) : null;
                                          })}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {activity.note && (
                                    <span className="inline-flex items-center gap-1 text-xs text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded mt-1">
                                      <FaPencilAlt size={10} />
                                      Note
                                    </span>
                                  )}
                                </div>

                                <div className="col-span-2 text-gray-700">
                                  {activity.hrsDebut} - {activity.hrsFin}
                                </div>

                                <div className="col-span-2 text-gray-700 truncate" title={getEntrepriseName(activity.defaultEntrepriseId!)}>
                                  {getEntrepriseName(activity.defaultEntrepriseId!)}
                                </div>

                                <div className="col-span-2 text-gray-700 truncate" title={getLieuName(activity.lieuID!)}>
                                  {getLieuName(activity.lieuID!)}
                                </div>

                                <div className="col-span-2 text-gray-700 truncate" title={getSignalisationName(activity.signalisationId!)}>
                                  {getSignalisationName(activity.signalisationId!)}
                                </div>

                                <div className="col-span-1 flex items-center justify-end gap-1">
                                  <div className="flex items-center" title="Laboratoire requis">
                                    <input
                                      type="checkbox"
                                      checked={activity.isLab}
                                      onChange={() => handleCheckboxChange(activity.id.toString())}
                                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                      id={`lab-${activity.id}`}
                                    />
                                    <FaFlask className="ml-1 text-gray-500" size={14} />
                                  </div>
                                  <button
                                    onClick={() => handleEditActivity(activity)}
                                    className="p-1 text-gray-600 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors duration-200"
                                    title="Modifier l'activité"
                                  >
                                    <FaPencilAlt size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteActivity(dayName, activity.id)}
                                    className="p-1 text-gray-600 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors duration-200"
                                    title="Supprimer l'activité"
                                  >
                                    <FaTrash size={14} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {localActivities[dayName]?.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            Aucune activité planifiée
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {hasUnsavedChanges && (
        <div 
          className="sticky bottom-0 bg-white p-4 border-t border-gray-200 shadow-lg" 
          style={{ zIndex: 900 }}
        >
          <div className="flex justify-end">
            <button
              onClick={handleSaveAllChanges}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-2"
            >
              <FaSave />
              Sauvegarder les modifications
            </button>
          </div>
        </div>
      )}
      {showModal && (
        <CreatePlanifModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setPlanifToEdit(null);
          }}
          onSave={handleSavePlanif}
          planif={planifToEdit}
        />
      )}
    </div>
  );
};

export default PlanningForm;
