import React, { useEffect, useRef, useState } from "react";
import {
  FaMapMarkerAlt,
  FaCubes,
  FaMapSigns,
  FaTimes,
  FaPlusCircle,
} from "react-icons/fa";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  ActivitePlanif,
  Employe,
  JournalUserStats,
  Localisation,
  LocalisationDistance,
  UserStat,
} from "../../../models/JournalFormModel";
import StatsGrid from "../StatsGrid";
import LocalisationModal from "./LocalisationModal";
import LocalisationLiaisonModal from "./LocalisationLiaisonModal";
import { getDistancesForLieu } from "../../../services/JournalService";

interface ActiviteProjetProps {
  users: Employe[];
  activitesState: ActivitePlanif[];
  setActivitesState: React.Dispatch<React.SetStateAction<ActivitePlanif[]>>;
  savedBases: Localisation[];
  setSavedBases: React.Dispatch<React.SetStateAction<Localisation[]>>;
  savedLiaisons: LocalisationDistance[];
  setSavedLiaisons: React.Dispatch<
    React.SetStateAction<LocalisationDistance[]>
  >;
  userStats: UserStat[];
  setUserStats: (newUserStats: JournalUserStats) => void;
  savedBasesAttachment: string[];
  setSavedBasesAttachment: React.Dispatch<React.SetStateAction<string[]>>;
}

const ActiviteProjet: React.FC<ActiviteProjetProps> = ({
  users,
  activitesState,
  setActivitesState,
  setSavedBases,
  setSavedLiaisons,
  setUserStats,
  userStats,
}) => {
  const { idPlanif } = useParams<{ idPlanif: string }>();
  const {
    activitesPlanif,
    activites,
    lieux,
    bases,
    sousTraitants,
    signalisations,
  } = useAuth();

  const [nextId, setNextId] = useState(2);
  const [showModal, setShowModal] = useState(false);
  const [currentActiviteId, setCurrentActiviteId] = useState<number | null>(
    null
  );
  const [isLiaisonMode, setIsLiaisonMode] = useState<boolean>(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    id: number | null;
  }>({ show: false, id: null });

  const notesRef = useRef<{ [key: number]: HTMLTextAreaElement | null }>({});

  const [distances, setDistances] = useState<LocalisationDistance[]>([]);

  const getBasesForCurrentLieu = (lieuId: number): Localisation[] => {
    return bases?.filter((base) => base.lieuId === lieuId) || [];
  };

  const handleToggleLiaisonMode = (mode: boolean) => {
    setIsLiaisonMode(mode);
  };

  const fetchDistances = async (lieuId: number) => {
    try {
      const data = await getDistancesForLieu(lieuId);
      setDistances(data);
    } catch (error) {
      console.error("Failed to fetch distances:", error);
    }
  };

  useEffect(() => {
    if (idPlanif && activitesPlanif && activites && lieux && bases) {
      const currentPlanif = activitesPlanif.find(
        (planif) => planif.id === parseInt(idPlanif)
      );

      if (currentPlanif) {
        const lieu = lieux.find((l) => l.id === currentPlanif.lieuID);
        const entreprise = sousTraitants?.find(
          (st) => st.id === currentPlanif.defaultEntrepriseId
        );
        const signalisation = signalisations?.find(
          (sig) => sig.id === currentPlanif.signalisationId
        );

        // Initialize user stats
        const initialUserStats = users.map((user) => ({
          id: user.id,
          nom: user.nom,
          act: Array(10).fill(0),
          ts: 0,
          td: 0,
        }));

        setUserStats({
          userStats: initialUserStats,
          totals: {
            act: Array(5).fill(0),
            ts: 0,
            td: 0,
          },
        });

        setActivitesState([
          {
            ...currentPlanif,
            lieuID: lieu?.id ?? null,
            note: currentPlanif.note || "",
            defaultEntrepriseId: entreprise?.id ?? null,
            signalisationId: signalisation?.id ?? null,
            bases: [],
            liaisons: [],
          },
        ]);

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
    setActivitesState((prevState) =>
      prevState.map((activite) => {
        if (activite.id === id) {
          const updatedActivite = { ...activite, [field]: value };

          if (field === "lieuID") {
            updatedActivite.bases = [];
            updatedActivite.liaisons = [];

            if (value) {
              fetchDistances(value);
            }
          }

          return updatedActivite;
        }
        return activite;
      })
    );
  };

  const openModal = (id: number) => {
    setCurrentActiviteId(id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleBasesChange = (newBases: Localisation[], activiteId: number) => {
    setActivitesState((prevState) =>
      prevState.map((activite) =>
        activite.id === activiteId
          ? {
              ...activite,
              bases: newBases,
              quantite: newBases.length,
            }
          : activite
      )
    );
    setSavedBases(newBases);
    closeModal();
  };

  const handleLiaisonsChange = (
    newLiaisons: LocalisationDistance[],
    activiteId: number
  ) => {
    setActivitesState((prevState) =>
      prevState.map((activite) =>
        activite.id === activiteId
          ? {
              ...activite,
              liaisons: newLiaisons,
              quantite: newLiaisons.length,
            }
          : activite
      )
    );
    setSavedLiaisons(newLiaisons);
    closeModal();
  };

  const clearAllLocalisations = (activiteId: number) => {
    setActivitesState((prevState) =>
      prevState.map((activite) =>
        activite.id === activiteId
          ? { ...activite, bases: [], liaisons: [] }
          : activite
      )
    );
    setSavedBases([]);
    setSavedLiaisons([]);
  };

  const requestDeleteActivite = (id: number) => {
    setDeleteConfirm({ show: true, id });
  };

  const confirmDeleteActivite = () => {
    if (deleteConfirm.id !== null) {
      setActivitesState((prevActivites) =>
        prevActivites.filter((activite) => activite.id !== deleteConfirm.id)
      );
      setDeleteConfirm({ show: false, id: null });
    }
  };

  const addNewActivity = () => {
    setNextId(nextId + 1);
    setActivitesState((prevState) => [
      ...prevState,
      {
        id: nextId,
        activiteID: null,
        lieuID: null,
        quantite: 0,
        note: "",
        date: new Date().toISOString(),
        hrsDebut: "",
        hrsFin: "",
        defaultEntrepriseId: null,
        signalisationId: null,
        bases: [],
        liaisons: [],
      } as ActivitePlanif,
    ]);
  };

  const getUsedBases = (currentActiviteId: number): number[] => {
    return activitesState
      .filter((activite) => activite.id !== currentActiviteId)
      .flatMap((activite) => activite.bases?.map((base) => base.id) || []);
  };

  const getUsedLiaisons = (currentActiviteId: number): number[] => {
    return activitesState
      .filter((activite) => activite.id !== currentActiviteId)
      .flatMap((activite) => activite.liaisons?.map((liaison) => liaison.id) || []);
  };

  const renderActivites = () => {
    return activitesState.map((activite, index) => {
      const lieuBases = activite.lieuID
        ? getBasesForCurrentLieu(activite.lieuID)
        : [];

      const usedBases = getUsedBases(activite.id);
      const usedLiaisons = getUsedLiaisons(activite.id);

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
          </h3>

          <select
            value={activite.activiteID || ""}
            onChange={(e) =>
              handleChange(activite.id, "activiteID", parseInt(e.target.value))
            }
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">Sélectionner une activité</option>
            {activites?.map((act) => (
              <option key={act.id} value={act.id}>
                {act.nom}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-12 gap-4 items-center mb-4">
            <label className="col-span-2 flex items-center whitespace-nowrap">
              <FaMapSigns className="mr-2" />
              Lieu:
            </label>
            <select
              value={activite.lieuID || ""}
              onChange={(e) => {
                const selectedLieuId = parseInt(e.target.value);
                handleChange(activite.id, "lieuID", selectedLieuId || null);
              }}
              className="col-span-7 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Sélectionner un lieu</option>
              {lieux?.map((lieu) => (
                <option key={lieu.id} value={lieu.id}>
                  {lieu.nom}
                </option>
              ))}
            </select>
            <div className="col-span-3 flex items-center gap-2">
              <FaCubes className="flex-shrink-0" />
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
                className="flex-1 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          </div>
          <div className="flex items-center">
            <FaMapMarkerAlt className="mr-2" />
            <textarea
              placeholder="Sélectionner des bases ou liaisons"
              value={
                activite.lieuID
                  ? [
                      ...(activite.bases?.map((base) => base.base) || []),
                      ...(activite.liaisons?.map(
                        (liaison) => `${liaison.baseA} @ ${liaison.baseB}`
                      ) || []),
                    ].join(", ")
                  : "Veuillez d'abord sélectionner un lieu"
              }
              readOnly
              onClick={() => {
                if (activite.lieuID) {
                  openModal(activite.id);
                }
              }}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-none ${
                activite.lieuID ? "cursor-pointer" : "cursor-not-allowed"
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
            />
          </div>
          {activite.lieuID && (
            <>
              {isLiaisonMode ? (
                <LocalisationLiaisonModal
                  showModal={showModal && currentActiviteId === activite.id}
                  closeModal={closeModal}
                  savedLiaisons={activite.liaisons || []}
                  setSavedLiaisons={(liaisons) =>
                    handleLiaisonsChange(liaisons, activite.id)
                  }
                  distances={distances}
                  onToggleLiaisonMode={handleToggleLiaisonMode}
                  isLiaisonMode={isLiaisonMode}
                  clearAllLocalisations={() =>
                    clearAllLocalisations(activite.id)
                  }
                  usedLiaisons={usedLiaisons}
                />
              ) : (
                <LocalisationModal
                  showModal={showModal && currentActiviteId === activite.id}
                  closeModal={closeModal}
                  savedLocalisations={activite.bases || []}
                  setSavedLocalisations={(bases) =>
                    handleBasesChange(bases, activite.id)
                  }
                  isLiaisonMode={isLiaisonMode}
                  setIsLiaisonMode={setIsLiaisonMode}
                  clearAllLocalisations={() =>
                    clearAllLocalisations(activite.id)
                  }
                  bases={lieuBases}
                  usedBases={usedBases}
                />
              )}
            </>
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
        setUserStats={setUserStats}
        userStats={userStats}
      />
      {activitesState.length > 5 && (
        <StatsGrid
          users={users.map((user) => ({
            id: user.id,
            nom: `${user.prenom} ${user.nom}`,
          }))}
          nextStep={true}
          activiteCount={activitesState.length - 5}
          setUserStats={setUserStats}
          userStats={userStats}
        />
      )}
      {renderActivites()}
      <button
        onClick={addNewActivity}
        className="w-full py-2 px-4 bg-blue-500 text-white rounded shadow flex items-center justify-center"
      >
        <FaPlusCircle className="mr-2" />
        Ajouter une activité
      </button>
      {deleteConfirm.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Confirmer la suppression</h3>
            <p>Êtes-vous sûr de vouloir supprimer cette activité ?</p>
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
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiviteProjet;
