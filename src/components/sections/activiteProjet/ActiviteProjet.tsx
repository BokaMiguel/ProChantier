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
import { useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  Employe,
  ActivitePlanif,
  initialActivite,
} from "../../../models/JournalFormModel";
import StatsGrid from "../StatsGrid";
import LocalisationModal from "./LocalisationModal";
import LocalisationLiaisonModal from "./LocalisationLiaisonModal";
import { getDistancesForLieu } from "../../../services/JournalService";

const ActiviteProjet: React.FC<{ users: Employe[] }> = ({ users }) => {
  const { idPlanif } = useParams<{ idPlanif: string }>();
  const {
    activitesPlanif,
    activites,
    lieux,
    bases,
    sousTraitants,
    signalisations,
  } = useAuth();

  const [activitesState, setActivitesState] = useState<ActivitePlanif[]>([
    initialActivite,
  ]);
  const [nextId, setNextId] = useState(2);
  const [showModal, setShowModal] = useState(false);
  const [currentActiviteId, setCurrentActiviteId] = useState<number | null>(
    null
  );
  const [isLiaisonMode, setIsLiaisonMode] = useState<boolean>(false);
  const [savedBases, setSavedBases] = useState<string[]>([]);
  const [savedLiaisons, setSavedLiaisons] = useState<string[]>([]);
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

  const [distances, setDistances] = useState<any[]>([]);

  const getBasesForCurrentLieu = (lieuId: number): string[] => {
    return (
      bases
        ?.filter((base) => base.lieuId === lieuId)
        .map((base) => base.base) || []
    );
  };

  const handleToggleLiaisonMode = (mode: boolean) => {
    setIsLiaisonMode(mode);
  };

  const fetchDistances = async (lieuId: number) => {
    try {
      const data = await getDistancesForLieu(lieuId);
      const mappedDistances = data.map((distance: any) => ({
        ...distance,
        baseAName:
          bases?.find((base) => base.id === distance.baseA)?.base || "N/A",
        baseBName:
          bases?.find((base) => base.id === distance.baseB)?.base || "N/A",
      }));
      setDistances(mappedDistances);
    } catch (error) {
      console.error("Failed to fetch distances:", error);
    }
  };

  useEffect(() => {
    if (idPlanif && activitesPlanif && activites) {
      const currentPlanif = activitesPlanif.find(
        (planif) => planif.id === Number(idPlanif)
      );
      if (currentPlanif) {
        const relatedActivite = activites.find(
          (activite) => activite.id === currentPlanif.activiteID
        );
        const lieu = lieux?.find((l) => l.id === currentPlanif.lieuID);
        const entreprise = sousTraitants?.find(
          (st) => st.id === currentPlanif.defaultEntrepriseId
        );
        const signalisation = signalisations?.find(
          (sig) => sig.id === currentPlanif.signalisationId
        );

        setActivitesState([
          {
            ...currentPlanif,
            lieuID: lieu?.id,
            note: currentPlanif.note || "",
            defaultEntrepriseId: entreprise?.id,
            signalisationId: signalisation?.id,
          },
        ]);
        setSavedBases([]);
        setSavedLiaisons([]);

        if (lieu?.id) {
          fetchDistances(lieu.id);
        }
      }
    }
  }, [
    idPlanif,
    activitesPlanif,
    activites,
    lieux,
    bases,
    sousTraitants,
    signalisations,
  ]);

  useEffect(() => {
    Object.keys(notesRef.current).forEach((key: any) => {
      if (notesRef.current[key]) {
        notesRef.current[key]!.style.height = "auto";
        notesRef.current[key]!.style.height = `${
          notesRef.current[key]!.scrollHeight
        }px`;
      }
    });
  }, [activitesState]);

  const handleChange = (
    id: number,
    field: keyof ActivitePlanif,
    value: any
  ) => {
    const updatedActivites = activitesState.map((activite) => {
      if (activite.id === id) {
        return { ...activite, [field]: value };
      }
      return activite;
    });
    setActivitesState(updatedActivites);
  };

  const openModal = (id: number) => {
    setCurrentActiviteId(id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleBasesChange = (newBases: string[]) => {
    setSavedBases(newBases);
    closeModal();
  };

  const handleLiaisonsChange = (newLiaisons: string[]) => {
    setSavedLiaisons(newLiaisons);
    closeModal();
  };

  const clearAllLocalisations = () => {
    if (isLiaisonMode) {
      setSavedLiaisons([]);
    } else {
      setSavedBases([]);
    }
  };

  const requestDeleteActivite = (id: number) => {
    setDeleteConfirm({ show: true, id });
  };

  const confirmDeleteActivite = () => {
    if (deleteConfirm.id !== null) {
      setActivitesState((prevActivites) =>
        prevActivites.filter((activite) => activite.id !== deleteConfirm.id)
      );
      setLockedActivites((prevLockedActivites) =>
        prevLockedActivites.filter((lockedId) => lockedId !== deleteConfirm.id)
      );
      setDeleteConfirm({ show: false, id: null });
    }
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

  const renderActivites = () => {
    return activitesState.map((activite, index) => {
      const isLocked = lockedActivites.includes(activite.id);
      const lieuBases = activite.lieuID
        ? getBasesForCurrentLieu(activite.lieuID)
        : [];

      const displayedLocalisations = isLiaisonMode ? savedLiaisons : savedBases;

      return (
        <div
          key={activite.id}
          className="border rounded p-4 mb-4 shadow-md flex flex-col space-y-4 relative"
        >
          <h3 className="text-lg font-bold">
            {index + 1}.{" "}
            <span className="text-cyan-700">
              {activites?.find((act) => act.id === activite.activiteID)?.nom ||
                "Inconnu"}
            </span>
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

          <select
            value={activite.activiteID || ""}
            onChange={(e) =>
              handleChange(activite.id, "activiteID", parseInt(e.target.value))
            }
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            disabled={isLocked}
          >
            <option value="">Sélectionner une activité</option>
            {activites?.map((act) => (
              <option key={act.id} value={act.id}>
                {act.nom}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-12 gap-4 items-center">
            <label className="col-span-2 flex items-center">
              <FaMapSigns className="mr-2" />
              Lieu:
            </label>
            <select
              value={activite.lieuID || ""}
              onChange={(e) => {
                const selectedLieu = lieux?.find(
                  (lieu) => lieu.id === parseInt(e.target.value)
                );
                if (selectedLieu) {
                  handleChange(activite.id, "lieuID", selectedLieu.id);
                  setSavedBases([]);
                  setSavedLiaisons([]);
                  fetchDistances(selectedLieu.id);
                }
              }}
              className="col-span-7 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              disabled={isLocked}
            >
              <option value="">Sélectionner un lieu</option>
              {lieux?.map((lieu) => (
                <option key={lieu.id} value={lieu.id}>
                  {lieu.nom}
                </option>
              ))}
            </select>
            <div className="col-span-3 flex items-center">
              <FaCubes className="mr-2" />
              <input
                type="number"
                placeholder="Quantité"
                value={activite.quantite || 0}
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
            <textarea
              placeholder="Sélectionner des bases ou liaisons"
              value={displayedLocalisations.join(", ")}
              readOnly
              onClick={() => !isLocked && openModal(activite.id)}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-none ${
                isLocked ? "cursor-not-allowed" : "cursor-pointer"
              }`}
              style={{
                whiteSpace: "pre-wrap",
                overflowWrap: "break-word",
                height: "auto",
              }}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2 text-center">
              Notes / Remarques
            </label>
            <textarea
              ref={(el) => (notesRef.current[activite.id] = el)}
              placeholder="Écrire une note ou une remarque."
              value={activite.note || ""}
              onChange={(e) =>
                handleChange(activite.id, "note", e.target.value)
              }
              rows={3}
              className="shadow-inner border border-gray-400 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-none bg-gray-200"
              style={{ overflow: "hidden" }}
              readOnly={isLocked}
            />
          </div>

          {isLiaisonMode ? (
            <LocalisationLiaisonModal
              showModal={showModal}
              closeModal={closeModal}
              savedLiaisons={savedLiaisons}
              setSavedLiaisons={handleLiaisonsChange}
              distances={distances}
              onToggleLiaisonMode={handleToggleLiaisonMode}
              isLiaisonMode={isLiaisonMode}
              clearAllLocalisations={clearAllLocalisations}
            />
          ) : (
            <LocalisationModal
              showModal={showModal}
              closeModal={closeModal}
              savedLocalisations={savedBases}
              setSavedLocalisations={handleBasesChange}
              isLiaisonMode={isLiaisonMode}
              setIsLiaisonMode={setIsLiaisonMode}
              clearAllLocalisations={clearAllLocalisations}
              bases={lieuBases}
            />
          )}
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
        activiteCount={activitesState.length}
      />
      {activitesState.length > 5 && (
        <StatsGrid
          users={users.map((user) => ({
            id: user.id,
            nom: `${user.prenom} ${user.nom}`,
          }))}
          nextStep={true}
          activiteCount={activitesState.length - 5}
        />
      )}
      {renderActivites()}
      <button
        onClick={() => setNextId(nextId + 1)}
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
