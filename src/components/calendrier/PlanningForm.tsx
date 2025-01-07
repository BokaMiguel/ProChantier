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
import { format, startOfWeek, endOfWeek, addDays, parse } from "date-fns";
import { fr } from "date-fns/locale";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CreateActivityModal from "./CreateActivityModal"; // Assurez-vous que le chemin est correct
import { ActivitePlanif } from "../../models/JournalFormModel";
import { useAuth } from "../../context/AuthContext";
import ActivityList from "./ActivityList";
import {
  createOrUpdateActivitePlanif,
  createOrUpdateJournalProjet,
} from "../../services/JournalService"; // Importez la méthode

const daysOfWeek = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

const PlanningForm: React.FC = () => {
  const {
    activitesPlanif,
    activites,
    lieux,
    sousTraitants,
    signalisations,
    selectedProject,
  } = useAuth(); // Récupération des données depuis useAuth

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activities, setActivities] = useState<{
    [key: string]: ActivitePlanif[];
  }>({
    Dimanche: [],
    Lundi: [],
    Mardi: [],
    Mercredi: [],
    Jeudi: [],
    Vendredi: [],
    Samedi: [],
  });
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState<ActivitePlanif | null>(
    null
  );
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedActivities, setSelectedActivities] = useState<Set<number>>(
    new Set()
  );

  const start = useMemo(
    () => startOfWeek(selectedDate, { weekStartsOn: 0 }),
    [selectedDate]
  );
  const end = useMemo(() => endOfWeek(start, { weekStartsOn: 0 }), [start]);

  useEffect(() => {
    if (activitesPlanif) {
      const updatedActivities = daysOfWeek.reduce((acc, day, index) => {
        const currentDayDate = addDays(start, index);

        acc[day] = activitesPlanif.filter((activity) => {
          if (activity.date) {
            const activityDate = new Date(activity.date);
            return (
              format(activityDate, "yyyy-MM-dd") ===
              format(currentDayDate, "yyyy-MM-dd")
            );
          }
          return false;
        });

        return acc;
      }, {} as { [key: string]: ActivitePlanif[] });

      setActivities(updatedActivities);
    }
  }, [activitesPlanif, start]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceActivities = Array.from(activities[source.droppableId]);
    const [removed] = sourceActivities.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      sourceActivities.splice(destination.index, 0, removed);
      setActivities({
        ...activities,
        [source.droppableId]: sourceActivities,
      });
    } else {
      const destinationActivities = Array.from(
        activities[destination.droppableId]
      );
      destinationActivities.splice(destination.index, 0, removed);

      setActivities({
        ...activities,
        [source.droppableId]: sourceActivities,
        [destination.droppableId]: destinationActivities,
      });
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleCheckboxChange = (id: string) => {
    setActivities((prevActivities) => {
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

  const handleEditActivity = (activity: ActivitePlanif) => {
    setActivityToEdit(activity);
    setShowModal(true);
  };

  const handleSaveActivity = (activity: ActivitePlanif) => {
    setActivities((prevActivities) => {
      const updatedActivities = { ...prevActivities };

      // Trouver le jour correspondant à l'activité en fonction de sa date
      const dayOfWeek = daysOfWeek.find((day) =>
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
    setActivities((prevActivities) => {
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

  const handleToggleActivity = (activityId: number) => {
    setSelectedActivities((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(activityId)) {
        newSelected.delete(activityId);
      } else {
        newSelected.add(activityId);
      }
      return newSelected;
    });
  };

  const handleImportActivities = (activitiesToImport: ActivitePlanif[]) => {
    setActivities((prevActivities) => {
      const updatedActivities = { ...prevActivities };
      activitiesToImport.forEach((activity) => {
        updatedActivities[selectedDay] = [
          ...updatedActivities[selectedDay],
          { ...activity, id: Date.now() },
        ];
      });
      return updatedActivities;
    });

    setSelectedActivities(new Set());
    setShowImportModal(false);
  };

  const handleSavePlanning = async () => {
    try {
      for (const day of daysOfWeek) {
        const currentDate = format(
          addDays(start, daysOfWeek.indexOf(day)),
          "yyyy-MM-dd"
        );
        for (const activity of activities[day]) {
          // Préparer les données pour l'API d'ActivitePlanif
          const activiteData = {
            id: activity.date ? activity.id : undefined, // Fournir l'ID si une date est présente
            activiteId: activity.activiteID,
            lieuId: activity.lieuID,
            startHour: activity.hrsDebut,
            endHour: activity.hrsFin,
            defaultEntrepriseId: activity.defaultEntrepriseId,
            isLab: activity.isLab,
            signalisationId: activity.signalisationId,
            note: activity.note,
            date: currentDate, // Date du jour associé à l'activité
          };

          // Créer ou mettre à jour l'activité et obtenir l'ID
          const createdActiviteId = await createOrUpdateActivitePlanif(
            activiteData,
            selectedProject!.ID
          );

          // Utiliser l'ID retourné pour créer ou mettre à jour le journal
          await createOrUpdateJournalProjet(
            currentDate, // La date correspondant au jour
            activity.hrsDebut,
            activity.hrsFin,
            1, // Statut par défaut
            selectedProject!.ID, // ID du projet sélectionné
            createdActiviteId // Utilisez l'ID de l'activité créée/mise à jour
          );
        }
      }
      alert("Planification sauvegardée avec succès !");
    } catch (error) {
      console.error("Failed to save planning", error);
      alert(
        "Une erreur est survenue lors de la sauvegarde de la planification."
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* En-tête sticky avec DatePicker et boutons */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-lg shadow-sm">
        <div className="flex flex-col gap-4 p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <DatePicker
                  selected={selectedDate}
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
                onClick={() => {
                  setShowModal(true);
                  setSelectedDay(format(selectedDate, "EEEE", { locale: fr }));
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <FaPlus className="text-sm" />
                Créer une activité
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <FaFileImport className="text-sm" />
                Importer des activités
              </button>
              <button
                onClick={handleSavePlanning}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <FaSave className="text-sm" />
                Enregistrer la planification
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="p-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 gap-4">
            {daysOfWeek.map((day, dayIndex) => {
              const currentDate = addDays(start, dayIndex);
              const formattedDate = format(currentDate, "dd/MM/yyyy");

              return (
                <Droppable key={day} droppableId={day}>
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
                          <span className="font-semibold">{day}</span>
                          <span className="text-sm text-blue-200">- {formattedDate}</span>
                        </div>
                        <button
                          onClick={() => {
                            setShowModal(true);
                            setSelectedDay(day);
                          }}
                          className="p-2 hover:bg-blue-700 rounded-full transition-colors duration-200"
                        >
                          <FaPlus className="text-white" />
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
                        {activities[day]?.map((activity, index) => (
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
                                  <div className="font-medium text-gray-900">
                                    {activity.activiteID !== null
                                      ? getActivityName(activity.activiteID)
                                      : "Inconnu"}
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
                                    onClick={() => handleDeleteActivity(day, activity.id)}
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
                        {activities[day]?.length === 0 && (
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

      {showModal && (
        <CreateActivityModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setActivityToEdit(null);
          }}
          onSave={handleSaveActivity}
          activity={activityToEdit}
        />
      )}
      {showImportModal && (
        <ActivityList
          selectedActivities={selectedActivities}
          onToggleActivity={handleToggleActivity}
          onImport={handleImportActivities}
          onClose={() => setShowImportModal(false)}
        />
      )}
    </div>
  );
};

export default PlanningForm;
