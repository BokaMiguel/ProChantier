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
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-center bg-blue-800 text-white p-4 rounded flex items-center justify-center">
        Planification des Travaux
      </h1>
      <div className="flex flex-col md:flex-row md:justify-between items-center mb-4">
        <div className="flex items-center mb-4 md:mb-0">
          <label className="text-lg font-semibold mr-2">Semaine :</label>
          <DatePicker
            calendarStartDay={0}
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="dd/MM/yyyy"
            className="shadow appearance-none border rounded w-full md:w-64 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            locale={fr}
          />
        </div>
        <div className="text-lg font-semibold">
          Semaine du {format(start, "dd MMMM", { locale: fr })} au{" "}
          {format(end, "dd MMMM", { locale: fr })}
        </div>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="space-y-2">
          {daysOfWeek.map((day, index) => (
            <Droppable key={day} droppableId={day} direction="vertical">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="bg-white p-2 rounded shadow-md"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold text-lg flex items-center">
                      <FaCalendarDay className="inline mr-2" />
                      {day} -{" "}
                      {format(addDays(start, index), "dd MMMM yyyy", {
                        locale: fr,
                      })}
                    </h2>
                    <div className="flex space-x-2">
                      <button
                        className="bg-blue-500 text-white p-2 rounded flex items-center"
                        onClick={() => {
                          setActivityToEdit(null);
                          setSelectedDay(day);
                          setShowModal(true);
                        }}
                      >
                        <FaPlus className="mr-1" />
                        Créer une activité
                      </button>
                      <button
                        className="border border-blue-500 text-blue-500 p-2 rounded flex items-center"
                        onClick={() => {
                          setSelectedDay(day);
                          setShowImportModal(true);
                        }}
                      >
                        <FaFileImport className="mr-1" />
                        Importer des activités
                      </button>
                    </div>
                  </div>
                  <div
                    className="grid grid-cols-12 gap-2 border-b border-gray-300 mb-2 pb-2 bg-gray-200"
                    style={{ paddingTop: "5px" }}
                  >
                    <div className="font-bold flex items-center justify-center col-span-2">
                      Nom
                    </div>
                    <div className="font-bold flex items-center justify-center col-span-2">
                      <FaClock className="mr-1" />
                      Plage Horaire
                    </div>
                    <div className="font-bold flex items-center justify-center col-span-2">
                      <FaBuilding className="mr-1" />
                      Entreprise
                    </div>
                    <div className="font-bold flex items-center justify-center col-auto">
                      <FaMapMarkerAlt className="mr-1" />
                      Lieu
                    </div>
                    <div className="font-bold flex items-center justify-center col-span-2">
                      <FaSign className="mr-2" /> Signalisation
                    </div>
                    <div className="font-bold flex items-center justify-center col-auto">
                      <FaFlask className="mr-1" />
                      Lab
                    </div>
                    <div className="font-bold flex items-center justify-center col-auto">
                      <FaCog className="mr-1" />
                      Actions
                    </div>
                  </div>
                  {activities[day].map((activity, index) => (
                    <Draggable
                      key={activity.id}
                      draggableId={activity.id.toString()}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-gray-50 p-2 mb-2 rounded shadow"
                        >
                          <div className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-2">
                              {getActivityName(activity.activiteID)}
                            </div>
                            <div className="col-span-2">
                              {activity.hrsDebut} - {activity.hrsFin}
                            </div>
                            <div className="col-span-2">
                              {getEntrepriseName(activity.defaultEntrepriseId!)}
                            </div>
                            <div className="col-auto">
                              {getLieuName(activity.lieuID!)}
                            </div>
                            <div className="col-span-2">
                              {getSignalisationName(activity.signalisationId!)}
                            </div>
                            <div className="col-auto">
                              <input
                                type="checkbox"
                                checked={activity.isLab}
                                onChange={() =>
                                  handleCheckboxChange(activity.id.toString())
                                }
                                className="mr-2"
                              />
                            </div>
                            <div
                              className="col-auto flex gap-2 justify-end"
                              style={{ marginRight: "10%" }}
                            >
                              {activity.note && (
                                <FaPencilAlt className="text-yellow-500" />
                              )}
                              <button
                                onClick={() => handleEditActivity(activity)}
                                className="text-blue-500"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteActivity(day, activity.id)
                                }
                                className="text-red-500"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {showModal && (
        <CreateActivityModal
          activity={activityToEdit}
          onClose={() => setShowModal(false)}
          onSave={handleSaveActivity}
          isOpen={showModal}
        />
      )}

      {showImportModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-4 rounded shadow-md max-w-4xl w-full max-h-screen overflow-y-auto">
            <ActivityList
              onSelectActivity={handleImportActivities}
              selectedActivities={selectedActivities}
              onToggleActivity={handleToggleActivity}
            />
            <div className="flex justify-between items-center mt-4">
              <span>{selectedActivities.size} activités sélectionnées</span>
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    handleImportActivities(
                      Array.from(selectedActivities).map((id) =>
                        activitesPlanif?.find((activity) => activity.id === id)
                      ) as ActivitePlanif[]
                    )
                  }
                  className="bg-blue-500 text-white p-2 rounded flex items-center justify-center"
                >
                  <FaFileImport className="mr-2" />
                  Importer les activités
                </button>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="bg-red-500 text-white p-2 rounded flex items-center justify-center"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end mt-8">
        <button
          onClick={handleSavePlanning}
          className="bg-green-600 text-white p-3 rounded flex items-center"
        >
          <FaSave className="mr-2" />
          Enregistrer la planification
        </button>
      </div>
    </div>
  );
};

export default PlanningForm;
