import React, { useState, useEffect } from "react";
import { FaTrash, FaTimes, FaSave, FaLink, FaMapMarkerAlt } from "react-icons/fa";
import "./LocalisationModal.scss";
import { LocalisationDistance } from "../../../models/JournalFormModel";

interface LocalisationLiaisonModalProps {
  showModal: boolean;
  closeModal: () => void;
  savedLiaisons: LocalisationDistance[];
  setSavedLiaisons: (liaisons: LocalisationDistance[]) => void;
  onToggleLiaisonMode: (mode: boolean) => void;
  distances: LocalisationDistance[];
  isLiaisonMode: boolean;
  clearAllLocalisations: () => void;
  usedLiaisons: number[];
}

const LocalisationLiaisonModal: React.FC<LocalisationLiaisonModalProps> = ({
  showModal,
  closeModal,
  savedLiaisons,
  setSavedLiaisons,
  onToggleLiaisonMode,
  distances,
  isLiaisonMode,
  clearAllLocalisations,
  usedLiaisons,
}) => {
  const [selectedLiaisons, setSelectedLiaisons] = useState<LocalisationDistance[]>(savedLiaisons);

  useEffect(() => {
    setSelectedLiaisons(savedLiaisons);
  }, [savedLiaisons]);

  const toggleLiaison = (liaison: LocalisationDistance) => {
    setSelectedLiaisons((prevSelected) =>
      prevSelected.some((l) => l.id === liaison.id)
        ? prevSelected.filter((l) => l.id !== liaison.id)
        : [...prevSelected, liaison]
    );
  };

  const handleSaveLiaisons = () => {
    setSavedLiaisons(selectedLiaisons);
    closeModal();
  };

  const handleClearAll = () => {
    setSelectedLiaisons([]);
    clearAllLocalisations();
  };

  const formatLiaison = (baseA: number, baseB: number) => `${baseA} @ ${baseB}`;

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
          <h3 className="text-2xl font-bold text-gray-800">Sélectionner les liaisons</h3>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
              <input
                type="checkbox"
                checked={isLiaisonMode}
                onChange={() => onToggleLiaisonMode(!isLiaisonMode)}
                className="form-checkbox h-5 w-5 text-blue-500 rounded"
                disabled={selectedLiaisons.length > 0}
              />
              <span className="text-blue-700 font-medium">Mode Liaison</span>
            </label>
            <button
              onClick={handleClearAll}
              disabled={selectedLiaisons.length === 0}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
                selectedLiaisons.length === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-red-50 text-red-600 hover:bg-red-100"
              }`}
            >
              <FaTrash className="text-sm" />
              <span>Effacer tout</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto p-2">
          {distances.map((distance) => {
            const isSelected = selectedLiaisons.some((l) => l.id === distance.id);
            const isDisabled = usedLiaisons.includes(distance.id);

            return (
              <button
                key={distance.id}
                onClick={() => toggleLiaison(distance)}
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
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col items-start">
                    <div className="flex items-center space-x-2">
                      <FaMapMarkerAlt className={`text-lg ${isSelected ? "text-white" : "text-blue-500"}`} />
                      <span className="font-medium">
                        Base {distance.baseA} - Base {distance.baseB}
                      </span>
                    </div>
                    <span className={`text-sm mt-1 ${isSelected ? "text-blue-100" : "text-blue-500"} font-medium`}>
                      {distance.distanceInMeters} m
                    </span>
                  </div>
                  <FaLink className={`text-lg ${isSelected ? "text-white" : "text-blue-400"}`} />
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
            onClick={handleSaveLiaisons}
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

export default LocalisationLiaisonModal;
