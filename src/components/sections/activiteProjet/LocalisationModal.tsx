import React, { useState, useEffect } from "react";
import { FaTrash, FaTimes, FaSave, FaMapMarkerAlt } from "react-icons/fa";
import { Localisation } from "../../../models/JournalFormModel";

interface LocalisationModalProps {
  showModal: boolean;
  closeModal: () => void;
  savedLocalisations: Localisation[];
  setSavedLocalisations: (localisations: Localisation[]) => void;
  isLiaisonMode: boolean;
  setIsLiaisonMode: React.Dispatch<React.SetStateAction<boolean>>;
  clearAllLocalisations: () => void;
  bases: Localisation[];
  usedBases: number[];
}

const LocalisationModal: React.FC<LocalisationModalProps> = ({
  showModal,
  closeModal,
  savedLocalisations,
  setSavedLocalisations,
  isLiaisonMode,
  setIsLiaisonMode,
  clearAllLocalisations,
  bases,
  usedBases,
}) => {
  const [selectedLocalisations, setSelectedLocalisations] = useState<Localisation[]>(savedLocalisations);

  useEffect(() => {
    setSelectedLocalisations(savedLocalisations);
  }, [savedLocalisations]);

  const toggleLocalisation = (localisation: Localisation) => {
    setSelectedLocalisations((prevSelected) =>
      prevSelected.some((loc) => loc.id === localisation.id)
        ? prevSelected.filter((loc) => loc.id !== localisation.id)
        : [...prevSelected, localisation]
    );
  };

  const handleSaveLocalisations = () => {
    setSavedLocalisations(selectedLocalisations);
    closeModal();
  };

  const handleClearAll = () => {
    setSelectedLocalisations([]);
    clearAllLocalisations();
  };

  if (!showModal) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      style={{ zIndex: 10000 }}
    >
      <div
        className="bg-white p-6 rounded-lg w-full max-w-2xl shadow-xl space-y-6"
        style={{ zIndex: 10001 }}
      >
        <div className="flex justify-between items-center border-b pb-4">
          <h3 className="text-2xl font-bold text-gray-800">Sélectionner une localisation</h3>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
              <input
                type="checkbox"
                checked={isLiaisonMode}
                onChange={() => setIsLiaisonMode(!isLiaisonMode)}
                className="form-checkbox h-5 w-5 text-blue-500 rounded"
                disabled={selectedLocalisations.length > 0}
              />
              <span className="text-blue-700 font-medium">Mode Liaison</span>
            </label>
            <button
              onClick={handleClearAll}
              disabled={selectedLocalisations.length === 0}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
                selectedLocalisations.length === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-red-50 text-red-600 hover:bg-red-100"
              }`}
            >
              <FaTrash className="text-sm" />
              <span>Effacer tout</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto p-2">
          {bases.map((loc) => {
            const isSelected = selectedLocalisations.some(
              (selected) => selected.id === loc.id
            );
            const isDisabled = usedBases.includes(loc.id);

            return (
              <button
                key={loc.id}
                onClick={() => toggleLocalisation(loc)}
                className={`
                  relative p-4 rounded-lg shadow-sm transition-all duration-200
                  ${
                    isSelected
                      ? "bg-blue-500 text-white ring-2 ring-blue-300 ring-offset-2 transform scale-105"
                      : isDisabled
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white hover:bg-blue-50 text-gray-700 border border-gray-200 hover:border-blue-300"
                  }
                `}
                disabled={isDisabled}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FaMapMarkerAlt className={`text-xl ${isSelected ? "text-white" : "text-blue-500"}`} />
                  </div>
                  <span className="font-medium text-center">{loc.base}</span>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            onClick={closeModal}
            className="px-6 py-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors duration-200 flex items-center space-x-2"
          >
            <FaTimes className="text-sm" />
            <span>Annuler</span>
          </button>
          <button
            onClick={handleSaveLocalisations}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <FaSave className="text-sm" />
            <span>Enregistrer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocalisationModal;
