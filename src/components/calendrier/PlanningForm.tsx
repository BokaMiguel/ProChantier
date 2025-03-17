import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  FaCalendarDay,
  FaPlus,
  FaSave,
  FaFileImport,
  FaTimes,
  FaLightbulb} from "react-icons/fa";
import { format, startOfWeek, endOfWeek, addDays, parseISO, isValid } from "date-fns";
import { fr } from "date-fns/locale";
// Imports pour le DatePicker de Material UI
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { TextField } from '@mui/material';
import CreatePlanifModal from "./CreatePlanifModal"; 
import ImportPlanifModal from "./ImportPlanifModal";
import { Planif, PlanifActivite } from "../../models/JournalFormModel";
import { useAuth } from "../../context/AuthContext";
import {
  createOrUpdatePlanifChantier,
  createOrUpdatePlanifActivites,
  deletePlanifActivites,
  getPlanifChantierByProjet,
  getPlanifActivites,
  deletePlanifChantier,
  createPlanifWithActivities
} from "../../services/JournalService";
import './PlanningButton.css';
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Clock, Building2, MapPin, AlertTriangle, Beaker, Edit, Trash, Share2, Hammer, Sun, Moon, MessageSquare } from "lucide-react";
import { ConfirmationDialog } from "../ui/confirmation-dialog";

const PlanningForm: React.FC = () => {
  const {
    activites,
    lieux,
    sousTraitants,
    signalisations,
    selectedProject,
  } = useAuth();

  const [activities, setActivities] = useState<{
    [key: string]: Planif[];
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
    [key: string]: Planif[];
  }>(activities);
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [rawPlanifications, setRawPlanifications] = useState<Planif[]>([]);
  const [importablePlanifications, setImportablePlanifications] = useState<Planif[]>([]);
  const [refreshKey, setRefreshKey] = useState(0); // État pour forcer le rafraîchissement de l'interface
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [planifToDelete, setPlanifToDelete] = useState<Planif | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [planifToEdit, setPlanifToEdit] = useState<Planif | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<{
    [key: string]: Set<number>;
  }>({});
  const [selectedImportDate, setSelectedImportDate] = useState<Date | null>(null);

  const [existingPlanifications, setExistingPlanifications] = useState<Map<string, number>>(new Map());

  // Logging pour le débogage
  useEffect(() => {
    console.log("Activités disponibles:", activites);
    console.log("Lieux disponibles:", lieux);
    console.log("État local des planifs:", localActivities);
    console.log("Dimanche planifs:", localActivities.Dimanche);
  }, [activites, lieux, sousTraitants, signalisations, selectedProject, localActivities]);

  // Assurez-vous que les données sont chargées quand un projet est sélectionné
  useEffect(() => {
    if (selectedProject && (!activites || !lieux || !sousTraitants || !signalisations)) {
      console.log('Projet sélectionné mais données manquantes, rechargement...');
      // Les données devraient être chargées automatiquement via le contexte Auth
      // quand selectedProject change
    }
  }, [selectedProject, activites, lieux, sousTraitants, signalisations]);

  // Fonction pour récupérer les planifs
  const fetchPlanifs = async (projectId: number) => {
    try {
      console.log("Récupération des planifs pour le projet:", projectId);
      const planifResponse = await getPlanifChantierByProjet(projectId);
      
      if (planifResponse && Array.isArray(planifResponse)) {
        console.log("Planifs reçues:", planifResponse);
        
        const planifications = planifResponse.map(planif => {
          // Créer les PlanifActivites à partir des activités reçues
          const planifActivites: PlanifActivite[] = planif.activites && Array.isArray(planif.activites) ? 
            planif.activites.map((a: any) => ({
              ID: a.id || 0,
              PlanifID: a.planifID || planif.id || 0,
              debut: a.hrsDebut || planif.hrsDebut || "08:00",
              fin: a.hrsFin || planif.hrsFin || "17:00",
              signalisation: a.signalisationID || 0,
              lieuId: a.lieuID || 0,
              qteLab: a.qteLab || 0,
              activiteId: a.activiteID || 0,
              sousTraitantId: a.sousTraitantID || planif.defaultEntrepriseId || 0,
              isComplete: false // Valeur par défaut puisque le backend ne fournit pas cette information
            })) : [];
          
          // Créer l'objet Planif avec les propriétés correctes
          return {
            ID: planif.id || 0,
            ProjetID: planif.projetID || projectId,
            HrsDebut: planif.hrsDebut || "08:00",
            HrsFin: planif.hrsFin || "17:00",
            DefaultEntrepriseId: planif.defaultEntrepriseId || 0,
            Note: planif.Note || '',
            Date: planif.date || new Date().toISOString().split('T')[0],
            PlanifActivites: planifActivites
          } as Planif;
        });
        
        console.log("Planifications formatées:", planifications);
        setRawPlanifications(planifications);
        distributePlanificationsToWeek(currentDate, planifications);
        return planifications;
      } else {
        console.warn("Aucune planification reçue ou format incorrect");
        setRawPlanifications([]);
        return [];
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des planifs:", error);
      setRawPlanifications([]);
      return [];
    }
  };

  useEffect(() => {
    if (selectedProject) {
      // Ne pas recharger automatiquement si des modifications non sauvegardées sont présentes
      if (!hasUnsavedChanges) {
        console.log("Chargement des planifications du projet", selectedProject.ID);
        fetchPlanifs(selectedProject.ID);
      } else {
        console.log("Modifications non sauvegardées, rechargement des planifications ignoré");
      }
    }
  }, [selectedProject]); // Supprimer refreshKey pour éviter le rechargement automatique

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
    const dates: Date[] = [];
    let current = start;
    
    while (current <= end) {
      dates.push(current);
      current = addDays(current, 1);
    }
    
    return dates;
  }, [start, end]);

  // Fonction pour distribuer les planifications aux bonnes journées
  const distributePlanificationsToWeek = useCallback((date: Date, planifications: Planif[]) => {
    // Calculer le début et la fin de la semaine
    const weekStart = startOfWeek(date, { weekStartsOn: 0 }); // 0 pour dimanche
    const weekEnd = endOfWeek(date, { weekStartsOn: 0 }); // 0 pour dimanche

    // Initialiser la structure des activités par jour - Dimanche en premier
    const newActivities: { [key: string]: Planif[] } = {
      Dimanche: [],
      Lundi: [],
      Mardi: [],
      Mercredi: [],
      Jeudi: [],
      Vendredi: [],
      Samedi: []
    };

    // Mapping des jours en français vers les clés de notre objet
    const dayMapping: { [key: string]: string } = {
      'dimanche': 'Dimanche',
      'lundi': 'Lundi',
      'mardi': 'Mardi',
      'mercredi': 'Mercredi',
      'jeudi': 'Jeudi',
      'vendredi': 'Vendredi',
      'samedi': 'Samedi'
    };

    // Pour chaque planification
    planifications.forEach(planif => {
      console.log("Traitement planification:", planif);
      const planifDate = parseISO(planif.Date);
      
      if (!isValid(planifDate)) {
        console.error('Date invalide:', planif.Date);
        return;
      }

      // Vérifier si la date est dans la semaine courante
      const isInCurrentWeek = planifDate >= weekStart && planifDate <= weekEnd;
      
      // Obtenir le jour de la semaine en français
      const dayName = format(planifDate, 'EEEE', { locale: fr }).toLowerCase();
      const dayNumber = planifDate.getDay(); // 0 pour dimanche, 1 pour lundi, etc.
      
      console.log("Vérification planification:", {
        id: planif.ID,
        date: planif.Date,
        dateObj: format(planifDate, 'yyyy-MM-dd'),
        isInCurrentWeek,
        planifWeekDay: dayName,
        dayNumber: dayNumber,
        weekStart: format(weekStart, 'yyyy-MM-dd'),
        weekEnd: format(weekEnd, 'yyyy-MM-dd'),
        comparison: {
          isAfterOrEqualStart: planifDate >= weekStart,
          isBeforeOrEqualEnd: planifDate <= weekEnd
        }
      });

      if (isInCurrentWeek) {
        // Utiliser le mapping pour obtenir la clé correcte
        const mappedDayName = dayMapping[dayName];
        
        if (mappedDayName && newActivities[mappedDayName]) {
          console.log(`Ajout au ${mappedDayName} (jour ${dayNumber}):`, planif.ID);
          newActivities[mappedDayName].push({
            ID: planif.ID,
            ProjetID: planif.ProjetID,
            HrsDebut: planif.HrsDebut,
            HrsFin: planif.HrsFin,
            DefaultEntrepriseId: planif.DefaultEntrepriseId,
            Note: planif.Note,
            Date: planif.Date,
            PlanifActivites: planif.PlanifActivites
          });
        } else {
          console.error(`Jour non reconnu: ${dayName} (${dayNumber})`);
        }
      } else {
        console.log(`Planification ${planif.ID} hors de la semaine courante:`, planif.Date);
      }
    });
    
    setActivities(newActivities);
    setLocalActivities(newActivities);
    setHasUnsavedChanges(false);
  }, []);

  useEffect(() => {
    if (rawPlanifications.length > 0) {
      distributePlanificationsToWeek(currentDate, rawPlanifications);
    }
  }, [currentDate, rawPlanifications, distributePlanificationsToWeek]);

  // Filtrer les planifications qui peuvent être importées (celles qui ne sont pas déjà dans la semaine courante)
  const filterImportablePlanifications = useCallback(() => {
    if (!rawPlanifications.length) return;
    
    // Toutes les planifications sont importables
    // Nous permettons de réutiliser des planifications même de la semaine courante
    setImportablePlanifications(rawPlanifications);
    
    console.log(`${rawPlanifications.length} planifications disponibles pour l'importation`);
  }, [rawPlanifications]);

  useEffect(() => {
    if (rawPlanifications.length > 0) {
      filterImportablePlanifications();
    }
  }, [rawPlanifications, filterImportablePlanifications]);

  // Fonction pour vérifier et corriger les dates des planifications
  const verifyAndFixPlanificationDates = useCallback(() => {
    console.log("=== Vérification et correction des dates des planifications ===");
    
    setLocalActivities(prevActivities => {
      const correctedActivities = { ...prevActivities };
      
      // Pour chaque jour de la semaine
      for (const day of Object.keys(correctedActivities)) {
        console.log(`Vérification des planifications pour ${day}...`);
        
        // Trouver l'index du jour dans la semaine
        const dayIndex = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].indexOf(day);
        if (dayIndex === -1) {
          console.error(`Jour non reconnu: ${day}`);
          continue;
        }
        
        // Calculer la date correcte pour ce jour
        const correctDate = addDays(startOfWeek(currentDate, { weekStartsOn: 0 }), dayIndex);
        const correctDateStr = format(correctDate, 'yyyy-MM-dd');
        console.log(`Date correcte pour ${day}: ${correctDateStr}`);
        
        // Vérifier et corriger chaque planification
        correctedActivities[day] = correctedActivities[day].map(planif => {
          const planifDate = planif.Date;
          
          // Vérifier si la date est valide et correspond au jour
          let needsCorrection = false;
          
          if (!planifDate || !planifDate.includes('-')) {
            console.log(`Planification ${planif.ID} a une date invalide: ${planifDate}`);
            needsCorrection = true;
          } else {
            // Vérifier si la date correspond au jour de la semaine
            const dayOfWeek = format(parseISO(planifDate), 'EEEE', { locale: fr }).toLowerCase();
            const expectedDay = day.toLowerCase();
            
            if (dayOfWeek !== expectedDay) {
              console.log(`Planification ${planif.ID} a une date (${planifDate}) qui correspond à ${dayOfWeek} mais est dans ${expectedDay}`);
              needsCorrection = true;
            }
          }
          
          // Corriger la date si nécessaire
          if (needsCorrection) {
            console.log(`Correction de la date pour la planification ${planif.ID}: ${correctDateStr}`);
            return { ...planif, Date: correctDateStr };
          }
          
          return planif;
        });
      }
      
      return correctedActivities;
    });
  }, [currentDate]);

  useEffect(() => {
    if (Object.values(localActivities).some(activities => activities.length > 0)) {
      console.log("Planifications chargées, vérification des dates...");
      verifyAndFixPlanificationDates();
    }
  }, [rawPlanifications, verifyAndFixPlanificationDates]);

  // Gérer l'import des planifications sélectionnées
  const handleImportActivities = (planificationsToImport: Planif[]) => {
    if (!planificationsToImport.length) return;
    
    console.log("Planifications à importer:", planificationsToImport);
    
    // Créer une copie des activités locales
    const updatedActivities = { ...localActivities };
    
    // Pour chaque planification à importer
    planificationsToImport.forEach(planif => {
      // Trouver le jour de la semaine correspondant à la date de la planification
      if (planif.Date) {
        try {
          const planifDate = parseISO(planif.Date);
          
          if (isValid(planifDate)) {
            // Obtenir le jour de la semaine en français avec première lettre majuscule
            const dayName = format(planifDate, 'EEEE', { locale: fr });
            const formattedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1).toLowerCase();
            
            // Convertir au format utilisé dans l'interface (première lettre majuscule uniquement)
            const dayKey = Object.keys(updatedActivities).find(
              key => key.toLowerCase() === formattedDayName.toLowerCase()
            );
            
            if (!dayKey) {
              console.error(`Jour non trouvé dans les activités locales: ${formattedDayName}`);
              console.log("Jours disponibles:", Object.keys(updatedActivities));
              return;
            }
            
            console.log(`Importation de la planification #${planif.ID} pour le jour ${dayKey} (date: ${planif.Date})`);
            
            // S'assurer que les activités ont des IDs corrects
            if (planif.PlanifActivites && planif.PlanifActivites.length > 0) {
              planif.PlanifActivites = planif.PlanifActivites.map(act => ({
                ...act,
                // Conserver ID=0 pour les nouvelles activités
                PlanifID: planif.ID
              }));
            }
            
            // Ajouter la planification au jour correspondant
            updatedActivities[dayKey].push(planif);
            console.log(`Planification ajoutée à ${dayKey}:`, planif);
            console.log(`Nombre de planifications pour ${dayKey}:`, updatedActivities[dayKey].length);
          } else {
            console.error(`Date invalide: ${planif.Date}`);
          }
        } catch (error) {
          console.error(`Erreur lors du traitement de la date ${planif.Date}:`, error);
        }
      } else {
        console.error("Planification sans date:", planif);
      }
    });
    
    // Mettre à jour l'état avec les nouvelles activités
    console.log("Activités avant mise à jour:", JSON.stringify(localActivities));
    setLocalActivities(updatedActivities);
    console.log("Activités après mise à jour:", JSON.stringify(updatedActivities));
    
    // Forcer un rafraîchissement de l'interface
    setTimeout(() => {
      setRefreshKey(prev => {
        console.log("Rafraîchissement forcé, nouvelle valeur de refreshKey:", prev + 1);
        return prev + 1;
      });
    }, 100);
    
    setHasUnsavedChanges(true);
    setShowImportModal(false);
  };

  const handleEditActivity = (activity: Planif) => {
    // Stocker les activités sélectionnées dans l'état selectedActivities
    const key = `${activity.Date}-${activity.ID}`;
    if (activity.PlanifActivites) {
      setSelectedActivities(prev => ({
        ...prev,
        [key]: new Set(activity.PlanifActivites.map(a => a.activiteId))
      }));
    }
    setPlanifToEdit(activity);
    setSelectedDay(activity.Date);
    setShowModal(true);
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    
    // Si pas de destination ou si la source et la destination sont identiques, ne rien faire
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
      return;
    }
    
    // Copier l'état actuel
    const newActivities = { ...localActivities };
    
    // Récupérer l'activité déplacée
    const [movedActivity] = newActivities[source.droppableId].splice(source.index, 1);
    
    // Obtenir le jour de la semaine pour la destination
    const dayOfWeek = destination.droppableId.toLowerCase();
    const dayDate = weekDates.find(date => 
      format(date, 'EEEE', { locale: fr }).toLowerCase() === dayOfWeek
    );
    
    if (dayDate) {
      // Mettre à jour la date de l'activité
      const newDate = format(dayDate, 'yyyy-MM-dd');
      
      // Créer une copie modifiée de l'activité avec la nouvelle date
      const updatedActivity = { 
        ...movedActivity,
        Date: newDate
      };
      
      // Insérer l'activité à la nouvelle position
      newActivities[destination.droppableId].splice(destination.index, 0, updatedActivity);
      
      // Mettre à jour l'état
      setLocalActivities(newActivities);
      setHasUnsavedChanges(true);
      
      console.log(`Activité ${updatedActivity.ID} déplacée de ${source.droppableId} à ${destination.droppableId}, nouvelle date: ${newDate}`);
    } else {
      console.error(`Jour non trouvé pour ${destination.droppableId}`);
      // Remettre l'activité à sa place d'origine
      newActivities[source.droppableId].splice(source.index, 0, movedActivity);
      setLocalActivities(newActivities);
    }
  };

  const handleDeletePlanif = async (day: string, id: number) => {
    console.log(`Suppression de la planification ${id} du jour ${day}`);
    
    // Mise à jour des activités locales
    setLocalActivities((prevActivities) => {
      const updatedActivities = { ...prevActivities };
      
      // Filtrer les planifications pour supprimer celle avec l'ID correspondant
      if (updatedActivities[day]) {
        updatedActivities[day] = updatedActivities[day].filter(
          (planif) => planif.ID !== id
        );
      }
      
      return updatedActivities;
    });
    
    // Si la planification a un ID positif, on doit la supprimer du serveur
    if (id > 0) {
      try {
        console.log(`Suppression de la planification ${id} de la base de données`);
        
        // Utiliser l'API DeletePlanifChantier qui supprime aussi les activités liées
        await deletePlanifChantier(id);
        
        console.log(`Planification ${id} et ses activités supprimées avec succès`);
      } catch (error) {
        console.error(`Erreur lors de la suppression de la planification ${id}:`, error);
        alert("Une erreur est survenue lors de la suppression de la planification. Veuillez réessayer.");
        
        // En cas d'erreur, on recharge les planifications pour s'assurer que l'UI est synchronisée
        if (selectedProject) {
          fetchPlanifs(selectedProject.ID);
        }
      }
    } else {
      // Pour les nouvelles planifications (ID <= 0), on les supprime juste de l'interface
      console.log("Nouvelle planification supprimée de l'interface uniquement");
    }
    
    // Marquer qu'il y a des changements
    setHasUnsavedChanges(true);
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setCurrentDate(date);
    }
  };

  const handleSaveActivity = (activity: Planif) => {
    setLocalActivities((prevActivities) => {
      const updatedActivities = { ...prevActivities };

      // Trouver le jour correspondant à l'activité en fonction de sa date
      const dayOfWeek = Object.keys(updatedActivities).find((day) =>
        updatedActivities[day].some((act) => act.ID === activity.ID)
      );

      if (dayOfWeek) {
        // Mettre à jour l'activité existante
        updatedActivities[dayOfWeek] = updatedActivities[dayOfWeek].map((act) =>
          act.ID === activity.ID ? activity : act
        );
      } else if (selectedDay) {
        // Si l'activité n'existe pas dans les activités du jour, on l'ajoute
        // mais seulement si selectedDay n'est pas null
        updatedActivities[selectedDay].push(activity);
      } else {
        // Si selectedDay est null, on utilise le jour de la date de l'activité
        const activityDate = parseISO(activity.Date);
        if (isValid(activityDate)) {
          const dayName = format(activityDate, 'EEEE', { locale: fr });
          const formattedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1).toLowerCase();
          
          if (updatedActivities[formattedDayName]) {
            updatedActivities[formattedDayName].push(activity);
          } else {
            console.error(`Jour non reconnu: ${formattedDayName}`);
          }
        } else {
          console.error('Date invalide pour l\'activité:', activity.Date);
        }
      }
      return updatedActivities;
    });

    setShowModal(false);
  };

  const handleSavePlanif = (planif: Planif) => {
    console.log("Sauvegarde de la planification depuis le modal:", planif);
    
    // Vérifier que la date est au format ISO
    if (!planif.Date || !planif.Date.includes('-')) {
      console.error('Date invalide pour la planification:', planif.Date);
      return;
    }
    
    // Déterminer le jour de la semaine à partir de la date
    const planifDate = parseISO(planif.Date);
    let dayName = format(planifDate, 'EEEE', { locale: fr });
    dayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    
    console.log(`Jour déterminé pour la planification: ${dayName}`);
    
    // Mettre à jour les activités locales
    setLocalActivities((prevActivities) => {
      const updatedActivities = { ...prevActivities };
      
      // Si c'est une modification d'une planif existante, on doit d'abord la supprimer de son ancien emplacement
      if (planifToEdit) {
        // Parcourir tous les jours pour trouver et supprimer l'ancienne entrée
        Object.keys(updatedActivities).forEach(day => {
          const index = updatedActivities[day].findIndex(p => p.ID === planifToEdit.ID);
          if (index !== -1) {
            updatedActivities[day].splice(index, 1);
          }
        });
      }
      
      // S'assurer que le tableau pour le jour cible existe
      if (!updatedActivities[dayName]) {
        updatedActivities[dayName] = [];
      }
      
      // Ajouter ou mettre à jour la planification dans le jour cible
      if (planif.ID > 0) {
        // Planification existante
        updatedActivities[dayName].push(planif);
      } else {
        // {planif.ID > 0 ? Planif # : " Nouvelle Planif\}ication - on garde l'ID à 0 pour la création côté serveur
        updatedActivities[dayName].push(planif);
      }
      
      // Marquer qu'il y a des changements non sauvegardés
      setHasUnsavedChanges(true);
      
      console.log("État local mis à jour avec les activités:", updatedActivities);
      return updatedActivities;
    });
    
    // Fermer le modal et réinitialiser les états
    setShowModal(false);
    setPlanifToEdit(null);
    setSelectedDay(null);
  };

  const handleSavePlanning = async () => {
    if (!selectedProject?.ID) return;
  
    try {
      console.log("Sauvegarde des planifications...");
      
      // Pour chaque jour de la semaine
      for (const day of Object.keys(localActivities)) {
        const activitiesForDay = localActivities[day];
        
        console.log(`Sauvegarde des planifications pour ${day}:`, activitiesForDay.length);
        
        for (const planif of activitiesForDay) {
          console.log(`Sauvegarde de la planification pour ${day}:`, planif);
          
          // Extraire l'ID de l'entreprise par défaut si c'est un objet
          let defaultEntrepriseValue = planif.DefaultEntrepriseId;
          if (defaultEntrepriseValue && typeof defaultEntrepriseValue === 'object') {
            // Utiliser une assertion de type pour accéder aux propriétés
            const entrepriseObj = defaultEntrepriseValue as any;
            defaultEntrepriseValue = entrepriseObj.id || entrepriseObj.ID || 0;
            console.log("Extraction de l'ID de l'entreprise par défaut:", defaultEntrepriseValue);
          }

          const planifData: Planif = {
            ID: planif.ID,
            ProjetID: planif.ProjetID,
            Date: planif.Date,
            HrsDebut: planif.HrsDebut,
            HrsFin: planif.HrsFin,
            DefaultEntrepriseId: defaultEntrepriseValue || 0,
            Note: planif.Note || "",
            PlanifActivites: []
          };
  
          console.log("Données de planification à sauvegarder:", planifData);
  
          // Vérifier si nous avons des activités à sauvegarder
          if (planif.PlanifActivites && planif.PlanifActivites.length > 0) {
            console.log(`Sauvegarde de ${planif.PlanifActivites.length} activités pour la planification`);
            
            // Préparer les activités avec les noms de propriétés du backend
            const activitiesToSave: PlanifActivite[] = planif.PlanifActivites.map(act => ({
              ID: act.ID || 0,
              PlanifID: planif.ID,
              activiteId: act.activiteId,
              debut: act.debut || planif.HrsDebut,
              fin: act.fin || planif.HrsFin,
              sousTraitantId: act.sousTraitantId,
              lieuId: act.lieuId,
              signalisation: act.signalisation,
              qteLab: act.qteLab,
              isComplete: act.isComplete
            }));
            
            // Utiliser la nouvelle fonction pour créer la planification et ses activités en une seule opération
            console.log("Utilisation de createPlanifWithActivities pour sauvegarder la planification et ses activités");
            const result = await createPlanifWithActivities(planifData, activitiesToSave);
            
            console.log("Résultat de la sauvegarde:", result);
            
            if (!result || !result.planification) {
              throw new Error(`Échec de la sauvegarde de la planification pour ${day}`);
            }
            
            console.log(`Planification ${result.planification.id} et ${result.activities.length} activités sauvegardées avec succès`);
          } else {
            // Si pas d'activités, sauvegarder uniquement la planification
            console.log("Aucune activité à sauvegarder, sauvegarde de la planification uniquement");
            const savedPlanif = await createOrUpdatePlanifChantier(planifData);
            
            if (!savedPlanif) {
              throw new Error(`Échec de la sauvegarde de la planification pour ${day}`);
            }
            
            console.log("Planification sauvegardée:", savedPlanif);
          }
        }
      }
  
      console.log("Sauvegarde globale terminée avec succès");
      // Rechargement des planifications après la sauvegarde
      await fetchPlanifs(selectedProject.ID);
      
      setHasUnsavedChanges(false);
      alert("Modifications enregistrées avec succès !");
  
    } catch (error) {
      console.error("Erreur lors de la sauvegarde globale:", error);
      alert("Une erreur est survenue lors de la sauvegarde des planifications");
    }
  };

  const handleSaveAllChanges = async () => {
    if (!selectedProject) {
      alert("Veuillez sélectionner un projet");
      return;
    }

    try {
      console.log("Sauvegarde des modifications...");
      
      // Collecter toutes les planifications de la semaine
      const allPlanifs: Planif[] = [];
      Object.values(localActivities).forEach(dayPlanifs => {
        dayPlanifs.forEach(planif => {
          allPlanifs.push(planif);
        });
      });
      
      console.log("Planifications à sauvegarder:", allPlanifs);
      
      // Pour chaque planification
      for (const planif of allPlanifs) {
        console.log("Sauvegarde de la planification:", planif);
        
        // Extraire l'ID de l'entreprise par défaut si c'est un objet
        let defaultEntrepriseValue = planif.DefaultEntrepriseId;
        if (defaultEntrepriseValue && typeof defaultEntrepriseValue === 'object') {
          // Utiliser une assertion de type pour accéder aux propriétés
          const entrepriseObj = defaultEntrepriseValue as any;
          defaultEntrepriseValue = entrepriseObj.id || entrepriseObj.ID || 0;
          console.log("Extraction de l'ID de l'entreprise par défaut:", defaultEntrepriseValue);
        }

        const planifData: Planif = {
          ID: planif.ID,
          ProjetID: planif.ProjetID,
          Date: planif.Date,
          HrsDebut: planif.HrsDebut,
          HrsFin: planif.HrsFin,
          DefaultEntrepriseId: defaultEntrepriseValue || 0,
          Note: planif.Note || "",
          PlanifActivites: []
        };
        
        // Vérifier si nous avons des activités à sauvegarder
        if (planif.PlanifActivites && planif.PlanifActivites.length > 0) {
          console.log(`Sauvegarde de ${planif.PlanifActivites.length} activités pour la planification`);
          
          // Préparer les activités avec les noms de propriétés du backend
          const activitiesToSave: PlanifActivite[] = planif.PlanifActivites.map(act => ({
            ID: act.ID || 0,
            PlanifID: planif.ID,
            activiteId: act.activiteId,
            debut: act.debut || planif.HrsDebut,
            fin: act.fin || planif.HrsFin,
            sousTraitantId: act.sousTraitantId,
            lieuId: act.lieuId,
            signalisation: act.signalisation,
            qteLab: act.qteLab
          }));
          
          // Utiliser la nouvelle fonction pour créer la planification et ses activités en une seule opération
          console.log("Utilisation de createPlanifWithActivities pour sauvegarder la planification et ses activités");
          const result = await createPlanifWithActivities(planifData, activitiesToSave);
          
          console.log("Résultat de la sauvegarde:", result);
          
          if (!result || !result.planification) {
            throw new Error(`Échec de la sauvegarde de la planification ID=${planif.ID}`);
          }
          
          console.log(`Planification ${result.planification.id} et ${result.activities.length} activités sauvegardées avec succès`);
        } else {
          // Si pas d'activités, sauvegarder uniquement la planification
          console.log("Aucune activité à sauvegarder, sauvegarde de la planification uniquement");
          const savedPlanif = await createOrUpdatePlanifChantier(planifData);
          
          if (!savedPlanif) {
            throw new Error(`Échec de la sauvegarde de la planification ID=${planif.ID}`);
          }
          
          console.log("Planification sauvegardée:", savedPlanif);
        }
      }
      
      // Rafraîchir les données
      if (selectedProject) {
        await fetchPlanifs(selectedProject.ID);
      }
      
      setHasUnsavedChanges(false);
      alert("Toutes les modifications ont été sauvegardées avec succès");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des modifications:", error);
      alert("Une erreur est survenue lors de la sauvegarde des modifications");
    }
  };

  const getSelectedActivitiesForPlanif = (planif: Planif) => {
    const key = `${planif.Date}-${planif.ID}`;
    return selectedActivities[key] || new Set(planif.PlanifActivites.map(a => a.activiteId));
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

  const getSousTraitantName = (id: number) => {
    const sousTraitant = sousTraitants?.find((st) => st.id === id);
    return sousTraitant ? sousTraitant.nom : "Inconnu";
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

  // Fonction pour obtenir le statut de complétion d'une activité
  const getActivityCompletionStatus = (planif: Planif, activiteId: number) => {
    const activite = planif.PlanifActivites.find(pa => pa.activiteId === activiteId);
    
    if (!activite) return "bg-gray-400"; // Gris par défaut si l'activité n'est pas trouvée
    
    if (activite.isComplete) {
      return "bg-green-500"; // Vert si complété
    } else {
      return "bg-gray-400"; // Gris si non commencé
    }
  };

  // Fonction pour afficher les heures spécifiques d'une activité
  const renderActivitySpecificHours = (activity: Planif) => {
    // Si l'activité a des détails spécifiques pour les heures
    if (activity.PlanifActivites && activity.PlanifActivites.length > 0) {
      // Si on a plusieurs activités avec des heures différentes
      if (activity.PlanifActivites.length > 1) {
        return (
          <div className="text-gray-700 text-center">
            <span className="text-xs italic">Horaires multiples</span>
          </div>
        );
      } else {
        // Si on a une seule activité avec des heures spécifiques
        const detail: {
          activiteId: number;
          debut?: string;
          fin?: string;
          isComplete?: boolean;
        } = activity.PlanifActivites[0];
        
        if (detail.debut && detail.fin) {
          return (
            <div className="text-gray-700 text-center">
              {detail.debut} - {detail.fin}
            </div>
          );
        }
      }
    }
    
    // Par défaut, on affiche les heures globales
    return (
      <div className="text-gray-700 text-center">
        {activity.HrsDebut} - {activity.HrsFin}
      </div>
    );
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

  const renderActivity = (activity: Planif) => (
    <div className="font-bold text-gray-900">
      {activity.ID || (
        activity.PlanifActivites && activity.PlanifActivites.length > 0 ? (
          <>
            {getActivitiesNames(activity.PlanifActivites.map(a => a.activiteId))[0]}
            {activity.PlanifActivites.length > 1 && (
              <span className="ml-2 text-xs font-bold text-blue-600">
                +{activity.PlanifActivites.length - 1} autres
              </span>
            )}
          </>
        ) : (
          "Aucune activité"
        )
      )}
    </div>
  );

  // Fonction pour ouvrir le modal d'import
  const handleOpenImportModal = () => {
    setShowImportModal(true);
  };

  // État pour gérer les tooltips
  const [tooltipPosition, setTooltipPosition] = useState<{
    id: string;
    x: number;
    y: number;
    content: React.ReactNode;
  } | null>(null);

  const [modalContent, setModalContent] = useState<{
    title: string;
    content: React.ReactNode;
  } | null>(null);

  const handleCreatePlanif = (day: string) => {
    if (!selectedProject?.ID) return;
    
    console.log("Création d'une planification pour le jour:", day);
    
    // Trouver l'index du jour dans la semaine (0 pour Dimanche, 1 pour Lundi, etc.)
    const dayIndex = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].indexOf(day);
    console.log("Index du jour:", dayIndex);
    
    if (dayIndex === -1) {
      console.error("Jour non reconnu:", day);
      return;
    }
    
    // Calculer la date correspondante dans la semaine en cours
    const dayDate = addDays(startOfWeek(currentDate, { weekStartsOn: 0 }), dayIndex);
    console.log("Date calculée pour le jour:", format(dayDate, 'yyyy-MM-dd'));
    
    const newPlanif: Planif = {
      ID: -Date.now(), // ID négatif temporaire
      ProjetID: selectedProject.ID,
      HrsDebut: "08:00",
      HrsFin: "16:00",
      Note: "",
      Date: format(dayDate, 'yyyy-MM-dd'),
      PlanifActivites: [],
      DefaultEntrepriseId: 0
    };
    
    console.log("Planification créée:", newPlanif);
    
    setSelectedDay(day);
    setPlanifToEdit(newPlanif);
    setShowModal(true);
  };

  const handleEditPlanif = (planif: Planif) => {
    console.log("Édition de la planification:", planif);
    setPlanifToEdit(planif);
    setShowModal(true);
  };

  const handleDeletePlanifFromCard = (planif: Planif) => {
    // Trouver le jour correspondant à la date de la planification
    const planifDate = parseISO(planif.Date);
    const dayName = format(planifDate, 'EEEE', { locale: fr });
    const dayKey = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    
    // Appeler handleDeletePlanif avec le jour et l'ID
    handleDeletePlanif(dayKey, planif.ID);
  };

  const addTestPlanification = () => {
    if (!selectedProject) {
      alert("Veuillez sélectionner un projet");
      return;
    }
    
    // Créer une {planif.ID > 0 ? Planif # : " Nouvelle Planif\}ication de test
    const newPlanif: Planif = {
      ID: -Date.now(), // ID négatif temporaire
      ProjetID: selectedProject.ID,
      HrsDebut: "08:00",
      HrsFin: "17:00",
      DefaultEntrepriseId: sousTraitants && sousTraitants.length > 0 ? sousTraitants[0].id : 0,
      Note: "Test planification",
      Date: format(new Date(), 'yyyy-MM-dd'),
      PlanifActivites: []
    };
    
    // Ajouter une activité de test si des activités sont disponibles
    if (activites && activites.length > 0) {
      const testActivite: PlanifActivite = {
        ID: -Date.now() - 1, // ID négatif temporaire
        PlanifID: newPlanif.ID,
        debut: newPlanif.HrsDebut,
        fin: newPlanif.HrsFin,
        signalisation: signalisations && signalisations.length > 0 ? signalisations[0].id : 0,
        lieuId: lieux && lieux.length > 0 ? lieux[0].id : 0,
        qteLab: null,
        activiteId: activites[0].id,
        isComplete: false
      };
      
      newPlanif.PlanifActivites.push(testActivite);
    }
    
    // Déterminer le jour de la semaine
    const dayName = format(new Date(), 'EEEE', { locale: fr });
    const dayKey = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    
    // Ajouter la planification au jour correspondant
    setLocalActivities(prev => {
      const newActivities = { ...prev };
      newActivities[dayKey] = [...newActivities[dayKey], newPlanif];
      return newActivities;
    });
    
    setHasUnsavedChanges(true);
    console.log("Planification de test ajoutée:", newPlanif);
  };

  const handleAddPlanif = (day: string) => {
    if (!selectedProject) {
      alert("Veuillez sélectionner un projet");
      return;
    }
    
    // Trouver la date correspondant au jour
    const dayIndex = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"]
      .indexOf(day.toLowerCase());
    
    if (dayIndex === -1) {
      console.error("Jour invalide:", day);
      return;
    }
    
    // Calculer la date en ajoutant le nombre de jours à la date de début de semaine
    const planifDate = format(addDays(start, dayIndex), 'yyyy-MM-dd');
    
    // Créer une {planif.ID > 0 ? Planif # : " Nouvelle Planif\}ication vide
    const newPlanif: Planif = {
      ID: -Date.now(), // ID négatif temporaire
      ProjetID: selectedProject.ID,
      HrsDebut: "08:00",
      HrsFin: "17:00",
      DefaultEntrepriseId: sousTraitants && sousTraitants.length > 0 ? sousTraitants[0].id : 0,
      Note: "",
      Date: planifDate,
      PlanifActivites: []
    };
    
    // Définir le jour sélectionné et la planification à éditer
    setSelectedDay(day);
    setPlanifToEdit(newPlanif);
    setShowModal(true);
  };

  // Fonction pour ouvrir la modal de confirmation de suppression
  const handleConfirmDeletePlanif = (day: string, planif: Planif) => {
    setSelectedDay(day);
    setPlanifToDelete(planif);
    setShowDeleteConfirmation(true);
  };

  const handleImportForDay = (day: string, date: Date) => {
    console.log(`Importation de planifications pour le jour ${day} (date: ${format(date, 'yyyy-MM-dd')})`);
    setSelectedImportDate(date);
    setShowImportModal(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* En-tête sticky avec DatePicker et boutons */}
      <div className="sticky top-0 z-10 bg-white p-4 border-b flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
              <DatePicker
                label="Semaine du"
                value={currentDate}
                onChange={(newDate) => {
                  if (newDate) handleDateChange(newDate);
                }}
                slots={{
                  textField: TextField
                }}
                slotProps={{
                  textField: { 
                    size: "small",
                    sx: { width: '150px' },
                    variant: "outlined" 
                  }
                }}
              />
            </LocalizationProvider>
          </div>
          <div className="text-sm text-gray-600">
            {format(start, "EEEE d MMMM", { locale: fr })} au{" "}
            {format(end, "EEEE d MMMM yyyy", { locale: fr })}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded transition-colors duration-200"
            title="Ajouter une planification"
          >
            <FaPlus className="mr-1" /> Ajouter
          </button>
          
          <button
            onClick={handleOpenImportModal}
            className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded transition-colors duration-200"
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
            } text-white px-3 py-2 rounded transition-colors duration-200`}
            disabled={!hasUnsavedChanges}
            title={
              hasUnsavedChanges
                ? "Enregistrer les modifications"
                : "Aucune modification à enregistrer"
            }
          >
            <div className="flex items-center">
              <FaSave className="mr-2" />
              <span>Sauvegarder les modifications</span>
            </div>
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="p-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 gap-4">
            {weekDates.map((date: Date, index: number) => {
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
                        <div className="flex items-center">
                          <FaCalendarDay className="mr-2" />
                          <span className="font-bold">{dayName}</span>
                          <span className="text-white/90 ml-2">{format(date, 'd MMMM yyyy', { locale: fr })}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleImportForDay(dayName, date)}
                            className="p-1 text-white hover:text-blue-200 transition-colors duration-200"
                            title="Importer des planifications pour ce jour"
                          >
                            <FaFileImport size={18} />
                          </button>
                          <button
                            onClick={() => handleCreatePlanif(dayName)}
                            className="p-1 text-white hover:text-blue-200 transition-colors duration-200"
                            title="Ajouter une nouvelle planification"
                          >
                            <FaPlus size={20} />
                          </button>
                        </div>
                      </div>
                      
                      {/* Liste des activités */}
                      <div className="p-4 space-y-3">
                        {localActivities[dayName]?.map((activity, index) => (
                          <Draggable key={activity.ID} draggableId={`planif-${activity.ID}`} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`mb-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden ${
                                  snapshot.isDragging ? "shadow-xl" : ""
                                }`}
                              >
                                {/* Appel direct au rendu sans double Card */}
                                {(() => {
                                  // Utiliser l'activité réelle au lieu de l'exemple
                                  const planif = activity;
                                  
                                  return (
                                    <>
                                      <CardHeader className="bg-blue-600 text-white p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div className="flex flex-col gap-1">
                                          <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="bg-white/20 text-white border-white/30 px-3 py-1 text-sm font-medium">
                                              {planif.ID > 0 ? `Planif #${planif.ID}` : "Nouvelle Planif"}
                                            </Badge>
                                            <div className="flex gap-1 ml-auto md:ml-0">
                                              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8"
                                                onClick={(e) => { 
                                                  e.stopPropagation(); 
                                                  handleEditPlanif(planif); 
                                                }}>
                                                <Edit className="h-4 w-4" />
                                              </Button>
                                              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8">
                                                <Share2 className="h-4 w-4" />
                                              </Button>
                                              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleConfirmDeletePlanif(dayName, planif);
                                                }}>
                                                <Trash className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-4 mt-1">
                                            <div className="flex items-center gap-2">
                                              <Clock className="h-5 w-5 text-white/80" />
                                              <span className="font-medium">{planif.HrsDebut} - {planif.HrsFin}</span>
                                            </div>
                                            <Badge className="bg-white/30 hover:bg-white/40 text-white border-0">
                                              {planif.PlanifActivites.length} activités
                                            </Badge>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <div className="bg-white/20 p-2 rounded-full">
                                            <Building2 className="h-5 w-5" />
                                          </div>
                                          <div className="flex flex-col">
                                            <span className="text-sm text-white/80">Entreprise</span>
                                            <span className="font-medium">{sousTraitants?.find(st => st.id === planif.DefaultEntrepriseId)?.nom || 'Inconnue'}</span>
                                          </div>
                                        </div>
                                      </CardHeader>
                                      
                                      {planif.Note && planif.Note.trim() !== "" && (
                                        <div className="bg-amber-50 p-4 border-b border-amber-100">
                                          <div className="flex items-start gap-3">
                                            <MessageSquare className="h-5 w-5 text-amber-500 mt-0.5" />
                                            <div className="flex-1">
                                              <h3 className="text-sm font-medium text-amber-800 mb-1 text-left">Commentaire global</h3>
                                              <p className="text-sm text-amber-700 text-left">
                                                {planif.Note}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      <CardContent className="p-0">
                                        <div className="overflow-x-auto">
                                          <Table>
                                            <TableHeader>
                                              <TableRow className="bg-gray-50 hover:bg-gray-50">
                                                <TableHead className="font-medium">
                                                  <div className="flex items-center gap-2">
                                                    <Hammer className="h-4 w-4 text-gray-500" />
                                                    <span>Activité</span>
                                                  </div>
                                                </TableHead>
                                                <TableHead className="font-medium">
                                                  <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-gray-500" />
                                                    <span>Horaire</span>
                                                  </div>
                                                </TableHead>
                                                <TableHead className="font-medium">
                                                  <div className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-gray-500" />
                                                    <span>Entreprise</span>
                                                  </div>
                                                </TableHead>
                                                <TableHead className="font-medium">
                                                  <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-gray-500" />
                                                    <span>Lieu</span>
                                                  </div>
                                                </TableHead>
                                                <TableHead className="font-medium text-center">
                                                  <div className="flex items-center justify-center">
                                                    <AlertTriangle className="h-4 w-4 text-gray-500" />
                                                    <span>Signal.</span>
                                                  </div>
                                                </TableHead>
                                                <TableHead className="font-medium text-center">
                                                  <div className="flex items-center justify-center">
                                                    <Beaker className="h-4 w-4 text-gray-500" />
                                                    <span>Lab</span>
                                                  </div>
                                                </TableHead>
                                              </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                              {planif.PlanifActivites.map((activite, index) => {
                                                const isNightActivity = (time: string) => {
                                                  const hour = parseInt(time.split(':')[0]);
                                                  return hour >= 17 || hour < 7;
                                                };

                                                const TimeIcon = isNightActivity(activite.debut) ? Moon : Sun;
                                                const timeIconColor = isNightActivity(activite.debut) ? "text-indigo-500" : "text-amber-500";
                                                
                                                // Trouver les informations de l'activité
                                                const activiteInfo = activites?.find(a => a.id === activite.activiteId);
                                                const lieuInfo = lieux?.find(l => l.id === activite.lieuId);
                                                const signalInfo = signalisations?.find(s => s.id === activite.signalisation);
                                                
                                                // Utiliser le sous-traitant spécifique à l'activité s'il est défini, sinon utiliser celui par défaut de la planification
                                                const entrepriseInfo = activite.sousTraitantId 
                                                  ? sousTraitants?.find(st => st.id === activite.sousTraitantId)
                                                  : sousTraitants?.find(st => st.id === planif.DefaultEntrepriseId);

                                                return (
                                                  <TableRow key={index} className="border-b hover:bg-gray-50/50 transition-colors">
                                                    <TableCell className="font-medium">
                                                      <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
                                                          ACT {index + 1}
                                                        </Badge>
                                                        <span>{activiteInfo?.nom || `Activité ${index + 1}`}</span>
                                                      </div>
                                                    </TableCell>
                                                    <TableCell>
                                                      <div className="flex items-center gap-2">
                                                        <TimeIcon className={`h-4 w-4 ${timeIconColor}`} />
                                                        <span>{activite.debut} - {activite.fin}</span>
                                                      </div>
                                                    </TableCell>
                                                    <TableCell>
                                                      <div className="flex items-center gap-2">
                                                        <Building2 className="h-4 w-4 text-gray-400" />
                                                        <span>{entrepriseInfo?.nom || 'Inconnue'}</span>
                                                      </div>
                                                    </TableCell>
                                                    <TableCell>
                                                      <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-gray-400" />
                                                        <span>{lieuInfo?.nom || `EL-${activite.lieuId}`}</span>
                                                      </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                      <div className="flex items-center justify-center">
                                                        <div className="flex items-center gap-2">
                                                          <AlertTriangle className="h-4 w-4 text-gray-400" />
                                                          <span>{signalInfo?.nom || 'Gauche'}</span>
                                                        </div>
                                                      </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                      {activite.qteLab !== null && activite.qteLab !== undefined ? (
                                                        <Badge variant="secondary" className="rounded-full px-2 py-0.5 font-normal">
                                                          {activite.qteLab}
                                                        </Badge>
                                                      ) : (
                                                        <span className="text-gray-400">-</span>
                                                      )}
                                                    </TableCell>
                                                  </TableRow>
                                                );
                                              })}
                                            </TableBody>
                                          </Table>
                                        </div>
                                      </CardContent>
                                    </>
                                  );
                                })()}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {localActivities[dayName]?.length === 0 && (
                          <div className="text-center text-gray-400 p-4">
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

      {hasUnsavedChanges && !showDeleteConfirmation && (
        <div 
          className="sticky bottom-0 bg-white p-4 border-t border-gray-200 shadow-lg" 
          style={{ zIndex: 900 }}
        >
          <div className="flex justify-end">
            <button
              onClick={handleSaveAllChanges}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
            >
              <div className="flex items-center">
                <FaSave className="mr-2" />
                <span>Sauvegarder les modifications</span>
              </div>
            </button>
          </div>
        </div>
      )}
      {showModal && (
        <CreatePlanifModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          planif={planifToEdit}
          onSave={handleSavePlanif}
        />
      )}
      {showDeleteConfirmation && (
        <ConfirmationDialog
          isOpen={showDeleteConfirmation}
          onClose={() => setShowDeleteConfirmation(false)}
          title="Confirmation de suppression"
          content={
            <div className="text-gray-700">
              <p className="mb-2">Êtes-vous sûr de vouloir supprimer cette planification ?</p>
              <p className="text-sm text-gray-500">Cette action est irréversible.</p>
            </div>
          }
          onConfirm={() => {
            if (planifToDelete && selectedDay) {
              handleDeletePlanif(selectedDay, planifToDelete.ID);
              setShowDeleteConfirmation(false);
              setPlanifToDelete(null);
            }
          }}
          confirmText="Supprimer"
          cancelText="Annuler"
          variant="destructive"
        />
      )}
      {showImportModal && (
        <ImportPlanifModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          planifications={importablePlanifications}
          onImport={handleImportActivities}
          preselectedDate={selectedImportDate}
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
      {modalContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">{modalContent.title}</h2>
              <button 
                onClick={() => setModalContent(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div>
              {modalContent.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanningForm;
