import React, { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { FaCalendarDay, FaPlus } from "react-icons/fa";
import { format, addDays, startOfWeek } from "date-fns";
import { fr } from "date-fns/locale";

const daysOfWeek = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];
const today = new Date();
const start = startOfWeek(today, { weekStartsOn: 0 });

interface Activite {
  id: string;
  nom: string;
  plageHoraire: string;
  entreprise: string;
  localisation: string;
  axe: string;
}

const initialActivities: Activite[] = [
  {
    id: "1",
    nom: "Activité 1",
    plageHoraire: "08:00 - 10:00",
    entreprise: "Entreprise A",
    localisation: "Site A",
    axe: "Axe A",
  },
];

const PlanningForm: React.FC = () => {
  const [activities, setActivities] = useState<{ [key: string]: Activite[] }>({
    Dimanche: initialActivities,
    Lundi: [],
    Mardi: [],
    Mercredi: [],
    Jeudi: [],
    Vendredi: [],
    Samedi: [],
  });

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
      // Reordering within the same list
      sourceActivities.splice(destination.index, 0, removed);
      setActivities({
        ...activities,
        [source.droppableId]: sourceActivities,
      });
    } else {
      // Moving to a different list
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
      id: (activities[day].length + 1).toString(),
      nom: `Activité ${activities[day].length + 1}`,
      plageHoraire: "10:00 - 12:00",
      entreprise: "Entreprise B",
      localisation: "Site B",
      axe: "Axe B",
    };
    setActivities({
      ...activities,
      [day]: [...activities[day], newActivity],
    });
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-center bg-blue-500 text-white p-4 rounded">
        <FaCalendarDay className="inline mr-2" />
        Planification des Travaux
      </h1>
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
                    <h2 className="font-bold text-lg">
                      <FaCalendarDay className="inline mr-2" />
                      {day} -{" "}
                      {format(addDays(start, index), "dd MMMM yyyy", {
                        locale: fr,
                      })}
                    </h2>
                    <button
                      className="bg-blue-500 text-white p-2 rounded flex items-center"
                      onClick={() => addActivity(day)}
                    >
                      <FaPlus className="mr-1" />
                      Créer une activité
                    </button>
                  </div>
                  {activities[day].map((activity, index) => (
                    <Draggable
                      key={activity.id}
                      draggableId={activity.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-blue-500 text-white p-2 mb-2 rounded"
                        >
                          <p>
                            <strong>{activity.nom}</strong>
                          </p>
                          <p>Plage Horaire: {activity.plageHoraire}</p>
                          <p>Entreprise: {activity.entreprise}</p>
                          <p>Localisation: {activity.localisation}</p>
                          <p>Axe: {activity.axe}</p>
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
    </div>
  );
};

export default PlanningForm;
