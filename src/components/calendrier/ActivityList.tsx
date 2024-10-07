import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { ActivitePlanif } from "../../models/JournalFormModel";
import { useAuth } from "../../context/AuthContext"; // Importez useAuth

interface ActivityListProps {
  onSelectActivity: (activities: ActivitePlanif[]) => void;
  selectedActivities: Set<number>;
  onToggleActivity: (activityId: number) => void;
}

const ActivityList: React.FC<ActivityListProps> = ({
  onSelectActivity,
  selectedActivities,
  onToggleActivity,
}) => {
  const { activitesPlanif, activites, lieux, sousTraitants, signalisations } =
    useAuth(); // Récupération des données depuis useAuth
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrer les activités où Date est null et qui correspondent à la recherche
  const filteredActivities = activitesPlanif?.filter((activity) => {
    const activityName =
      activites?.find((act) => act.id === activity.activiteID)?.nom || "";
    return (
      activity.date === null &&
      activityName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getActivityName = (id: number | undefined) => {
    if (id === undefined) return "Inconnu";
    const activity = activites?.find((act) => act.id === id);
    return activity ? activity.nom : "Inconnu";
  };

  const getLieuName = (id: number | undefined) => {
    if (id === undefined) return "Inconnu";
    const lieu = lieux?.find((l) => l.id === id);
    return lieu ? lieu.nom : "Inconnu";
  };

  const getEntrepriseName = (id: number | undefined) => {
    if (id === undefined) return "Inconnu";
    const entreprise = sousTraitants?.find((ent) => ent.id === id);
    return entreprise ? entreprise.nom : "Inconnu";
  };

  const getSignalisationName = (id: number | undefined) => {
    if (id === undefined) return "Inconnu";
    const signalisation = signalisations?.find((sig) => sig.id === id);
    return signalisation ? signalisation.nom : "Inconnu";
  };

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
        {filteredActivities?.map((activity) => (
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
              <div className="font-semibold">
                {getActivityName(activity.activiteID ?? undefined)}
              </div>
              <div className="text-sm">
                <span className="font-medium">Entreprise:</span>{" "}
                {getEntrepriseName(activity.defaultEntrepriseId!)}
              </div>
              <div className="text-sm">
                <span className="font-medium">Plage Horaire:</span>{" "}
                {activity.hrsDebut} - {activity.hrsFin}
              </div>
              <div className="text-sm">
                <span className="font-medium">Localisation:</span>{" "}
                {getLieuName(activity.lieuID!)}
              </div>
              <div className="text-sm">
                <span className="font-medium">Signalisation:</span>{" "}
                {getSignalisationName(activity.signalisationId!)}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityList;
