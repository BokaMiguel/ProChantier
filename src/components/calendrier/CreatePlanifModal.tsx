import React, { useState, useEffect } from "react";
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaClock,
  FaCalendarAlt,
  FaSearch,
  FaClipboardList,
  FaArrowRight,
  FaArrowLeft,
  FaCheck,
  FaTimes,
  FaSign,
  FaFlask,
  FaPencilAlt,
  FaInfoCircle,
  FaPlus,
  FaSave,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { Planif, PlanifActivite } from "../../models/JournalFormModel";
import "../../styles/checkbox.css";

interface CreatePlanifModalProps {
  isOpen: boolean;
  planif: Planif | null;
  onClose: () => void;
  onSave: (planif: Planif) => void;
}

const CreatePlanifModal: React.FC<CreatePlanifModalProps> = ({
  isOpen,
  onClose,
  planif,
  onSave,
}) => {
  // État pour suivre l'étape actuelle (1, 2 ou 3)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  
  // États pour les données de base
  const [entrepriseId, setEntrepriseId] = useState<number | null>(null);
  const [lieuId, setLieuId] = useState<number | null>(null);
  const [signalisationId, setSignalisationId] = useState<number | null>(null);
  const [startHour, setStartHour] = useState<string>("");
  const [endHour, setEndHour] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [selectedActivities, setSelectedActivities] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLab, setIsLab] = useState<boolean>(false);
  const [labQuantity, setLabQuantity] = useState<number | null>(null);
  
  // État pour l'étape 2 - activités en cours d'édition
  const [currentActivityIndex, setCurrentActivityIndex] = useState<number>(0);
  const [activitiesData, setActivitiesData] = useState<PlanifActivite[]>([]);
  
  // État pour l'étape 3 - finalisation
  const [planifDate, setPlanifDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [globalStartHour, setGlobalStartHour] = useState<string>("");
  const [globalEndHour, setGlobalEndHour] = useState<string>("");
  const [defaultEntreprise, setDefaultEntreprise] = useState<number | null>(null);
  const [globalNote, setGlobalNote] = useState<string>("");
  
  const { lieux, sousTraitants, signalisations, activites, selectedProject } = useAuth();

  useEffect(() => {
    if (planif) {
      setEntrepriseId(planif.DefaultEntrepriseId ?? null);
      setStartHour(planif.HrsDebut ?? "");
      setEndHour(planif.HrsFin ?? "");
      setNotes(planif.Note ?? "");
      setPlanifDate(planif.Date);
      setGlobalNote(planif.Note ?? "");
      setGlobalStartHour(planif.HrsDebut ?? "");
      setGlobalEndHour(planif.HrsFin ?? "");
      setDefaultEntreprise(planif.DefaultEntrepriseId ?? null);
      
      // Pré-sélectionner les activités existantes
      if (planif.PlanifActivites && planif.PlanifActivites.length > 0) {
        // Créer un ensemble des IDs d'activités existantes
        const existingActivitiesSet = new Set(
          planif.PlanifActivites.map(activity => activity.activiteId)
        );
        setSelectedActivities(existingActivitiesSet);
        
        // Initialiser les données des activités existantes
        setActivitiesData(planif.PlanifActivites.map(activity => ({
          ...activity,
          isComplete: false // En mode édition, nous commençons avec isComplete à false pour permettre la modification
        })));
        
        // En mode édition, commencer à l'étape 2 pour permettre la modification des activités
        setCurrentStep(2);
        
        // Définir l'index sur la première activité
        if (planif.PlanifActivites.length > 0) {
          setCurrentActivityIndex(0);
        }
      }
    } else {
      setEntrepriseId(null);
      setStartHour("");
      setEndHour("");
      setNotes("");
      setSelectedActivities(new Set());
      setActivitiesData([]);
      setPlanifDate(new Date().toISOString().split('T')[0]);
      setGlobalNote("");
      setGlobalStartHour("");
      setGlobalEndHour("");
      setDefaultEntreprise(null);
      setCurrentStep(1);
    }
  }, [planif]);

  useEffect(() => {
    if (!isLab) {
      setLabQuantity(null);
    }
  }, [isLab]);

  useEffect(() => {
    if (currentStep === 2 && selectedActivities.size > 0) {
      // Obtenir les IDs d'activités déjà présentes dans activitiesData
      const existingActivityIds = new Set(activitiesData.map(a => a.activiteId));
      
      // Convertir les activités sélectionnées en tableau
      const selectedActivitiesArray = Array.from(selectedActivities);
      
      // Filtrer pour ne garder que les nouvelles activités qui ne sont pas déjà dans activitiesData
      const newSelectedActivities = selectedActivitiesArray.filter(id => !existingActivityIds.has(id));
      
      if (newSelectedActivities.length > 0) {
        // Initialiser les données des nouvelles activités sélectionnées
        const newActivitiesData = newSelectedActivities.map((activityId, index) => {
          // Pour la première nouvelle activité, utiliser l'heure de fin de la dernière activité existante ou l'heure de début globale
          // Pour les activités suivantes, utiliser l'heure de fin de l'activité précédente comme heure de début
          let activityStartHour = startHour || "";
          let activityEndHour = endHour || "";
          
          // Si nous avons des activités existantes, commencer après la dernière
          if (activitiesData.length > 0) {
            const lastActivity = activitiesData[activitiesData.length - 1];
            activityStartHour = lastActivity.fin;
          } else if (index > 0) {
            // Si ce n'est pas la première activité, son heure de début est l'heure de fin de l'activité précédente
            activityStartHour = activityEndHour;
          }
          
          return {
            ID: 0,
            PlanifID: planif?.ID || 0,
            debut: activityStartHour, 
            fin: activityEndHour, 
            signalisation: signalisationId || 0,
            lieuId: lieuId || 0,
            qteLab: null,
            activiteId: activityId,
            isComplete: false,
            sousTraitantId: undefined,
          } as PlanifActivite;
        });
        
        // Combiner les activités existantes avec les nouvelles
        setActivitiesData(prevData => [...prevData, ...newActivitiesData]);
      }
      
      // Si nous avons des activités, définir l'index sur la première activité non complétée
      if (activitiesData.length > 0) {
        const firstIncompleteIndex = activitiesData.findIndex(a => !a.isComplete);
        setCurrentActivityIndex(firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0);
      } else {
        setCurrentActivityIndex(0);
      }
    }
  }, [currentStep, selectedActivities, startHour, endHour, signalisationId, lieuId, planif]);

  useEffect(() => {
    if (currentStep === 3 && activitiesData.length > 0) {
      let earliestStart = "23:59";
      let latestEnd = "00:00";
      
      activitiesData.forEach(activity => {
        if (activity.debut && activity.debut < earliestStart) {
          earliestStart = activity.debut;
        }
        if (activity.fin && activity.fin > latestEnd) {
          latestEnd = activity.fin;
        }
      });
      
      setGlobalStartHour(earliestStart);
      setGlobalEndHour(latestEnd);
      
      const brunoEntreprise = sousTraitants?.find(st => st.nom.toLowerCase() === "bruneau");
      if (brunoEntreprise) {
        setDefaultEntreprise(brunoEntreprise.id);
      } else if (sousTraitants && sousTraitants.length > 0) {
        setDefaultEntreprise(sousTraitants[0].id);
      }
    }
  }, [currentStep, activitiesData, sousTraitants]);

  const handleSubmit = (e: React.FormEvent) => {
    if (e) e.preventDefault();

    if (currentStep !== 3) {
      return; 
    }

    if (!defaultEntreprise) {
      alert("Veuillez sélectionner une entreprise par défaut");
      return;
    }

    if (!globalStartHour || !globalEndHour) {
      alert("Les heures globales sont requises");
      return;
    }

    if (!selectedProject) {
      alert("Aucun projet sélectionné");
      return;
    }

    // Créer une copie des activités sans la propriété isComplete
    const planifActivitiesWithoutIsComplete = activitiesData.map(activity => {
      const { isComplete, ...activityWithoutIsComplete } = activity;
      return activityWithoutIsComplete;
    });

    const finalPlanif: Planif = {
      ID: planif?.ID || 0,
      ProjetID: selectedProject.ID,
      HrsDebut: globalStartHour,
      HrsFin: globalEndHour,
      DefaultEntrepriseId: defaultEntreprise,
      Note: globalNote,
      Date: planifDate,
      PlanifActivites: planifActivitiesWithoutIsComplete
    };

    onSave(finalPlanif);
    onClose();
  };

  const handleToggleActivity = (activityId: number) => {
    setSelectedActivities((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });
  };

  const handleDeselectAll = () => {
    setSelectedActivities(new Set());
  };

  const handleNextStep = () => {
    // En mode édition, permettre une navigation plus libre entre les étapes
    if (planif) {
      if (currentStep === 1) {
        // Vérifier qu'au moins une activité est sélectionnée
        if (selectedActivities.size === 0) {
          alert("Veuillez sélectionner au moins une activité");
          return;
        }
        setCurrentStep(2);
      } else if (currentStep === 2) {
        // En mode édition, permettre de passer à l'étape 3 sans validation stricte
        setCurrentStep(3);
      }
    } else {
      // En mode création, conserver les validations
      if (currentStep === 1) {
        if (selectedActivities.size === 0) {
          alert("Veuillez sélectionner au moins une activité");
          return;
        }
        setCurrentStep(2);
      } else if (currentStep === 2) {
        // Vérifier que toutes les activités ont été complétées
        const activitiesToCheck = activitiesData.filter(a => !a.isComplete);
        
        if (activitiesToCheck.length > 0) {
          const isAllActivitiesComplete = activitiesToCheck.every(
            activity => activity.debut && activity.fin && activity.lieuId
          );
          
          if (!isAllActivitiesComplete) {
            alert("Veuillez compléter toutes les informations obligatoires pour chaque nouvelle activité");
            return;
          }
          
          // Marquer toutes les activités comme complètes
          setActivitiesData(prevData => 
            prevData.map(activity => ({
              ...activity,
              isComplete: true
            }))
          );
        }
        
        setCurrentStep(3);
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    }
  };

  // Fonction pour passer à l'activité suivante dans l'étape 2
  const handleNextActivity = () => {
    // Vérifier que l'activité actuelle est complète
    const currentActivity = activitiesData[currentActivityIndex];
    
    // En mode édition, validation moins stricte
    if (planif) {
      // Enregistrer explicitement les modifications de l'activité courante
      console.log("Enregistrement des modifications pour l'activité", currentActivityIndex, currentActivity);
      
      // Passer à l'activité suivante si elle existe
      if (currentActivityIndex < activitiesData.length - 1) {
        const nextActivityIndex = currentActivityIndex + 1;
        
        // Si l'heure de fin est définie, proposer de l'utiliser comme heure de début pour l'activité suivante
        if (currentActivity.fin) {
          // S'assurer que les modifications sont bien appliquées avant de passer à l'activité suivante
          setActivitiesData(prevData => {
            const newData = [...prevData];
            // Mettre à jour l'activité suivante avec l'heure de fin de l'activité courante
            // seulement si l'activité suivante n'a pas déjà une heure de début définie
            if (!newData[nextActivityIndex].debut) {
              newData[nextActivityIndex] = { 
                ...newData[nextActivityIndex], 
                debut: currentActivity.fin 
              };
            }
            return newData;
          });
        }
        
        // Passer à l'activité suivante
        setTimeout(() => {
          setCurrentActivityIndex(nextActivityIndex);
        }, 100); // Petit délai pour s'assurer que l'état est bien mis à jour
      } else {
        // Si c'était la dernière activité, passer à l'étape 3
        handleNextStep();
      }
    } else {
      // En mode création, conserver les validations
      if (!currentActivity.debut || !currentActivity.fin || !currentActivity.lieuId) {
        alert("Veuillez compléter les informations obligatoires pour cette activité (heures de début et fin, lieu)");
        return;
      }
      
      // En mode édition, nous ne modifions pas isComplete pour éviter les rafraîchissements indésirables
      // Nous mettons simplement à jour les autres données de l'activité
      
      // Passer à l'activité suivante si elle existe
      if (currentActivityIndex < activitiesData.length - 1) {
        const nextActivityIndex = currentActivityIndex + 1;
        
        // S'assurer que les modifications sont bien appliquées avant de passer à l'activité suivante
        setActivitiesData(prevData => {
          const newData = [...prevData];
          // Mettre à jour l'activité suivante avec l'heure de fin de l'activité courante
          newData[nextActivityIndex] = { 
            ...newData[nextActivityIndex], 
            debut: currentActivity.fin 
          };
          return newData;
        });
        
        // Passer à l'activité suivante
        setTimeout(() => {
          setCurrentActivityIndex(nextActivityIndex);
        }, 100); // Petit délai pour s'assurer que l'état est bien mis à jour
      } else {
        // Si c'était la dernière activité, passer à l'étape 3
        handleNextStep();
      }
    }
  };

  const handlePreviousActivity = () => {
    // Vérifier si l'activité actuelle a des données à sauvegarder
    const currentActivity = activitiesData[currentActivityIndex];
    if (currentActivity.debut || currentActivity.fin || currentActivity.lieuId) {
      // Sauvegarder les données de l'activité actuelle avant de changer
      const isComplete = currentActivity.debut && currentActivity.fin && currentActivity.lieuId;
      if (isComplete) {
        updateActivityData(currentActivityIndex, { isComplete: true });
      }
    }
    
    if (currentActivityIndex > 0) {
      setCurrentActivityIndex(currentActivityIndex - 1);
    } else {
      // Si c'était la première activité, revenir à l'étape 1
      handlePreviousStep();
    }
  };

  // Fonction pour mettre à jour les données d'une activité spécifique
  const updateActivityData = (index: number, data: Partial<PlanifActivite>) => {
    setActivitiesData(prevData => {
      const newData = [...prevData];
      newData[index] = { ...newData[index], ...data };
      return newData;
    });
  };

  // Fonction pour sélectionner une activité spécifique dans la liste
  const handleSelectActivity = (index: number) => {
    // En mode édition, permettre une navigation plus flexible entre les activités
    if (planif) {
      console.log("Mode édition: Changement direct vers l'activité", index);
      // Passer directement à l'activité sélectionnée sans validation
      setCurrentActivityIndex(index);
    } else {
      // En mode création, conserver les validations
      // Vérifier si l'activité actuelle a des données à sauvegarder
      const currentActivity = activitiesData[currentActivityIndex];
      if (currentActivity.debut || currentActivity.fin || currentActivity.lieuId) {
        // Sauvegarder les données de l'activité actuelle avant de changer
        const isComplete = currentActivity.debut && currentActivity.fin && currentActivity.lieuId;
        if (isComplete) {
          updateActivityData(currentActivityIndex, { isComplete: true });
        }
      }
      
      // Passer à l'activité sélectionnée
      setCurrentActivityIndex(index);
    }
  };

  const filteredActivities = activites?.filter((activite) =>
    activite.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fonction pour initialiser les détails de l'activité lorsqu'on passe à l'étape de configuration
  const initActivityDetails = () => {
    console.log("Initialisation des détails des activités");
    
    if (!activites) {
      console.warn("Aucune activité disponible");
      return;
    }
    
    const newActivities = Array.from(selectedActivities).map(id => {
      // Rechercher l'activité par son ID
      const activiteInfo = activites.find(act => act.id === id);
      if (!activiteInfo) {
        console.warn(`Activité avec ID ${id} non trouvée dans la liste des activités`);
        return null;
      }
      
      // Si nous sommes en mode édition et que cette activité existe déjà, utiliser ses valeurs
      const existingActivity = activitiesData.find(act => act.activiteId === id);
      
      if (existingActivity) {
        console.log(`Activité existante trouvée pour ID ${id}:`, existingActivity);
        
        // Utiliser les valeurs existantes, mais marquer comme non complète pour permettre l'édition
        return {
          ...existingActivity,
          isComplete: false // Toujours false pendant l'édition pour éviter les rafraîchissements indésirables
        };
      } else {
        console.log(`Création d'une nouvelle configuration pour l'activité ID ${id}`);
        
        // Créer une nouvelle configuration par défaut
        return {
          ID: 0, // Nouvelle activité
          PlanifID: planif?.ID || 0,
          activiteId: id,
          debut: startHour,
          fin: endHour,
          signalisation: 0,
          lieuId: 0,
          qteLab: null,
          isComplete: false,
          sousTraitantId: defaultEntreprise || 0
        } as PlanifActivite;
      }
    }).filter(Boolean) as PlanifActivite[];
    
    console.log("Nouvelles activités initialisées:", newActivities);
    setActivitiesData(newActivities);
  };

  useEffect(() => {
    if (currentStep === 2) {
      // Éviter les appels répétés qui causent une boucle infinie
      console.log("Initialisation des activités pour l'étape 2");
      initActivityDetails();
    }
  }, [currentStep, selectedActivities, activites, startHour, endHour, defaultEntreprise, planif]);

  if (!isOpen) return null;

  const renderActivitySelectionStep = () => (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <FaClipboardList className="text-blue-500" />
            Sélection des Activités
          </label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleDeselectAll}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-200 flex items-center gap-1"
            >
              <FaTimes className="text-xs" />
              Tout désélectionner
            </button>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {selectedActivities.size} sélectionnée(s)
            </span>
          </div>
        </div>
        
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Rechercher une activité..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto p-4 bg-gray-50 rounded-xl border border-gray-100">
          {filteredActivities?.map((activite) => (
            <div 
              key={activite.id} 
              className="activity-item bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => handleToggleActivity(activite.id)}
            >
              <div className="checkbox-wrapper">
                <input
                  type="checkbox"
                  id={`cbx-${activite.id}`}
                  checked={selectedActivities.has(activite.id)}
                  onChange={(e) => e.stopPropagation()}
                />
                <label 
                  htmlFor={`cbx-${activite.id}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="tick_mark"></div>
                </label>
              </div>
              <span className="activity-name select-none">{activite.nom}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleNextStep}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 shadow-md"
        >
          Suivant
          <FaArrowRight />
        </button>
      </div>
    </div>
  );

  const renderPlanningDetailsStep = () => (
    <div className="space-y-6">
      {/* En mode édition, ajouter un message explicatif */}
      {planif && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="text-blue-700 font-medium flex items-center gap-2 mb-2">
            <FaInfoCircle className="text-blue-500" />
            Mode Édition
          </h3>
          <p className="text-sm text-blue-600">
            Vous pouvez modifier librement les détails des activités. Utilisez les boutons de navigation en haut pour passer entre les étapes.
            Cliquez sur une activité dans la liste pour la modifier.
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Colonne de gauche: Liste des activités */}
        <div className="md:col-span-1 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Activités à configurer</h3>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {activitiesData.length} activité(s)
            </span>
          </div>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {activitiesData.map((activity, index) => {
              const activityInfo = activites?.find(a => a.id === activity.activiteId);
              const isCurrent = index === currentActivityIndex;
              
              return (
                <div 
                  key={index}
                  onClick={() => handleSelectActivity(index)}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-between ${
                    isCurrent 
                      ? 'bg-blue-100 border-blue-300 border' 
                      : (activity.debut && activity.fin && activity.lieuId)
                        ? 'bg-green-50 text-gray-700' 
                        : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {(activity.debut && activity.fin && activity.lieuId) && <FaCheck className="text-green-500" />}
                    <span>
                      {activityInfo?.nom || `Activité ${index + 1}`}
                    </span>
                  </div>
                  {isCurrent && <FaArrowRight className="text-blue-500" />}
                </div>
              );
            })}
          </div>
          
          {/* Boutons d'action rapide pour l'édition */}
          {planif && (
            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="w-full px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
              >
                <FaPlus /> Ajouter des activités
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="w-full px-3 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
              >
                <FaSave /> Enregistrer les modifications
              </button>
            </div>
          )}
        </div>
        
        {/* Colonne de droite: Formulaire pour l'activité courante */}
        <div className="md:col-span-2">
          {activitiesData.length > 0 && currentActivityIndex < activitiesData.length && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                {activites?.find(a => a.id === activitiesData[currentActivityIndex].activiteId)?.nom || `Activité ${currentActivityIndex + 1}`}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-gray-700 font-medium flex items-center gap-2">
                    <FaClock className="text-blue-500" />
                    Début de l'activité
                  </label>
                  <input
                    type="time"
                    value={activitiesData[currentActivityIndex].debut}
                    onChange={(e) => updateActivityData(currentActivityIndex, { debut: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-gray-700 font-medium flex items-center gap-2">
                    <FaClock className="text-blue-500" />
                    Fin de l'activité
                  </label>
                  <input
                    type="time"
                    value={activitiesData[currentActivityIndex].fin}
                    onChange={(e) => updateActivityData(currentActivityIndex, { fin: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-gray-700 font-medium flex items-center gap-2">
                    <FaSign className="text-blue-500" />
                    Signalisation
                  </label>
                  <select
                    value={activitiesData[currentActivityIndex].signalisation || ""}
                    onChange={(e) => updateActivityData(currentActivityIndex, { signalisation: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner une signalisation</option>
                    {signalisations?.map((sign) => (
                      <option key={sign.id} value={sign.id}>
                        {sign.nom}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-gray-700 font-medium flex items-center gap-2">
                    <FaMapMarkerAlt className="text-blue-500" />
                    Lieu
                  </label>
                  <select
                    value={activitiesData[currentActivityIndex].lieuId || ""}
                    onChange={(e) => updateActivityData(currentActivityIndex, { lieuId: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Sélectionner un lieu</option>
                    {lieux?.map((lieu) => (
                      <option key={lieu.id} value={lieu.id}>
                        {lieu.nom}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-gray-700 font-medium flex items-center gap-2">
                    <FaFlask className="text-blue-500" />
                    Quantité pour le lab
                  </label>
                  <input
                    type="number"
                    value={activitiesData[currentActivityIndex].qteLab || ''}
                    onChange={(e) => updateActivityData(currentActivityIndex, { 
                      qteLab: e.target.value ? Number(e.target.value) : null 
                    })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Quantité (optionnel)"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-gray-700 font-medium flex items-center gap-2">
                    <FaBuilding className="text-blue-500" />
                    Sous-traitant pour cette activité
                  </label>
                  <select
                    value={activitiesData[currentActivityIndex].sousTraitantId || ""}
                    onChange={(e) => updateActivityData(currentActivityIndex, { 
                      sousTraitantId: e.target.value ? Number(e.target.value) : undefined 
                    })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Utiliser l'entreprise par défaut</option>
                    {sousTraitants?.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.nom}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 italic mt-1">
                    Si non spécifié, l'entreprise par défaut sera utilisée
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={handlePreviousActivity}
          className="px-6 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-all duration-200 flex items-center gap-2 border border-gray-300"
        >
          <FaArrowLeft />
          {currentActivityIndex === 0 ? "Retour à la sélection" : "Activité précédente"}
        </button>
        
        <button
          type="button"
          onClick={handleNextActivity}
          className={`px-6 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md ${
            currentActivityIndex === activitiesData.length - 1
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {currentActivityIndex === activitiesData.length - 1 ? (
            <>
              Finaliser <FaCheck />
            </>
          ) : (
            <>
              Activité suivante <FaArrowRight />
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderFinalizationStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-gray-700 font-medium flex items-center gap-2">
            <FaCalendarAlt className="text-blue-500" />
            Date de planification
          </label>
          <input
            type="date"
            value={planifDate}
            onChange={(e) => setPlanifDate(e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-gray-700 font-medium flex items-center gap-2">
            <FaClock className="text-blue-500" />
            Heure de début globale
          </label>
          <input
            type="time"
            value={globalStartHour}
            onChange={(e) => setGlobalStartHour(e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-gray-700 font-medium flex items-center gap-2">
            <FaClock className="text-blue-500" />
            Heure de fin globale
          </label>
          <input
            type="time"
            value={globalEndHour}
            onChange={(e) => setGlobalEndHour(e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-gray-700 font-medium flex items-center gap-2">
            <FaBuilding className="text-blue-500" />
            Entreprise par défaut
          </label>
          <select
            value={defaultEntreprise || ""}
            onChange={(e) => setDefaultEntreprise(Number(e.target.value))}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Sélectionner une entreprise</option>
            {sousTraitants?.map((st) => (
              <option key={st.id} value={st.id}>
                {st.nom}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-gray-700 font-medium flex items-center gap-2">
            <FaPencilAlt className="text-blue-500" />
            Notes globales
          </label>
          <textarea
            value={globalNote}
            onChange={(e) => setGlobalNote(e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button
          type="button"
          onClick={handlePreviousStep}
          className="px-6 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-all duration-200 flex items-center gap-2 border border-gray-300 mr-4"
        >
          <FaArrowLeft />
          Retour
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 shadow-md"
        >
          <FaCheck />
          Finaliser
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white w-11/12 max-w-5xl rounded-2xl shadow-2xl max-h-[95vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-8 h-8 bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-800 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300"
        >
          <FaTimes className="text-lg" />
        </button>
        
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-6 rounded-t-2xl sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-white flex items-center gap-4">
            {planif ? "Modifier la Planification" : "Nouvelle Planification"}
            <span className="text-sm font-normal bg-white/20 px-3 py-1 rounded-full">
              Étape {currentStep}/3
            </span>
          </h2>
          
          {/* Navigation rapide entre les étapes (visible uniquement en mode édition) */}
          {planif && (
            <div className="flex mt-4 gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                  currentStep === 1 
                    ? 'bg-white text-blue-600' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                1. Sélection
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                  currentStep === 2 
                    ? 'bg-white text-blue-600' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                2. Activités
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                  currentStep === 3 
                    ? 'bg-white text-blue-600' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                3. Finalisation
              </button>
            </div>
          )}
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {currentStep === 1 
              ? renderActivitySelectionStep() 
              : currentStep === 2 
                ? renderPlanningDetailsStep() 
                : renderFinalizationStep()
            }
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePlanifModal;
