import React, { useState, useEffect } from "react";
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaRoad,
  FaClock,
  FaSign,
  FaPencilAlt,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import { Activite } from "../../models/JournalFormModel";

interface CreateActivityModalProps {
  isOpen: boolean;
  activity: Activite | null;
  onClose: () => void;
  onSave: (activity: Activite) => void;
}

const CreateActivityModal: React.FC<CreateActivityModalProps> = ({
  isOpen,
  onClose,
  activity,
  onSave,
}) => {
  const [activityName, setActivityName] = useState<string>("");
  const [entreprise, setEntreprise] = useState<string>("");
  const [localisation, setLocalisation] = useState<string>("");
  const [signalisation, setSignalisation] = useState<string>("");
  const [axe, setAxe] = useState<string>("");
  const [startHour, setStartHour] = useState<string>("");
  const [endHour, setEndHour] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    if (activity) {
      setActivityName(activity.nom ?? "");
      setEntreprise(activity.entreprise ?? "");
      setLocalisation(activity.localisation ?? "");
      setAxe(activity.axe ?? "");
      setStartHour(activity.startHour ?? "");
      setEndHour(activity.endHour ?? "");
      setSignalisation(activity.signalisation ?? "");
      setNotes(activity.notes ?? "");
    } else {
      // Réinitialiser les champs si aucune activité n'est fournie
      setActivityName("Activité");
      setEntreprise("");
      setLocalisation("");
      setAxe("");
      setStartHour("");
      setEndHour("");
      setSignalisation("");
      setNotes("");
    }
  }, [activity, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activity) {
      onSave({
        ...activity,
        nom: activityName,
        entreprise,
        localisation,
        axe,
        startHour,
        endHour,
        signalisation,
        notes,
      });
    } else {
      const newActivity: Activite = {
        id: Date.now(), // Utilisez un nombre unique
        nom: activityName,
        entreprise,
        localisation,
        axe,
        startHour,
        endHour,
        signalisation,
        notes,
      };
      onSave(newActivity);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-gray-200 w-11/12 max-w-4xl rounded-lg">
        <header className="bg-blue-600 text-white p-4 rounded-t-lg">
          <h2 className="text-lg font-bold">
            {activity ? "Modifier l'Activité" : "Créer une Activité"}
          </h2>
        </header>
        <div className="p-6">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div className="flex flex-col">
              <label className="block mb-2 font-bold">
                <FaBuilding className="inline mr-2" />
                Nom de l'Activité
              </label>
              <input
                type="text"
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg shadow-sm border-gray-300"
              />
            </div>
            <div className="flex flex-col">
              <label className="block mb-2 font-bold">
                <FaBuilding className="inline mr-2" />
                Entreprise
              </label>
              <select
                value={entreprise}
                onChange={(e) => setEntreprise(e.target.value)}
                className="w-full px-4 py-2 rounded-lg shadow-sm border-gray-300 bg-white"
              >
                <option value="">Sélectionner une entreprise</option>
                {/* Ajoutez ici les options pour les entreprises */}
                <option value="Entreprise1">Entreprise1</option>
                <option value="Entreprise2">Entreprise2</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="block mb-2 font-bold">
                <FaMapMarkerAlt className="inline mr-2" />
                Localisation
              </label>
              <select
                value={localisation}
                onChange={(e) => setLocalisation(e.target.value)}
                className="w-full px-4 py-2 rounded-lg shadow-sm border-gray-300 bg-white"
              >
                <option value="">Sélectionner une localisation</option>
                {/* Ajoutez ici les options pour les localisations */}
                <option value="Localisation1">Localisation1</option>
                <option value="Localisation2">Localisation2</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="block mb-2 font-bold">
                <FaRoad className="inline mr-2" />
                Axe
              </label>
              <select
                value={axe}
                onChange={(e) => setAxe(e.target.value)}
                className="w-full px-4 py-2 rounded-lg shadow-sm border-gray-300 bg-white"
              >
                <option value="">Sélectionner un axe</option>
                {/* Ajoutez ici les options pour les axes */}
                <option value="Axe1">Axe1</option>
                <option value="Axe2">Axe2</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="block mb-2 font-bold">
                <FaClock className="inline mr-2" />
                Plage Horaire
              </label>
              <div className="flex gap-4">
                <input
                  type="time"
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg shadow-sm border-gray-300"
                />
                <input
                  type="time"
                  value={endHour}
                  onChange={(e) => setEndHour(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg shadow-sm border-gray-300"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="block mb-2 font-bold">
                <FaSign className="inline mr-2" />
                Signalisation
              </label>
              <select
                value={signalisation}
                onChange={(e) => setSignalisation(e.target.value)}
                className="w-full px-4 py-2 rounded-lg shadow-sm border-gray-300 bg-white"
              >
                <option value="">Sélectionner une signalisation</option>
                {/* Ajoutez ici les options pour les signalisation */}
                <option value="Signalisation1">Signalisation1</option>
                <option value="Signalisation2">Signalisation2</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block mb-2 font-bold">
                <FaPencilAlt className="inline mr-2" />
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 rounded-lg shadow-sm border-gray-300"
                rows={4}
              />
            </div>
            <div className="col-span-2 flex justify-end mt-4 space-x-2">
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded flex items-center space-x-2"
              >
                <FaSave />
                <span>{activity ? "Sauvegarder" : "Créer"}</span>
              </button>
              <button
                type="button"
                className="bg-gray-500 text-white p-2 rounded flex items-center space-x-2"
                onClick={onClose}
              >
                <FaTimes />
                <span>Annuler</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateActivityModal;
