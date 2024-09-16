import React, { useState, useEffect } from "react";
import { FaTrash, FaTimes, FaSave } from "react-icons/fa";
import "./LocalisationModal.scss";

interface LocalisationModalProps {
  showModal: boolean;
  closeModal: () => void;
  savedLocalisations: string[];
  setSavedLocalisations: (localisations: string[]) => void;
  isLiaisonMode: boolean;
  setIsLiaisonMode: React.Dispatch<React.SetStateAction<boolean>>;
  clearAllLocalisations: () => void;
  bases: string[];
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
}) => {
  const [selectedLocalisations, setSelectedLocalisations] =
    useState<string[]>(savedLocalisations);

  useEffect(() => {
    setSelectedLocalisations(savedLocalisations);
  }, [savedLocalisations]);

  const toggleLocalisation = (localisation: string) => {
    setSelectedLocalisations((prevSelected) =>
      prevSelected.includes(localisation)
        ? prevSelected.filter((loc) => loc !== localisation)
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
    <div className="fixed inset-0 flex items-center justify-center modal-backdrop bg-black bg-opacity-50">
      <div className="modal-content bg-white p-6 rounded shadow-lg w-full max-w-lg space-y-4">
        <h3 className="text-xl font-bold">Sélectionner une localisation</h3>
        <div className="flex justify-between items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isLiaisonMode}
              onChange={() => setIsLiaisonMode(!isLiaisonMode)}
              className="mr-2"
              disabled={selectedLocalisations.length > 0}
            />
            Mode Liaison
          </label>
          <button
            onClick={handleClearAll}
            disabled={selectedLocalisations.length === 0}
            className={`py-2 px-4 rounded shadow flex items-center ${
              selectedLocalisations.length === 0
                ? "bg-gray-200 text-gray-500"
                : "bg-red-500 text-white"
            }`}
          >
            <FaTrash className="mr-2" />
            Effacer tout
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {bases.map((loc) => (
            <button
              key={loc}
              onClick={() => toggleLocalisation(loc)}
              className={`py-2 px-4 rounded shadow ${
                selectedLocalisations.includes(loc)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              {loc}
            </button>
          ))}
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
            onClick={handleSaveLocalisations}
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

export default LocalisationModal;
