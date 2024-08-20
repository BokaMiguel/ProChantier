import React, { useState, useEffect } from "react";
import { FaTrash, FaTimes, FaSave } from "react-icons/fa";
import "./LocalisationModal.scss";

interface LocalisationModalProps {
  showModal: boolean;
  closeModal: () => void;
  savedLocalisations: string[];
  setSavedLocalisations: React.Dispatch<React.SetStateAction<string[]>>;
  liaisonMode: boolean;
  setLiaisonMode: React.Dispatch<React.SetStateAction<boolean>>;
  handleLocalisationChange: () => void;
  clearAllLocalisations: () => void;
  bases: string[]; // Ajouter la liste des bases en tant que prop
}

const LocalisationModal: React.FC<LocalisationModalProps> = ({
  showModal,
  closeModal,
  savedLocalisations,
  setSavedLocalisations,
  liaisonMode,
  setLiaisonMode,
  handleLocalisationChange,
  bases,
}) => {
  const [selectedLocalisations, setSelectedLocalisations] = useState<string[]>(
    []
  );
  const [showConfirm, setShowConfirm] = useState(false);

  const toggleLocalisation = (localisation: string) => {
    setSavedLocalisations((prevSelected) =>
      prevSelected.includes(localisation)
        ? prevSelected.filter((loc) => loc !== localisation)
        : [...prevSelected, localisation]
    );
  };

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center modal-backdrop bg-black bg-opacity-50">
          <div className="modal-content bg-white p-6 rounded shadow-lg w-full max-w-lg space-y-4">
            <h3 className="text-xl font-bold">Sélectionner une localisation</h3>
            <div className="flex justify-between items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={liaisonMode}
                  onChange={() => setLiaisonMode(!liaisonMode)}
                  className="mr-2"
                  disabled={savedLocalisations.length > 0} // Désactive la case à cocher si des bases simples sont sélectionnées
                />
                Mode Liaison
              </label>
              <button
                onClick={() => setShowConfirm(true)}
                disabled={savedLocalisations.length === 0}
                className={`py-2 px-4 rounded shadow flex items-center ${
                  savedLocalisations.length === 0
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
                    savedLocalisations.includes(loc)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
            {liaisonMode && selectedLocalisations.length > 0 && (
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => {
                    const liaison = selectedLocalisations.join("@");
                    setSavedLocalisations((prevSelected) => [
                      ...prevSelected,
                      liaison,
                    ]);
                    setSelectedLocalisations([]);
                  }}
                  className="py-2 px-4 bg-blue-500 text-white rounded shadow"
                >
                  Ajouter Liaison
                </button>
              </div>
            )}
            <div className="border rounded p-4 shadow-inner">
              <h4 className="text-left font-bold mb-2">
                Localisations enregistrées
              </h4>
              <div className="flex flex-wrap space-x-2 space-y-2">
                {savedLocalisations.map((loc) => (
                  <div
                    key={loc}
                    className="py-1 px-3 rounded-full mb-2 bg-green-200 flex items-center space-x-2 modal-localisation"
                  >
                    <span>{loc}</span>
                    <button
                      onClick={() =>
                        setSavedLocalisations((prevSelected) =>
                          prevSelected.filter((selected) => selected !== loc)
                        )
                      }
                      className="text-red-500 hover:text-red-700"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
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
                onClick={handleLocalisationChange}
                className="py-2 px-4 bg-blue-500 text-white rounded shadow flex items-center"
              >
                <FaSave className="mr-2" />
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LocalisationModal;
