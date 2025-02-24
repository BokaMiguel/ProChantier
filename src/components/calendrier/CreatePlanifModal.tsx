import React, { useState, useEffect } from "react";
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaClock,
  FaSign,
  FaPencilAlt,
  FaSave,
  FaTimes,
  FaClipboardList,
  FaSearch,
  FaArrowRight,
  FaArrowLeft,
  FaFlask,
} from "react-icons/fa";
import { ActivitePlanif } from "../../models/JournalFormModel";
import { useAuth } from "../../context/AuthContext";
import "../../styles/checkbox.css";

interface CreatePlanifModalProps {
  isOpen: boolean;
  planif: ActivitePlanif | null;
  onClose: () => void;
  onSave: (planif: ActivitePlanif, selectedActivities: Set<number>) => void;
}

const CreatePlanifModal: React.FC<CreatePlanifModalProps> = ({
  isOpen,
  onClose,
  planif,
  onSave,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [entrepriseId, setEntrepriseId] = useState<number | null>(null);
  const [lieuId, setLieuId] = useState<number | null>(null);
  const [signalisationId, setSignalisationId] = useState<number | null>(null);
  const [startHour, setStartHour] = useState<string>("");
  const [endHour, setEndHour] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [selectedActivities, setSelectedActivities] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLab, setIsLab] = useState<boolean>(false);
  const [labQuantity, setLabQuantity] = useState<number | null>(null);
  const { lieux, sousTraitants, signalisations, activites } = useAuth();

  useEffect(() => {
    if (planif) {
      setEntrepriseId(planif.defaultEntrepriseId ?? null);
      setLieuId(planif.lieuID ?? null);
      setStartHour(planif.hrsDebut ?? "");
      setEndHour(planif.hrsFin ?? "");
      setSignalisationId(planif.signalisationId ?? null);
      setNotes(planif.note ?? "");
      setIsLab(planif.isLab ?? false);
      setLabQuantity(planif.labQuantity ?? null);
      if (planif.activiteIDs) {
        setSelectedActivities(new Set(planif.activiteIDs));
      }
    } else {
      setEntrepriseId(null);
      setLieuId(null);
      setStartHour("");
      setEndHour("");
      setSignalisationId(null);
      setNotes("");
      setIsLab(false);
      setLabQuantity(null);
      setSelectedActivities(new Set());
    }
  }, [planif]);

  useEffect(() => {
    if (!isLab) {
      setLabQuantity(null);
    }
  }, [isLab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validTimeFormat = /^([0-1]\d|2[0-3]):([0-5]\d)$/;

    if (!validTimeFormat.test(startHour) || !validTimeFormat.test(endHour)) {
      alert("Format d'heure invalide");
      return;
    }

    if (selectedActivities.size === 0) {
      alert("Veuillez sélectionner au moins une activité");
      return;
    }

    if (isLab && (labQuantity === null || labQuantity < 0)) {
      alert("Veuillez entrer une quantité valide pour le laboratoire");
      return;
    }

    const planifData: ActivitePlanif = {
      id: planif?.id || Date.now(),
      lieuID: lieuId!,
      hrsDebut: startHour,
      hrsFin: endHour,
      defaultEntrepriseId: entrepriseId!,
      signalisationId: signalisationId ?? 0,
      note: notes || "",
      isLab: isLab,
      labQuantity: isLab ? labQuantity : null,
      date: planif?.date || "",
      activiteIDs: Array.from(selectedActivities),
      projetId: 0,
      quantite: 0,
    };

    onSave(planifData, selectedActivities);
    onClose();
  };

  const handleSave = () => {
    if (!lieuId || !entrepriseId) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (isLab && (labQuantity === null || labQuantity < 0)) {
      alert("Veuillez entrer une quantité valide pour le laboratoire");
      return;
    }

    const updatedPlanif: ActivitePlanif = {
      id: planif?.id || 0,
      lieuID: lieuId,
      defaultEntrepriseId: entrepriseId,
      hrsDebut: startHour,
      hrsFin: endHour,
      signalisationId: signalisationId || 0,
      note: notes,
      isLab: isLab,
      labQuantity: isLab ? labQuantity : null,
      date: planif?.date || new Date().toISOString(),
      activiteIDs: Array.from(selectedActivities),
      projetId: 0,
      quantite: 0
    };

    onSave(updatedPlanif, selectedActivities);
    setCurrentStep(1);
  };

  const handleToggleActivity = (activityId: number) => {
    setSelectedActivities((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });
  };

  const handleDeselectAll = () => {
    setSelectedActivities(new Set());
  };

  const handleNextStep = () => {
    if (selectedActivities.size === 0) {
      alert("Veuillez sélectionner au moins une activité");
      return;
    }
    setCurrentStep(2);
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
  };

  const filteredActivities = activites?.filter((activite) =>
    activite.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  const renderActivitySelectionStep = () => (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <FaClipboardList className="text-blue-500" />
            Sélection des Activités
          </label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleDeselectAll}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-200 flex items-center gap-1"
            >
              <FaTimes className="text-xs" />
              Tout désélectionner
            </button>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {selectedActivities.size} sélectionnée(s)
            </span>
          </div>
        </div>
        
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Rechercher une activité..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto p-4 bg-gray-50 rounded-xl border border-gray-100">
          {filteredActivities?.map((activite) => (
            <div 
              key={activite.id} 
              className="activity-item bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => handleToggleActivity(activite.id)}
            >
              <div className="checkbox-wrapper">
                <input
                  type="checkbox"
                  id={`cbx-${activite.id}`}
                  checked={selectedActivities.has(activite.id)}
                  onChange={(e) => e.stopPropagation()}
                />
                <label 
                  htmlFor={`cbx-${activite.id}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="tick_mark"></div>
                </label>
              </div>
              <span className="activity-name select-none">{activite.nom}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleNextStep}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 shadow-md"
        >
          Suivant
          <FaArrowRight />
        </button>
      </div>
    </div>
  );

  const renderPlanningDetailsStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-gray-700 font-medium flex items-center gap-2">
            <FaBuilding className="text-blue-500" />
            Entreprise
          </label>
          <select
            value={entrepriseId || ""}
            onChange={(e) => setEntrepriseId(Number(e.target.value))}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Sélectionner une entreprise</option>
            {sousTraitants?.map((st) => (
              <option key={st.id} value={st.id}>
                {st.nom}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-gray-700 font-medium flex items-center gap-2">
            <FaMapMarkerAlt className="text-blue-500" />
            Lieu
          </label>
          <select
            value={lieuId || ""}
            onChange={(e) => setLieuId(Number(e.target.value))}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Sélectionner un lieu</option>
            {lieux?.map((lieu) => (
              <option key={lieu.id} value={lieu.id}>
                {lieu.nom}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-gray-700 font-medium flex items-center gap-2">
            <FaClock className="text-blue-500" />
            Heure de début
          </label>
          <input
            type="time"
            value={startHour}
            onChange={(e) => setStartHour(e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-gray-700 font-medium flex items-center gap-2">
            <FaClock className="text-blue-500" />
            Heure de fin
          </label>
          <input
            type="time"
            value={endHour}
            onChange={(e) => setEndHour(e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-gray-700 font-medium flex items-center gap-2">
            <FaSign className="text-blue-500" />
            Signalisation
          </label>
          <select
            value={signalisationId || ""}
            onChange={(e) => setSignalisationId(Number(e.target.value))}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sélectionner une signalisation</option>
            {signalisations?.map((sign) => (
              <option key={sign.id} value={sign.id}>
                {sign.nom}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-gray-700 font-medium flex items-center gap-2">
            <FaPencilAlt className="text-blue-500" />
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <div className="flex flex-col space-y-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isLab}
                onChange={(e) => setIsLab(e.target.checked)}
                className="form-checkbox h-4 w-4 text-blue-500 rounded"
              />
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FaFlask className="text-blue-500" />
                Laboratoire requis
              </span>
            </label>

            {isLab && (
              <div className="pl-6 pt-2">
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <FaFlask className="text-blue-500" />
                    Quantité laboratoire
                    <span className="text-red-500">*</span>
                  </div>
                  <input
                    type="number"
                    value={labQuantity || ''}
                    onChange={(e) => setLabQuantity(e.target.value ? Number(e.target.value) : null)}
                    min="0"
                    step="1"
                    className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    required={isLab}
                    placeholder="Entrez la quantité..."
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={handlePreviousStep}
          className="px-6 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-all duration-200 flex items-center gap-2 border border-gray-300"
        >
          <FaArrowLeft />
          Retour
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 shadow-md"
        >
          <FaSave />
          Enregistrer
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-[9999] p-8">
      <div className="bg-white w-11/12 max-w-4xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-8 h-8 bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-800 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300"
        >
          <FaTimes className="text-lg" />
        </button>
        
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-6 rounded-t-2xl sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-white flex items-center gap-4">
            {planif ? "Modifier la Planification" : "Nouvelle Planification"}
            <span className="text-sm font-normal bg-white/20 px-3 py-1 rounded-full">
              Étape {currentStep}/2
            </span>
          </h2>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {currentStep === 1 ? renderActivitySelectionStep() : renderPlanningDetailsStep()}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePlanifModal;
