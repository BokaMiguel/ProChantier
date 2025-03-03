import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import ImportPlanifModal from "./ImportPlanifModal";
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
  } = useAuth();

  // Logs pour déboguer
  useEffect(() => {
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
    Dimanche: [],
    Lundi: [],
    Mardi: [],
    Mercredi: [],
    Jeudi: [],
    Vendredi: [],
    Samedi: []
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

  // State pour stocker toutes les planifications brutes
  const [rawPlanifications, setRawPlanifications] = useState<ActivitePlanif[]>([]);
  
  // State pour stocker les planifications disponibles pour l'import (celles qui ne sont pas déjà dans la semaine courante)
  const [importablePlanifications, setImportablePlanifications] = useState<ActivitePlanif[]>([]);

  // Calcul des dates de début et fin de semaine
  const start = useMemo(() => {
    const startDate = startOfWeek(currentDate, { weekStartsOn: 0 }); // 0 pour dimanche
    console.log("Début de semaine:", startDate);
    return startDate;
  }, [currentDate]);

  const end = useMemo(() => {
    const endDate = endOfWeek(currentDate, { weekStartsOn: 0 }); // 0 pour dimanche
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

  // 1. useEffect pour le fetch uniquement
  useEffect(() => {
    const fetchPlanifications = async () => {
      if (!selectedProject?.ID) return;
      
      try {
        const planifResponse = await getPlanifChantierByProjet(selectedProject.ID);
        console.log("Planifications brutes reçues:", planifResponse);
        
        if (planifResponse && Array.isArray(planifResponse)) {
          const planifications = planifResponse.map(planif => ({
            id: planif.id,
            projetId: selectedProject.ID,
            lieuID: planif.lieuID,
            hrsDebut: planif.hrsDebut,
            hrsFin: planif.hrsFin,
            defaultEntrepriseId: planif.defaultEntrepriseId,
            signalisationId: planif.signalisationId,
            note: planif.note || '',
            isLab: planif.isLab || false,
            labQuantity: planif.labQuantity || null,
            date: planif.date,
            activiteIDs: planif.activites ? planif.activites.map((a: { activiteID: number }) => a.activiteID) : [],
            quantite: planif.quantite || 0,
            nomActivite: ''
          }));

          setRawPlanifications(planifications);
        }
      } catch (error) {
        console.error('Erreur lors du fetch:', error);
      }
    };

    fetchPlanifications();
  }, [selectedProject?.ID]); // Dépendance uniquement sur le changement de projet

  // 2. Fonction séparée pour distribuer les planifications aux bonnes journées
  const distributePlanificationsToWeek = useCallback((date: Date, planifications: ActivitePlanif[]) => {
    console.log("=== Distribution des planifications ===");
    console.log("Date courante:", format(date, 'dd/MM/yyyy'));
    
    // Calculer le début et la fin de la semaine
    const weekStart = startOfWeek(date, { weekStartsOn: 0 }); // 0 pour dimanche
    const weekEnd = endOfWeek(date, { weekStartsOn: 0 }); // 0 pour dimanche
    
    console.log("Semaine du", format(weekStart, 'dd/MM/yyyy'), "au", format(weekEnd, 'dd/MM/yyyy'));

    // Initialiser la structure des activités par jour - Dimanche en premier
    const newActivities: { [key: string]: ActivitePlanif[] } = {
      Dimanche: [],
      Lundi: [],
      Mardi: [],
      Mercredi: [],
      Jeudi: [],
      Vendredi: [],
      Samedi: []
    };

    // Pour chaque planification
    planifications.forEach(planif => {
      const planifDate = parseISO(planif.date);
      
      if (!isValid(planifDate)) {
        console.error('Date invalide:', planif.date);
        return;
      }

      // Vérifier si la date est dans la semaine courante
      const isInCurrentWeek = planifDate >= weekStart && planifDate <= weekEnd;
      
      console.log("Vérification planification:", {
        id: planif.id,
        date: planif.date,
        isInCurrentWeek,
        planifWeekDay: format(planifDate, 'EEEE', { locale: fr }),
        weekStart: format(weekStart, 'dd/MM/yyyy'),
        weekEnd: format(weekEnd, 'dd/MM/yyyy')
      });

      if (isInCurrentWeek) {
        const dayName = format(planifDate, 'EEEE', { locale: fr });
        const formattedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1).toLowerCase();
        
        if (newActivities[formattedDayName]) {
          console.log(`Ajout au ${formattedDayName}:`, planif.id);
          newActivities[formattedDayName].push(planif);
        }
      }
    });

    console.log("Distribution finale:", newActivities);
    setActivities(newActivities);
    setLocalActivities(newActivities);
    setHasUnsavedChanges(false);
  }, []);

  // 3. useEffect pour déclencher la distribution quand la date change
  useEffect(() => {
    if (rawPlanifications.length > 0) {
      distributePlanificationsToWeek(currentDate, rawPlanifications);
      
      // Filtrer les planifications importables (celles qui ne sont pas déjà dans la semaine courante)
      filterImportablePlanifications();
    }
  }, [currentDate, rawPlanifications, distributePlanificationsToWeek]);
  
  // Filtrer les planifications qui peuvent être importées (celles qui ne sont pas déjà dans la semaine courante)
  const filterImportablePlanifications = useCallback(() => {
    if (!rawPlanifications.length) return;
    
    // Calculer les dates de la semaine courante au format ISO
    const currentWeekDatesISO = weekDates.map(date => format(date, 'yyyy-MM-dd'));
    
    // Filtrer les planifications qui ne sont pas déjà dans la semaine courante
    const importable = rawPlanifications.filter(planif => {
      const planifDate = planif.date.split('T')[0];
      return !currentWeekDatesISO.includes(planifDate);
    });
    
    setImportablePlanifications(importable);
  }, [rawPlanifications, weekDates]);
  
  // Gérer l'import des planifications sélectionnées
  const handleImportActivities = (planificationsToImport: ActivitePlanif[]) => {
    if (!planificationsToImport.length) return;
    
    console.log("Planifications à importer:", planificationsToImport);
    
    // Créer une copie des activités locales
    const updatedActivities = { ...localActivities };
    
    // Pour chaque planification à importer
    planificationsToImport.forEach(planif => {
      // Déterminer le jour de la semaine pour cette planification
      const planifDate = new Date(planif.date);
      const dayOfWeekNumber = planifDate.getDay(); // 0 pour dimanche, 1 pour lundi, etc.
      
      // Utiliser l'index du jour pour obtenir le nom du jour dans notre tableau daysOfWeek
      const targetDay = daysOfWeek[dayOfWeekNumber];
      
      console.log("Jour d'origine:", format(planifDate, 'EEEE', { locale: fr }));
      console.log("Jour cible:", targetDay);
      console.log("Index du jour:", dayOfWeekNumber);
      
      // Calculer la nouvelle date en ajoutant le nombre de jours à la date de début de semaine
      const newDate = format(addDays(start, dayOfWeekNumber), 'yyyy-MM-dd');
      console.log("Nouvelle date calculée:", newDate);
      
      // Vérifier si une planification similaire existe déjà pour ce jour
      const existingSimilarPlanif = updatedActivities[targetDay]?.some(existingPlanif => {
        // Si les IDs d'activités sont identiques ou très similaires, considérer comme doublon
        if (!existingPlanif.activiteIDs || !planif.activiteIDs) return false;
        
        // Vérifier si au moins une activité est commune (pour éviter les doublons)
        return planif.activiteIDs.some(id => existingPlanif.activiteIDs?.includes(id));
      });
      
      // Si une planification similaire existe déjà, ne pas l'ajouter
      if (existingSimilarPlanif) {
        console.log("Une planification similaire existe déjà, ignorée:", planif);
        return;
      }
      
      // Créer une nouvelle planification avec la date mise à jour
      const newPlanif: ActivitePlanif = {
        ...planif,
        id: -Date.now() - Math.floor(Math.random() * 1000), // ID temporaire négatif unique
        date: newDate
      };
      
      // Ajouter la planification au jour cible
      if (!updatedActivities[targetDay]) {
        updatedActivities[targetDay] = [];
      }
      updatedActivities[targetDay].push(newPlanif);
      
      // Mettre à jour l'état des activités sélectionnées
      const key = `${targetDay}-${newPlanif.id}`;
      setSelectedActivities(prev => ({
        ...prev,
        [key]: new Set(newPlanif.activiteIDs || [])
      }));
    });
    
    // Mettre à jour l'état local
    setLocalActivities(updatedActivities);
    setHasUnsavedChanges(true);
    
    console.log(`${planificationsToImport.length} planification(s) importée(s) avec succès`);
    console.log("Activités après importation:", updatedActivities);
  };

  const handleSavePlanif = async (planif: ActivitePlanif, selectedActivities: Set<number>) => {
    if (!selectedDay || !selectedProject?.ID) {
      console.error("Aucun jour sélectionné ou projet non sélectionné");
      return;
    }

    const selectedActivitiesArray = Array.from(selectedActivities);
    console.log("Activités sélectionnées pour la sauvegarde:", selectedActivitiesArray);
    
    // Obtenir le jour de la semaine à partir de la date de la planification
    let planifDate;
    let targetDay: string;
    
    if (planif.date && planif.date !== "") {
      // Si une date existe déjà, l'utiliser
      planifDate = parseISO(planif.date);
      const dayOfWeek = format(planifDate, 'EEEE', { locale: fr });
      targetDay = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
    } else {
      // Pour une nouvelle planification, utiliser le jour sélectionné dans la semaine en cours
      targetDay = selectedDay;
      // Trouver l'index du jour dans la semaine (0 pour Dimanche, 1 pour Lundi, etc.)
      const dayIndex = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].indexOf(selectedDay);
      // Calculer la date correspondante dans la semaine en cours
      planifDate = addDays(start, dayIndex);
      // Mettre à jour la date de la planification
      planif.date = format(planifDate, 'yyyy-MM-dd');
    }
    
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
        updatedActivities[targetDay].push(updatedPlanif);
      } else {
        // Nouvelle planif - générer un ID temporaire négatif
        const tempId = -Date.now();
        updatedActivities[targetDay].push({
          ...updatedPlanif,
          id: tempId
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
      const dayIndex = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"]
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

  const handleDeleteActivity = (day: string, id: number) => {
    // Confirmer la suppression
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette planification ?")) {
      return;
    }
    
    setLocalActivities((prev) => {
      const updatedActivities = { ...prev };
      updatedActivities[day] = updatedActivities[day].filter((activity) => activity.id !== id);
      return updatedActivities;
    });
    
    // Supprimer aussi les activités sélectionnées pour cette planif
    setSelectedActivities((prev) => {
      const newState = { ...prev };
      delete newState[`${day}-${id}`];
      return newState;
    });
    
    setHasUnsavedChanges(true);
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

  const handleSavePlanning = async () => {
    if (!selectedProject?.ID) return;

    try {
      // Pour chaque jour
      for (const day of Object.keys(localActivities)) {
        const activitiesForDay = localActivities[day];
        
        for (const activity of activitiesForDay) {
          console.log(`Sauvegarde de la planification pour ${day}:`, activity);

          try {
            const dayIndex = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].indexOf(day);
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
    return ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
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

  // Fonction pour ouvrir le modal d'import
  const handleOpenImportModal = () => {
    // Vérifier si nous avons des planifications importables
    if (importablePlanifications.length === 0) {
      alert("Aucune planification disponible pour l'importation. Toutes les planifications existantes sont déjà dans la semaine courante.");
      return;
    }
    
    setShowImportModal(true);
  };

  // État pour gérer les tooltips
  const [tooltipPosition, setTooltipPosition] = useState<{
    id: string;
    x: number;
    y: number;
    content: React.ReactNode;
  } | null>(null);

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* En-tête sticky avec DatePicker et boutons */}
      <div className="sticky top-0 z-10 bg-white p-4 border-b flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <FaCalendarDay className="text-blue-500 mr-2" />
            <DatePicker
              selected={currentDate}
              onChange={handleDateChange}
              locale={fr}
              dateFormat="dd/MM/yyyy"
              className="border rounded p-2 w-32"
            />
          </div>
          <div className="text-sm text-gray-600">
            {format(start, "EEEE d MMMM", { locale: fr })} au{" "}
            {format(end, "EEEE d MMMM yyyy", { locale: fr })}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded transition duration-200"
            title="Ajouter une planification"
          >
            <FaPlus className="mr-1" /> Ajouter
          </button>
          
          <button
            onClick={handleOpenImportModal}
            className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded transition duration-200"
            title="Importer des planifications existantes"
            disabled={importablePlanifications.length === 0}
          >
            <FaFileImport className="mr-1" /> Importer
          </button>

          <button
            onClick={handleSavePlanning}
            className={`flex items-center ${
              hasUnsavedChanges
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-gray-400"
            } text-white px-3 py-2 rounded transition duration-200`}
            disabled={!hasUnsavedChanges}
            title={
              hasUnsavedChanges
                ? "Enregistrer les modifications"
                : "Aucune modification à enregistrer"
            }
          >
            <FaSave className="mr-1" /> Enregistrer
          </button>
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
                        <div className="col-span-3 flex items-center gap-2 justify-center">
                          <FaClipboardList size={14} className="text-blue-500" />
                          <span>Activité</span>
                        </div>
                        <div className="col-span-2 flex items-center gap-2 justify-center">
                          <FaClock size={14} className="text-blue-500" />
                          <span>Horaire</span>
                        </div>
                        <div className="col-span-2 flex items-center gap-2 justify-center">
                          <FaBuilding size={14} className="text-blue-500" />
                          <span>Entreprise</span>
                        </div>
                        <div className="col-span-2 flex items-center gap-2 justify-center">
                          <FaMapMarkerAlt size={14} className="text-blue-500" />
                          <span>Lieu</span>
                        </div>
                        <div className="col-span-2 flex items-center gap-2 justify-center">
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
                                    <div className="group relative inline-block">
                                      <span className="inline-flex items-center gap-1 text-xs text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded mt-1 cursor-pointer">
                                        <FaPencilAlt size={10} />
                                        Note
                                      </span>
                                      <div 
                                        className="absolute invisible group-hover:visible bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px] mt-1 left-0" 
                                        style={{ 
                                          zIndex: 1000,
                                          transform: 'translateY(0)',
                                          pointerEvents: 'auto'
                                        }}
                                      >
                                        <div className="text-sm text-gray-600 whitespace-pre-wrap">
                                          {activity.note}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="col-span-2 text-gray-700 justify-center">
                                  {activity.hrsDebut} - {activity.hrsFin}
                                </div>

                                <div className="col-span-2 text-gray-700 truncate justify-center" title={getEntrepriseName(activity.defaultEntrepriseId!)}>
                                  {getEntrepriseName(activity.defaultEntrepriseId!)}
                                </div>

                                <div className="col-span-2 text-gray-700 truncate justify-center" title={getLieuName(activity.lieuID!)}>
                                  {getLieuName(activity.lieuID!)}
                                </div>

                                <div className="col-span-2 text-gray-700 truncate justify-center" title={getSignalisationName(activity.signalisationId!)}>
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
      {showImportModal && (
        <ImportPlanifModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={handleImportActivities}
          currentWeekDates={weekDates}
          existingPlanifications={importablePlanifications}
        />
      )}
      {tooltipPosition && (
        <div 
          className="fixed bg-white border border-gray-200 shadow-lg rounded-md p-3 min-w-[200px] max-w-[300px]" 
          style={{ 
            zIndex: 9999, 
            left: `${tooltipPosition.x}px`, 
            top: `${tooltipPosition.y}px`,
          }}
        >
          {tooltipPosition.content}
        </div>
      )}
    </div>
  );
};

export default PlanningForm;
