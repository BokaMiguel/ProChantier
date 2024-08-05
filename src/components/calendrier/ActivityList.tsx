import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { Activite } from "../../models/JournalFormModel";

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

interface ActivityListProps {
  onSelectActivity: (activities: Activite[]) => void;
  selectedActivities: Set<number>;
  onToggleActivity: (activityId: number) => void;
}

const ActivityList: React.FC<ActivityListProps> = ({
  onSelectActivity,
  selectedActivities,
  onToggleActivity,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleImportActivities = () => {
    const selected = mockActivities.filter((activity) =>
      selectedActivities.has(activity.id)
    );
    onSelectActivity(selected);
  };

  const filteredActivities = mockActivities.filter((activity) =>
    activity.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 bg-white rounded shadow-md max-h-96 overflow-y-auto">
      <div className="sticky top-0 bg-white z-10 pb-2">
        <h2 className="text-xl font-bold mb-4 bg-blue-500 text-white p-2 rounded">
          Liste des Activités
        </h2>
        <div className="flex items-center mb-4">
          <FaSearch className="mr-2 text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher une activité..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full"
          />
        </div>
      </div>
      <ul className="space-y-4">
        {filteredActivities.map((activity) => (
          <li
            key={activity.id}
            onClick={() => onToggleActivity(activity.id)}
            className={`p-4 cursor-pointer border rounded shadow ${
              selectedActivities.has(activity.id)
                ? "bg-blue-500 text-white"
                : "border-gray-300 hover:border-gray-500"
            }`}
          >
            <div className="w-full">
              <div className="font-semibold">{activity.nom}</div>
              <div className="text-sm">
                <span className="font-medium">Entreprise:</span>{" "}
                {activity.entreprise || "N/A"}
              </div>
              <div className="text-sm">
                <span className="font-medium">Plage Horaire:</span>{" "}
                {activity.startHour} - {activity.endHour}
              </div>
              <div className="text-sm">
                <span className="font-medium">Signalisation:</span>{" "}
                {activity.signalisation || "N/A"}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityList;
