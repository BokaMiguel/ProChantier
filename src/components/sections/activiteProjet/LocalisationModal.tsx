import React, { useState } from "react";
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
}

const mockLocalisations = Array.from({ length: 20 }, (_, i) => `1-${i + 1}`);

const LocalisationModal: React.FC<LocalisationModalProps> = ({
  showModal,
  closeModal,
  savedLocalisations,
  setSavedLocalisations,
  liaisonMode,
  setLiaisonMode,
  handleLocalisationChange,
  clearAllLocalisations,
}) => {
  const [selectedLocalisations, setSelectedLocalisations] = useState<string[]>(
    []
  );
  const [showConfirm, setShowConfirm] = useState(false);

  const toggleLocalisation = (localisation: string) => {
    if (liaisonMode) {
      setSelectedLocalisations((prevSelected) =>
        prevSelected.includes(localisation)
          ? prevSelected.filter((loc) => loc !== localisation)
          : [...prevSelected, localisation]
      );
    } else {
      setSavedLocalisations((prevSelected) =>
        prevSelected.includes(localisation)
          ? prevSelected.filter((loc) => loc !== localisation)
          : [...prevSelected, localisation]
      );
    }
  };

  const addLiaison = () => {
    if (selectedLocalisations.length > 1) {
      const liaison = selectedLocalisations.join("@");
      setSelectedLocalisations([]);
      setSavedLocalisations((prevSelected) => [...prevSelected, liaison]);
    }
  };

  const deleteLocalisation = (loc: string) => {
    setSavedLocalisations((prevSelected) =>
      prevSelected.filter((selected) => selected !== loc)
    );
  };

  const renderSelectedLocalisations = (
    localisations: string[],
    deletable = true
  ) => {
    return localisations.map((loc) => {
      const isLiaison = loc.includes("@");
      return (
        <div
          key={loc}
          className={`py-1 px-3 rounded-full mb-2 ${
            isLiaison ? "bg-blue-200" : "bg-green-200"
          } flex items-center space-x-2 modal-localisation`}
        >
          <span>{loc}</span>
          {deletable && (
            <button
              onClick={() => deleteLocalisation(loc)}
              className="text-red-500 hover:text-red-700"
            >
              X
            </button>
          )}
        </div>
      );
    });
  };

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg space-y-4">
            <h3 className="text-xl font-bold">Sélectionner une localisation</h3>
            <div className="flex justify-between items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={liaisonMode}
                  onChange={() => {
                    setLiaisonMode(!liaisonMode);
                    setSelectedLocalisations([]);
                  }}
                  className="mr-2"
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
              {mockLocalisations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => toggleLocalisation(loc)}
                  className={`py-2 px-4 rounded shadow ${
                    savedLocalisations.includes(loc) ||
                    selectedLocalisations.includes(loc)
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
                  onClick={addLiaison}
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
                {renderSelectedLocalisations(savedLocalisations, true)}
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
            {showConfirm && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                  <h3 className="text-xl font-bold mb-4">
                    Confirmer la Suppression
                  </h3>
                  <p>
                    Êtes-vous sûr de vouloir effacer toutes les localisations?
                  </p>
                  <div className="flex justify-end space-x-4 mt-4">
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="py-2 px-4 bg-gray-500 text-white rounded shadow"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={clearAllLocalisations}
                      className="py-2 px-4 bg-red-500 text-white rounded shadow"
                    >
                      Effacer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default LocalisationModal;
