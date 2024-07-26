import React, { useState, useEffect, useRef } from "react";
import {
  FaMapMarkerAlt,
  FaCubes,
  FaMapSigns,
  FaTrash,
  FaTimes,
  FaSave,
  FaPlusCircle,
} from "react-icons/fa";
import StatsGrid from "../StatsGrid";

interface Activite {
  id: number;
  nom: string;
  lieu: string;
  localisation: string;
  quantite: number;
}

interface User {
  id: number;
  nom: string;
}

const initialActivite: Activite = {
  id: 1,
  nom: "",
  lieu: "",
  localisation: "",
  quantite: 0,
};

const mockLocalisations = Array.from({ length: 20 }, (_, i) => `1-${i + 1}`);
const mockLieux = ["Site A", "Site B", "Site C", "Site D", "Site E"];

const ActiviteProjet: React.FC<{ users: User[] }> = ({ users }) => {
  const [activites, setActivites] = useState<Activite[]>([initialActivite]);
  const [nextId, setNextId] = useState(2);
  const [showModal, setShowModal] = useState(false);
  const [currentActiviteId, setCurrentActiviteId] = useState<number | null>(
    null
  );
  const [selectedLocalisations, setSelectedLocalisations] = useState<string[]>(
    []
  );
  const [savedLocalisations, setSavedLocalisations] = useState<string[]>([]);
  const [liaisonMode, setLiaisonMode] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [notes, setNotes] = useState("");

  const notesRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (notesRef.current) {
      notesRef.current.style.height = "auto";
      notesRef.current.style.height = `${notesRef.current.scrollHeight}px`;
    }
  }, [notes]);

  const handleAddActivite = () => {
    const newActivite: Activite = {
      id: nextId,
      lieu: "",
      localisation: "",
      quantite: 0,
      nom: "",
    };
    setActivites((prevActivites) => [...prevActivites, newActivite]);
    setNextId(nextId + 1);
  };

  const handleChange = (
    id: number,
    field: keyof Activite,
    value: string | number
  ) => {
    const updatedActivites = activites.map((activite) => {
      if (activite.id === id) {
        return { ...activite, [field]: value };
      }
      return activite;
    });
    setActivites(updatedActivites);
  };

  const openModal = (id: number) => {
    setCurrentActiviteId(id);
    const currentActivite = activites.find((activite) => activite.id === id);
    if (currentActivite) {
      setSavedLocalisations(
        currentActivite.localisation
          ? currentActivite.localisation.split(", ")
          : []
      );
    }
    setSelectedLocalisations([]);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setLiaisonMode(false);
  };

  const handleLocalisationChange = () => {
    if (currentActiviteId !== null) {
      const localisation = savedLocalisations
        .map((loc) => (loc.includes("@") ? `(${loc})` : loc))
        .join(", ");
      handleChange(currentActiviteId, "localisation", localisation);
      closeModal();
    }
  };

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

  const clearAllLocalisations = () => {
    setSelectedLocalisations([]);
    setSavedLocalisations([]);
    setShowConfirm(false);
  };

  const deleteActivite = (id: number) => {
    setActivites((prevActivites) =>
      prevActivites.filter((activite) => activite.id !== id)
    );
  };

  const renderActivites = () => {
    return activites.map((activite, index) => (
      <div
        key={activite.id}
        className="border rounded p-4 mb-4 shadow-md flex flex-col space-y-4 relative"
      >
        <h3 className="text-lg font-bold">
          Activité {index + 1}{" "}
          {activite.nom && (
            <span className="text-cyan-700">({activite.nom})</span>
          )}
          {index > 0 && (
            <button
              onClick={() => deleteActivite(activite.id)}
              className="absolute top-2 right-2 text-zinc-500 hover:text-red-700"
            >
              <FaTimes />
            </button>
          )}
        </h3>
        <input
          type="text"
          placeholder="Nom de l'activité"
          value={activite.nom}
          onChange={(e) => handleChange(activite.id, "nom", e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
        <div className="grid grid-cols-12 gap-4 items-center">
          <label className="col-span-2 flex items-center">
            <FaMapSigns className="mr-2" />
            Lieu:
          </label>
          <select
            value={activite.lieu}
            onChange={(e) => handleChange(activite.id, "lieu", e.target.value)}
            className="col-span-7 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">Sélectionner un lieu</option>
            {mockLieux.map((lieu, index) => (
              <option key={index} value={lieu}>
                {lieu}
              </option>
            ))}
          </select>
          <div className="col-span-3 flex items-center">
            <FaCubes className="mr-2" />
            <input
              type="number"
              placeholder="Quantité"
              value={activite.quantite}
              onChange={(e) =>
                handleChange(
                  activite.id,
                  "quantite",
                  parseFloat(e.target.value) || 0
                )
              }
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        </div>
        <div className="flex items-center">
          <FaMapMarkerAlt className="mr-2" />
          <input
            type="text"
            placeholder="Localisation"
            value={activite.localisation}
            readOnly
            onClick={() => openModal(activite.id)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline cursor-pointer"
          />
        </div>
      </div>
    ));
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
          } flex items-center space-x-2`}
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
    <div className="p-4 w-full space-y-4">
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Notes / Remarques
        </label>
        <textarea
          ref={notesRef}
          placeholder="Écrire une note ou une remarque."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="shadow-inner border border-gray-400 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-none bg-gray-200"
          style={{ overflow: "hidden" }}
        />
      </div>
      <StatsGrid
        users={users.map((user) => ({ id: user.id, nom: user.nom }))}
      />
      {renderActivites()}
      <button
        onClick={handleAddActivite}
        className="w-full py-2 px-4 bg-blue-500 text-white rounded shadow flex items-center justify-center"
      >
        <FaPlusCircle className="mr-2" />
        Ajouter une activité
      </button>
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
    </div>
  );
};

export default ActiviteProjet;
