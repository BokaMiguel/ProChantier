import React, { useState, useEffect } from "react";
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaClock,
  FaSign,
  FaPencilAlt,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import { ActivitePlanif } from "../../models/JournalFormModel";
import { useAuth } from "../../context/AuthContext";

interface CreateActivityModalProps {
  isOpen: boolean;
  activity: ActivitePlanif | null;
  onClose: () => void;
  onSave: (activity: ActivitePlanif) => void;
}

const CreateActivityModal: React.FC<CreateActivityModalProps> = ({
  isOpen,
  onClose,
  activity,
  onSave,
}) => {
  const [activiteId, setActiviteId] = useState<number | null>(null);
  const [entrepriseId, setEntrepriseId] = useState<number | null>(null);
  const [lieuId, setLieuId] = useState<number | null>(null);
  const [signalisationId, setSignalisationId] = useState<number | null>(null);
  const [startHour, setStartHour] = useState<string>("");
  const [endHour, setEndHour] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const { lieux, sousTraitants, signalisations, activites } = useAuth();

  useEffect(() => {
    if (activity) {
      setActiviteId(activity.activiteID ?? null);
      setEntrepriseId(activity.defaultEntrepriseId ?? null);
      setLieuId(activity.lieuID ?? null);
      setStartHour(activity.hrsDebut ?? "");
      setEndHour(activity.hrsFin ?? "");
      setSignalisationId(activity.signalisationId ?? null);
      setNotes(activity.note ?? "");
    } else {
      setActiviteId(null);
      setEntrepriseId(null);
      setLieuId(null);
      setStartHour("");
      setEndHour("");
      setSignalisationId(null);
      setNotes("");
    }
  }, [activity, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validTimeFormat = /^([0-1]\d|2[0-3]):([0-5]\d)$/;

    if (!validTimeFormat.test(startHour) || !validTimeFormat.test(endHour)) {
      console.error("Invalid time format for startHour or endHour");
      return;
    }

    const activitePlanif: ActivitePlanif = {
      id: activity?.id || Date.now(),
      activiteID: activiteId!,
      lieuID: lieuId ?? undefined,
      hrsDebut: startHour,
      hrsFin: endHour,
      defaultEntrepriseId: entrepriseId ?? undefined,
      signalisationId: signalisationId ?? undefined,
      note: notes || "", // Note peut être vide
      isLab: activity?.isLab || false, // Assurez-vous que l'état du `checkbox` est correct
      date: activity?.date || undefined, // Conserver la date si elle existe déjà
    };

    onSave(activitePlanif);
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
                Sélectionner une Activité
              </label>
              <select
                value={activiteId || ""}
                onChange={(e) => setActiviteId(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-lg shadow-sm border-gray-300 bg-white"
                required
              >
                <option value="">Sélectionner une activité</option>
                {activites?.map((activite) => (
                  <option key={activite.id} value={activite.id}>
                    {activite.nom}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="block mb-2 font-bold">
                <FaBuilding className="inline mr-2" />
                Entreprise
              </label>
              <select
                value={entrepriseId || ""}
                onChange={(e) => setEntrepriseId(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-lg shadow-sm border-gray-300 bg-white"
              >
                <option value="">Sélectionner une entreprise</option>
                {sousTraitants?.map((sousTraitant) => (
                  <option key={sousTraitant.id} value={sousTraitant.id}>
                    {sousTraitant.nom}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="block mb-2 font-bold">
                <FaMapMarkerAlt className="inline mr-2" />
                Lieu
              </label>
              <select
                value={lieuId || ""}
                onChange={(e) => setLieuId(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-lg shadow-sm border-gray-300 bg-white"
              >
                <option value="">Sélectionner un lieu</option>
                {lieux?.map((lieu) => (
                  <option key={lieu.id} value={lieu.id}>
                    {lieu.nom}
                  </option>
                ))}
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
                  required
                />
                <input
                  type="time"
                  value={endHour}
                  onChange={(e) => setEndHour(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg shadow-sm border-gray-300"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="block mb-2 font-bold">
                <FaSign className="inline mr-2" />
                Signalisation
              </label>
              <select
                value={signalisationId || ""}
                onChange={(e) => setSignalisationId(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-lg shadow-sm border-gray-300 bg-white"
              >
                <option value="">Sélectionner une signalisation</option>
                {signalisations?.map((sig) => (
                  <option key={sig.id} value={sig.id}>
                    {sig.nom}
                  </option>
                ))}
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
