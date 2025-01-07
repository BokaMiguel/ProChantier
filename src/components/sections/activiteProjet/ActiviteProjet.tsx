import React, { useEffect, useRef, useState } from "react";
import {
  FaMapMarkerAlt,
  FaHardHat,
  FaMapSigns,
  FaTimes,
  FaPlusCircle,
  FaComment,
  FaRuler,
  FaHashtag,
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
    setActivitesState((prevState) =>
      prevState.map((activite) => ({
        ...activite,
        quantite: mode
          ? activite.liaisons?.reduce(
              (total, liaison) => total + (liaison.distanceInMeters || 0),
              0
            ) || 0
          : activite.bases?.length || 0,
      }))
    );
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

  const getUsedBases = (currentActiviteId: number): number[] => {
    return activitesState
      .filter((activite) =>
        activite.id !== currentActiviteId &&
        activite.activiteID ===
          activitesState.find((a) => a.id === currentActiviteId)?.activiteID &&
        activite.lieuID ===
          activitesState.find((a) => a.id === currentActiviteId)?.lieuID
      )
      .flatMap((activite) => activite.bases?.map((base) => base.id) || []);
  };

  const getUsedLiaisons = (currentActiviteId: number): number[] => {
    return activitesState
      .filter((activite) =>
        activite.id !== currentActiviteId &&
        activite.activiteID ===
          activitesState.find((a) => a.id === currentActiviteId)?.activiteID &&
        activite.lieuID ===
          activitesState.find((a) => a.id === currentActiviteId)?.lieuID
      )
      .flatMap((activite) =>
        activite.liaisons?.map((liaison) => liaison.id) || []
      );
  };

  const calculateQuantity = (activite: ActivitePlanif) => {
    if (isLiaisonMode && activite.liaisons && activite.liaisons.length > 0) {
      return activite.liaisons.reduce(
        (total, liaison) => total + (liaison.distanceInMeters || 0),
        0
      );
    } else if (!isLiaisonMode && activite.bases && activite.bases.length > 0) {
      return activite.bases.length;
    }
    return 0;
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
              quantite: isLiaisonMode
                ? newLiaisons.reduce(
                    (total, liaison) => total + (liaison.distanceInMeters || 0),
                    0
                  )
                : activite.quantite,
            }
          : activite
      )
    );
  };

  const handleBasesChange = (newBases: Localisation[], activiteId: number) => {
    setActivitesState((prevState) =>
      prevState.map((activite) =>
        activite.id === activiteId
          ? {
              ...activite,
              bases: newBases,
              quantite: !isLiaisonMode ? newBases.length : activite.quantite,
            }
          : activite
      )
    );
  };

  const handleUpdateLiaisons = (activiteId: number, newLiaisons: LocalisationDistance[]) => {
    handleLiaisonsChange(newLiaisons, activiteId);
    setSavedLiaisons(newLiaisons);
  };

  const handleUpdateBases = (activiteId: number, newBases: Localisation[]) => {
    handleBasesChange(newBases, activiteId);
    setSavedBases(newBases);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

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

          if (field === "bases" || field === "liaisons") {
            updatedActivite.quantite = calculateQuantity(updatedActivite);
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

  const clearAllLocalisations = (activiteId: number) => {
    setActivitesState((prevState) =>
      prevState.map((activite) =>
        activite.id === activiteId
          ? { ...activite, bases: [], liaisons: [], quantite: 0 }
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

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
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
      <div className="space-y-6">
        {activitesState.map((activite, index) => {
          const lieuBases = activite.lieuID
            ? getBasesForCurrentLieu(activite.lieuID)
            : [];

          const usedBases = getUsedBases(activite.id);
          const usedLiaisons = getUsedLiaisons(activite.id);

          const selectedActivity = activites?.find(
            (act) => act.id === activite.activiteID
          );

          const isLiaison = selectedActivity?.type === "liaison";

          return (
            <div
              key={activite.id}
              className="bg-white rounded-lg shadow-md p-6 mb-8 relative"
            >
              <div className="grid grid-cols-1 gap-6">
                {/* Header avec le nom de l'activité */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    {index + 1}.{" "}
                    <span className="text-blue-600 ml-2">
                      {activites?.find((act) => act.id === activite.activiteID)?.nom ||
                        "Nouvelle activité"}
                    </span>
                  </h3>
                  {index > 0 && (
                    <button
                      onClick={() => requestDeleteActivite(activite.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                      title="Supprimer l'activité"
                    >
                      <FaTimes className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-4">
                    <div className="flex items-center mb-2">
                      <span className="bg-blue-100 p-2 rounded-full">
                        <FaHardHat className="text-blue-600 w-4 h-4" />
                      </span>
                      <label className="text-gray-700 text-sm font-semibold ml-2">
                        Activité
                      </label>
                    </div>
                    <select
                      value={activite.activiteID || ""}
                      onChange={(e) =>
                        handleChange(
                          activite.id,
                          "activiteID",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="">Sélectionner une activité</option>
                      {activites?.map((act) => (
                        <option key={act.id} value={act.id}>
                          {act.nom}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-4">
                    <div className="flex items-center mb-2">
                      <span className="bg-blue-100 p-2 rounded-full">
                        <FaMapSigns className="text-blue-600 w-4 h-4" />
                      </span>
                      <label className="text-gray-700 text-sm font-semibold ml-2">
                        Lieu
                      </label>
                    </div>
                    <select
                      value={activite.lieuID || ""}
                      onChange={(e) =>
                        handleChange(
                          activite.id,
                          "lieuID",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="">Sélectionner un lieu</option>
                      {lieux?.map((lieu) => (
                        <option key={lieu.id} value={lieu.id}>
                          {lieu.nom}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-4">
                    <div className="flex items-center mb-2">
                      <span className="bg-blue-100 p-2 rounded-full">
                        {activite.liaisons?.length ? (
                          <FaRuler className="text-blue-600 w-4 h-4" />
                        ) : (
                          <FaHashtag className="text-blue-600 w-4 h-4" />
                        )}
                      </span>
                      <label className="text-gray-700 text-sm font-semibold ml-2">
                        {activite.liaisons?.length ? "Distance (m)" : "Quantité"}
                      </label>
                    </div>
                    <input
                      type="number"
                      value={activite.quantite || ""}
                      onChange={(e) =>
                        handleChange(
                          activite.id,
                          "quantite",
                          parseFloat(e.target.value)
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder={activite.liaisons?.length ? "Distance en mètres" : "Quantité"}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center mb-2">
                    <span className="bg-blue-100 p-2 rounded-full">
                      <FaMapMarkerAlt className="text-blue-600 w-4 h-4" />
                    </span>
                    <label className="text-gray-700 text-sm font-semibold ml-2">
                      Bases et liaisons
                    </label>
                  </div>
                  <div
                    onClick={() => {
                      if (activite.lieuID) {
                        openModal(activite.id);
                      }
                    }}
                    className={`w-full min-h-[80px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      activite.lieuID ? "cursor-pointer hover:bg-gray-50" : "cursor-not-allowed bg-gray-50"
                    }`}
                  >
                    {activite.lieuID ? (
                      <div className="flex flex-wrap gap-2">
                        {activite.bases?.map((base, index) => (
                          <span
                            key={`base-${index}`}
                            className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                          >
                            {base.base}
                          </span>
                        ))}
                        {activite.liaisons?.map((liaison, index) => (
                          <span
                            key={`liaison-${index}`}
                            className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                          >
                            {liaison.baseA} → {liaison.baseB}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">Veuillez d'abord sélectionner un lieu</span>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center mb-2">
                    <span className="bg-blue-100 p-2 rounded-full">
                      <FaComment className="text-blue-600 w-4 h-4" />
                    </span>
                    <label className="text-gray-700 text-sm font-semibold ml-2">
                      Commentaire
                    </label>
                  </div>
                  <textarea
                    ref={(el) => (notesRef.current[activite.id] = el)}
                    value={activite.note || ""}
                    onChange={(e) =>
                      handleChange(activite.id, "note", e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        addNewActivity();
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    rows={2}
                    placeholder="Ajouter un commentaire..."
                  />
                </div>
              </div>

              {activite.lieuID && (
                <>
                  {showModal && currentActiviteId === activite.id && (
                    isLiaisonMode ? (
                      <LocalisationLiaisonModal
                        showModal={showModal && currentActiviteId === activite.id}
                        closeModal={handleModalClose}
                        savedLiaisons={activite.liaisons || []}
                        setSavedLiaisons={(liaisons: LocalisationDistance[]) => handleUpdateLiaisons(activite.id, liaisons)}
                        onToggleLiaisonMode={handleToggleLiaisonMode}
                        distances={distances}
                        isLiaisonMode={isLiaisonMode}
                        clearAllLocalisations={() => clearAllLocalisations(activite.id)}
                        usedLiaisons={usedLiaisons}
                      />
                    ) : (
                      <LocalisationModal
                        showModal={showModal && currentActiviteId === activite.id}
                        closeModal={handleModalClose}
                        savedLocalisations={activite.bases || []}
                        setSavedLocalisations={(bases: Localisation[]) => handleUpdateBases(activite.id, bases)}
                        isLiaisonMode={isLiaisonMode}
                        setIsLiaisonMode={setIsLiaisonMode}
                        clearAllLocalisations={() => clearAllLocalisations(activite.id)}
                        bases={lieuBases}
                        usedBases={usedBases}
                      />
                    )
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={addNewActivity}
        className="w-full mt-4 py-3 px-4 bg-blue-50 text-blue-600 rounded-lg border-2 border-blue-100 hover:bg-blue-100 transition-all duration-200 flex items-center justify-center font-medium"
      >
        <FaPlusCircle className="mr-2" />
        Ajouter une activité
      </button>

      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirmation</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer cette activité ?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteConfirm({ show: false, id: null })}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Annuler
              </button>
              <button
                onClick={confirmDeleteActivite}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
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
