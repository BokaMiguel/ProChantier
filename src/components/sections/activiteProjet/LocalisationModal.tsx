import React, { useState, useEffect } from "react";
import { FaTrash, FaTimes, FaSave } from "react-icons/fa";
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
  const [selectedLocalisations, setSelectedLocalisations] =
    useState<Localisation[]>(savedLocalisations);

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
        className="bg-white p-6 rounded shadow-lg w-full max-w-lg space-y-4"
        style={{ zIndex: 10001 }}
      >
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
        <div className="grid grid-cols-4 gap-2 mb-4 max-h-60 overflow-y-auto">
          {bases.map((loc) => (
            <button
              key={loc.id}
              onClick={() => toggleLocalisation(loc)}
              className={`py-2 px-4 rounded shadow ${
                selectedLocalisations.some((selected) => selected.id === loc.id)
                  ? "bg-blue-500 text-white"
                  : usedBases.includes(loc.id)
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : "bg-gray-200"
              }`}
              disabled={usedBases.includes(loc.id)}
            >
              {loc.base}
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
