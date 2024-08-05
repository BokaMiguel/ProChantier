import React, { useState } from "react";
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
  FaRuler,
  FaEdit,
  FaExclamationTriangle,
  FaTrash,
  FaFlask,
  FaCog,
  FaSign,
  FaStar,
  FaSave,
  FaFileImport,
} from "react-icons/fa";
import { format, startOfWeek, endOfWeek, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CreateActivityModal from "./CreateActivityModal"; // Assurez-vous que le chemin est correct
import { Activite } from "../../models/JournalFormModel";
import ActivityList from "./ActivityList"; // Assurez-vous que le chemin est correct

const daysOfWeek = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

const initialActivities: Activite[] = [
  {
    id: 1,
    nom: "Sciage du revêtement en béton, forage pour modifications de massifs",
    startHour: "08:00",
    endHour: "12:00",
    entreprise: "Entreprise A",
    localisation: "Site A",
    signalisation: "gauche",
    isLab: false,
    isComplete: false,
  },
];

const mockActivities: Activite[] = [
  {
    id: 1,
    nom: "Sciage du revêtement en béton",
    entreprise: "Entreprise A",
    startHour: "08:00",
    endHour: "12:00",
    signalisation: "Gauche",
    isComplete: false,
  },
  {
    id: 2,
    nom: "Forage pour modifications de massifs",
    entreprise: "Entreprise B",
    startHour: "13:00",
    endHour: "17:00",
    signalisation: "Droite",
    isComplete: false,
  },
  // Ajoutez plus de mock activities ici
];

let globalIdCounter = 100; // Initialise un compteur global pour générer des IDs uniques

const PlanningForm: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activities, setActivities] = useState<{ [key: string]: Activite[] }>({
    Dimanche: initialActivities,
    Lundi: [],
    Mardi: [],
    Mercredi: [],
    Jeudi: [],
    Vendredi: [],
    Samedi: [],
  });
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState<Activite | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<Set<number>>(
    new Set()
  );
  const [selectedDay, setSelectedDay] = useState<string>("");

  const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const end = endOfWeek(start, { weekStartsOn: 0 });

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

  const handleEditActivity = (activity: Activite) => {
    setActivityToEdit(activity);
    setShowModal(true);
  };

  const handleSaveActivity = (activity: Activite) => {
    if (activityToEdit) {
      setActivities((prevActivities) => {
        const updatedActivities = { ...prevActivities };
        for (const day in updatedActivities) {
          updatedActivities[day] = updatedActivities[day].map((act) =>
            act.id === activity.id ? activity : act
          );
        }
        return updatedActivities;
      });
    } else {
      setActivities((prevActivities) => {
        const updatedActivities = { ...prevActivities };
        const newActivity: Activite = {
          ...activity,
          id: globalIdCounter++,
        };
        updatedActivities[selectedDay] = [
          ...updatedActivities[selectedDay],
          newActivity,
        ];
        return updatedActivities;
      });
    }
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

  const handleImportActivities = (day: string) => {
    const selected = Array.from(selectedActivities)
      .map((id) => mockActivities.find((activity) => activity.id === id))
      .filter((activity) => activity !== undefined) as Activite[];

    setActivities((prevActivities) => {
      const updatedActivities = { ...prevActivities };
      selected.forEach((activity) => {
        const newActivity: Activite = {
          ...activity,
          id: globalIdCounter++, // Utilise le compteur global pour générer un nouvel ID
        };
        updatedActivities[day] = [...updatedActivities[day], newActivity];
      });
      return updatedActivities;
    });

    setSelectedActivities(new Set()); // Clear the selection
    setShowImportModal(false);
  };

  const handleSelectActivities = (selectedActivities: Activite[]) => {
    setActivities((prevActivities) => {
      const updatedActivities = { ...prevActivities };
      selectedActivities.forEach((activity) => {
        const newActivity: Activite = {
          ...activity,
          id: globalIdCounter++,
        };
        updatedActivities[selectedDay] = [
          ...updatedActivities[selectedDay],
          newActivity,
        ];
      });
      return updatedActivities;
    });
    setShowImportModal(false);
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

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-center bg-blue-800 text-white p-4 rounded flex items-center justify-center">
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
        <div className="space-y-4">
          {daysOfWeek.map((day, index) => (
            <Droppable key={day} droppableId={day} direction="vertical">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="bg-white p-4 rounded shadow-md"
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
                          setActivityToEdit(null); // Assurez-vous que nous ne modifions pas une activité existante
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
                    className="grid grid-cols-12 gap-4 border-b border-gray-300 mb-2 pb-2 bg-gray-200"
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
                      Localisation
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
                          <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-2">{activity.nom}</div>
                            <div className="col-span-2">
                              {activity.startHour} - {activity.endHour}
                            </div>
                            <div className="col-span-2">
                              {activity.entreprise}
                            </div>
                            <div className="col-auto">
                              {activity.localisation}
                            </div>
                            <div className="col-span-2">
                              {activity.signalisation}
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
                              style={{ marginRight: "25%" }}
                            >
                              {activity.notes && activity.notes.length > 0 && (
                                <button
                                  onClick={() => handleEditActivity(activity)}
                                  className="text-orange-500"
                                >
                                  <FaExclamationTriangle />
                                </button>
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
              onSelectActivity={handleSelectActivities}
              selectedActivities={selectedActivities}
              onToggleActivity={handleToggleActivity}
            />
            <div className="flex justify-between items-center mt-4">
              <span>{selectedActivities.size} activités sélectionnées</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleImportActivities(selectedDay)}
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
          onClick={() => console.log(activities)}
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
