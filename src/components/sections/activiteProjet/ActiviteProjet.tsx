import React, { useState, useEffect, useRef } from "react";
import {
  FaMapMarkerAlt,
  FaCubes,
  FaMapSigns,
  FaTimes,
  FaPlusCircle,
  FaLock,
  FaUnlock,
} from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import {
  Employe,
  Activite,
  initialActivite,
} from "../../../models/JournalFormModel";
import StatsGrid from "../StatsGrid";
import LocalisationModal from "./LocalisationModal";

const ActiviteProjet: React.FC<{ users: Employe[] }> = ({ users }) => {
  const { lieux, bases } = useAuth(); // Récupérez les lieux et bases depuis le contexte
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
  const [lockedActivites, setLockedActivites] = useState<number[]>([]);
  const [lockConfirm, setLockConfirm] = useState<{
    show: boolean;
    id: number | null;
    lock: boolean;
  }>({ show: false, id: null, lock: false });
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    id: number | null;
  }>({ show: false, id: null });

  const notesRef = useRef<{ [key: number]: HTMLTextAreaElement | null }>({});

  useEffect(() => {
    Object.keys(notesRef.current).forEach((key: any) => {
      if (notesRef.current[key]) {
        notesRef.current[key]!.style.height = "auto";
        notesRef.current[key]!.style.height = `${
          notesRef.current[key]!.scrollHeight
        }px`;
      }
    });
  }, [activites]);

  const handleAddActivite = () => {
    const newActivite: Activite = {
      id: nextId,
      lieu: [],
      localisation: "",
      quantite: 0,
      nom: "",
      notes: "",
      startHour: "",
      endHour: "",
      isComplete: false,
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
      // Supprimer les parenthèses existantes avant d'en ajouter une nouvelle
      const localisation = savedLocalisations
        .map((loc) => loc.replace(/[()]/g, "")) // Enlever toutes les parenthèses
        .map((loc) => (loc.includes("@") ? `(${loc})` : loc)) // Ajouter parenthèses pour les liaisons
        .join(", ");

      handleChange(currentActiviteId, "localisation", localisation);
      closeModal();
    }
  };

  const requestDeleteActivite = (id: number) => {
    setDeleteConfirm({ show: true, id });
  };

  const confirmDeleteActivite = () => {
    if (deleteConfirm.id !== null) {
      setActivites((prevActivites) =>
        prevActivites.filter((activite) => activite.id !== deleteConfirm.id)
      );
      setLockedActivites((prevLockedActivites) =>
        prevLockedActivites.filter((lockedId) => lockedId !== deleteConfirm.id)
      );
      setDeleteConfirm({ show: false, id: null });
    }
  };

  const clearAllLocalisations = () => {
    setSelectedLocalisations([]);
    setSavedLocalisations([]);
    setShowConfirm(false);
  };

  const handleLockUnlock = (id: number, lock: boolean) => {
    setLockConfirm({ show: true, id, lock });
  };

  const confirmLockUnlock = () => {
    if (lockConfirm.id !== null) {
      if (lockConfirm.lock) {
        setLockedActivites((prevLockedActivites) => [
          ...prevLockedActivites,
          lockConfirm.id!,
        ]);
      } else {
        setLockedActivites((prevLockedActivites) =>
          prevLockedActivites.filter((lockedId) => lockedId !== lockConfirm.id)
        );
      }
      setLockConfirm({ show: false, id: null, lock: false });
    }
  };

  // Filtrer les bases par lieu sélectionné
  const getBasesForCurrentLieu = (lieuNom: string): string[] => {
    const lieu = lieux?.find((l) => l.nom === lieuNom);
    if (!lieu) return [];

    return (
      bases
        ?.filter((base) => base.lieuId === lieu.id)
        .map((base) => base.base) || []
    );
  };

  const renderActivites = () => {
    return activites.map((activite, index) => {
      const isLocked = lockedActivites.includes(activite.id);
      const lieuBases = getBasesForCurrentLieu(
        Array.isArray(activite.lieu)
          ? activite.lieu.join(", ")
          : activite.lieu ?? "" // Si activite.lieu est undefined, passer une chaîne vide
      );

      return (
        <div
          key={activite.id}
          className="border rounded p-4 mb-4 shadow-md flex flex-col space-y-4 relative"
        >
          <h3 className="text-lg font-bold">
            {index + 1}.{" "}
            {activite.nom && (
              <span className="text-cyan-700">{activite.nom}</span>
            )}
            {index > 0 && (
              <button
                onClick={() => requestDeleteActivite(activite.id)}
                className="absolute top-2 right-2 text-zinc-500 hover:text-red-700"
              >
                <FaTimes />
              </button>
            )}
            <button
              onClick={() => handleLockUnlock(activite.id, !isLocked)}
              style={{ fontSize: "1.0rem" }}
              className={`absolute top-2 right-8 ${
                isLocked ? "text-green-500" : "text-zinc-500"
              } hover:text-yellow-400`}
            >
              {isLocked ? <FaUnlock /> : <FaLock />}
            </button>
          </h3>
          <input
            type="text"
            placeholder="Nom de l'activité"
            value={activite.nom}
            onChange={(e) => handleChange(activite.id, "nom", e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            readOnly={isLocked}
          />
          <div className="grid grid-cols-12 gap-4 items-center">
            <label className="col-span-2 flex items-center">
              <FaMapSigns className="mr-2" />
              Lieu:
            </label>
            <select
              value={
                Array.isArray(activite.lieu)
                  ? activite.lieu.join(", ")
                  : activite.lieu ?? ""
              }
              onChange={(e) =>
                handleChange(activite.id, "lieu", e.target.value)
              }
              className="col-span-7 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              disabled={isLocked}
            >
              <option value="">Sélectionner un lieu</option>
              {lieux?.map((lieu, index) => (
                <option key={index} value={lieu.nom}>
                  {lieu.nom}
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
                readOnly={isLocked}
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
              onClick={() => !isLocked && openModal(activite.id)}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                isLocked ? "cursor-not-allowed" : "cursor-pointer"
              }`}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2 text-center">
              Notes / Remarques
            </label>
            <textarea
              ref={(el) => (notesRef.current[activite.id] = el)}
              placeholder="Écrire une note ou une remarque."
              value={activite.notes}
              onChange={(e) =>
                handleChange(activite.id, "notes", e.target.value)
              }
              rows={3}
              className="shadow-inner border border-gray-400 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-none bg-gray-200"
              style={{ overflow: "hidden" }}
              readOnly={isLocked}
            />
          </div>
          <LocalisationModal
            showModal={showModal}
            closeModal={closeModal}
            savedLocalisations={savedLocalisations}
            setSavedLocalisations={setSavedLocalisations}
            liaisonMode={liaisonMode}
            setLiaisonMode={setLiaisonMode}
            handleLocalisationChange={handleLocalisationChange}
            clearAllLocalisations={clearAllLocalisations}
            bases={lieuBases} // Passer les bases associées au lieu sélectionné
          />
        </div>
      );
    });
  };

  return (
    <div className="p-4 w-full space-y-4">
      <StatsGrid
        users={users.map((user) => ({
          id: user.id,
          nom: `${user.prenom} ${user.nom}`,
        }))}
        nextStep={false}
        activiteCount={activites.length}
      />
      {activites.length > 5 && (
        <StatsGrid
          users={users.map((user) => ({
            id: user.id,
            nom: `${user.prenom} ${user.nom}`,
          }))}
          nextStep={true}
          activiteCount={activites.length - 5}
        />
      )}
      {renderActivites()}
      <button
        onClick={handleAddActivite}
        className="w-full py-2 px-4 bg-blue-500 text-white rounded shadow flex items-center justify-center"
      >
        <FaPlusCircle className="mr-2" />
        Ajouter une activité
      </button>
      {lockConfirm.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              Confirmer{" "}
              {lockConfirm.lock ? "le verrouillage" : "le déverrouillage"}
            </h3>
            <p>
              Êtes-vous sûr de vouloir{" "}
              {lockConfirm.lock ? "verrouiller" : "déverrouiller"} cette
              activité?
            </p>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={() =>
                  setLockConfirm({ show: false, id: null, lock: false })
                }
                className="py-2 px-4 bg-gray-500 text-white rounded shadow"
              >
                Annuler
              </button>
              <button
                onClick={confirmLockUnlock}
                className="py-2 px-4 bg-yellow-600 text-white rounded shadow"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteConfirm.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Confirmer la suppression</h3>
            <p>Êtes-vous sûr de vouloir supprimer cette activité?</p>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={() => setDeleteConfirm({ show: false, id: null })}
                className="py-2 px-4 bg-gray-500 text-white rounded shadow"
              >
                Annuler
              </button>
              <button
                onClick={confirmDeleteActivite}
                className="py-2 px-4 bg-red-600 text-white rounded shadow"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiviteProjet;
