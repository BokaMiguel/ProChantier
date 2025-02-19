import React, { useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { ActivitePlanif } from "../../models/JournalFormModel";
import { useAuth } from "../../context/AuthContext";

interface ActivityListProps {
  onClose: () => void;
  onImport: (activities: ActivitePlanif[]) => void;
  selectedActivities: Set<number>;
  onToggleActivity: (activityId: number) => void;
}

const ActivityList: React.FC<ActivityListProps> = ({
  onClose,
  onImport,
  selectedActivities,
  onToggleActivity,
}) => {
  const { activitesPlanif, activites, lieux, sousTraitants, signalisations } =
    useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrer les activités où Date est null et qui correspondent à la recherche
  const filteredActivities = activitesPlanif?.filter((activity) => {
    const activityName =
      activites?.find((act) => act.id === activity.activiteIDs[0])?.nom || "";
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

  const handleImport = () => {
    const selectedActivitiesList = filteredActivities?.filter(activity => 
      selectedActivities.has(activity.id)
    ) || [];
    onImport(selectedActivitiesList);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Importer des Activités
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes size={20} />
            </button>
          </div>

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

          <div className="max-h-96 overflow-y-auto mb-4">
            <ul className="space-y-2">
              {filteredActivities?.map((activity) => (
                <li
                  key={activity.id}
                  onClick={() => onToggleActivity(activity.id)}
                  className={`p-4 cursor-pointer border rounded ${
                    selectedActivities.has(activity.id)
                      ? "bg-blue-50 border-blue-500"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="w-full">
                    <div className="font-semibold text-gray-800">
                      {getActivityName(activity.activiteIDs[0] ?? undefined)}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Entreprise:</span>{" "}
                      {getEntrepriseName(activity.defaultEntrepriseId!)}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Plage Horaire:</span>{" "}
                      {activity.hrsDebut} - {activity.hrsFin}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Localisation:</span>{" "}
                      {getLieuName(activity.lieuID!)}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Signalisation:</span>{" "}
                      {getSignalisationName(activity.signalisationId!)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Annuler
            </button>
            <button
              onClick={handleImport}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              disabled={selectedActivities.size === 0}
            >
              Importer ({selectedActivities.size} sélectionnée{selectedActivities.size > 1 ? 's' : ''})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityList;
