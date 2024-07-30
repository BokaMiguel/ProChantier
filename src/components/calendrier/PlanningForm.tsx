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
} from "react-icons/fa";
import { format, startOfWeek, endOfWeek, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CreateActivityModal from "./CreateActivityModal"; // Assurez-vous que le chemin est correct
import { Activite } from "../../models/JournalFormModel";

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
    axe: "Axe A",
    signalisation: "gauche",
    isLab: false,
  },
];

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
  const [activityToEdit, setActivityToEdit] = useState<Activite | null>(null);

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

  const addActivity = (day: string) => {
    const newActivity: Activite = {
      id: activities[day].length + 1,
      nom: `Activité ${activities[day].length + 1}`,
      startHour: "10:00", // Ajoutez cette ligne
      endHour: "12:00", // Ajoutez cette ligne
      entreprise: "Entreprise B",
      localisation: "Site B",
      axe: "Axe B",
      signalisation: "gauche",
      isLab: false,
    };
    setActivities({
      ...activities,
      [day]: [...activities[day], newActivity],
    });
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
      // Mise à jour d'une activité existante
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
      // Création d'une nouvelle activité
      const day = daysOfWeek[start.getDay()]; // Le jour actuellement sélectionné
      setActivities((prevActivities) => {
        const updatedActivities = { ...prevActivities };
        const newActivity: Activite = {
          ...activity,
          id: prevActivities[day].length
            ? Math.max(...prevActivities[day].map((a) => a.id)) + 1
            : 1,
        };
        updatedActivities[day] = [...updatedActivities[day], newActivity];
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

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-center bg-blue-500 text-white p-4 rounded flex items-center justify-center">
        <FaCalendarDay className="inline mr-2" />
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
                    <button
                      className="bg-blue-500 text-white p-2 rounded flex items-center"
                      onClick={() => {
                        setActivityToEdit(null); // Assurez-vous que nous ne modifions pas une activité existante
                        setShowModal(true);
                      }}
                    >
                      <FaPlus className="mr-1" />
                      Créer une activité
                    </button>
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
                    <div className="font-bold flex items-center justify-center col-auto">
                      <FaRuler className="mr-1" />
                      Axe
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
                            <div className="col-auto">{activity.axe}</div>
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
