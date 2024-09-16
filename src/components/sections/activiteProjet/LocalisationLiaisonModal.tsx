import React, { useState, useEffect } from "react";
import { FaTrash, FaTimes, FaSave, FaLink } from "react-icons/fa";
import "./LocalisationModal.scss";

interface LocalisationLiaisonModalProps {
  showModal: boolean;
  closeModal: () => void;
  savedLiaisons: string[];
  setSavedLiaisons: (liaisons: string[]) => void;
  onToggleLiaisonMode: (mode: boolean) => void;
  distances: { baseAName: string; baseBName: string }[];
  isLiaisonMode: boolean;
  clearAllLocalisations: () => void;
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
}) => {
  const [selectedLiaisons, setSelectedLiaisons] =
    useState<string[]>(savedLiaisons);

  useEffect(() => {
    setSelectedLiaisons(savedLiaisons);
  }, [savedLiaisons]);

  const toggleLiaison = (liaison: string) => {
    setSelectedLiaisons((prevSelected) =>
      prevSelected.includes(liaison)
        ? prevSelected.filter((l) => l !== liaison)
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

  const formatLiaison = (baseA: string, baseB: string) => `${baseA} @ ${baseB}`;

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center modal-backdrop bg-black bg-opacity-50">
      <div className="modal-content bg-white p-6 rounded shadow-lg w-full max-w-lg space-y-4">
        <h3 className="text-xl font-bold">Sélectionner les liaisons</h3>
        <div className="flex justify-between items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isLiaisonMode}
              onChange={() => onToggleLiaisonMode(!isLiaisonMode)}
              className="mr-2"
              disabled={selectedLiaisons.length > 0}
            />
            Mode Liaison
          </label>
          <button
            onClick={handleClearAll}
            disabled={selectedLiaisons.length === 0}
            className={`py-2 px-4 rounded shadow flex items-center ${
              selectedLiaisons.length === 0
                ? "bg-gray-200 text-gray-500"
                : "bg-red-500 text-white"
            }`}
          >
            <FaTrash className="mr-2" />
            Effacer tout
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-4 max-h-60 overflow-y-auto">
          {distances.map((distance, index) => {
            const liaison = formatLiaison(
              distance.baseAName,
              distance.baseBName
            );
            return (
              <button
                key={index}
                onClick={() => toggleLiaison(liaison)}
                className={`py-2 px-4 rounded shadow flex items-center justify-between ${
                  selectedLiaisons.includes(liaison)
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                <span>{liaison}</span>
                <FaLink />
              </button>
            );
          })}
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={closeModal}
            className="py-2 px-4 bg-gray-500 text-white rounded shadow flex items-center"
          >
            <FaTimes className="mr-2" />
            Annuler
          </button>
          <button
            onClick={handleSaveLiaisons}
            className="py-2 px-4 bg-blue-500 text-white rounded shadow flex items-center"
          >
            <FaSave className="mr-2" />
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocalisationLiaisonModal;
