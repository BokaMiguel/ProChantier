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
import { useAuth } from "../../../context/AuthContext";
import {
  TabPlanifChantier,
  JournalActivite,
  Employe,
  JournalUserStats,
  Localisation,
  LocalisationDistance,
  UserStat,
} from "../../../models/JournalFormModel";
import StatsGrid from "../StatsGrid";
import LocalisationModal from "./LocalisationModal";
import LocalisationLiaisonModal from "./LocalisationLiaisonModal";
import { getDistancesForLieu, getBases } from "../../../services/JournalService";

interface ActiviteProjetProps {
  users: Employe[];
  planifChantier?: TabPlanifChantier;
  planifActivites?: JournalActivite[];
  userStats: UserStat[];
  setUserStats: (newUserStats: JournalUserStats) => void;
  setPlanifActivites: (activites: JournalActivite[]) => void;
  onPlanifActivitesChange: (activites: JournalActivite[]) => void;
}

const ActiviteProjet: React.FC<ActiviteProjetProps> = ({
  users,
  planifChantier,
  planifActivites = [],
  userStats,
  setUserStats,
  setPlanifActivites,
  onPlanifActivitesChange,
}) => {
  const { activites, lieux, bases } = useAuth();
  const [nextId, setNextId] = useState(2);
  const [showModal, setShowModal] = useState(false);
  const [currentActiviteId, setCurrentActiviteId] = useState<number | null>(null);
  const [liaisonModes, setLiaisonModes] = useState<{ [key: number]: boolean }>({});
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: number | null }>({
    show: false,
    id: null,
  });
  const notesRef = useRef<{ [key: number]: HTMLTextAreaElement | null }>({});
  const [distances, setDistances] = useState<LocalisationDistance[]>([]);
  const [lieuBases, setLieuBases] = useState<Localisation[]>([]);

  const isLiaisonMode = (activiteId: number) => liaisonModes[activiteId] || false;

  const loadBasesAndDistances = async (lieuId: number) => {
    try {
      const basesResponse = await getBases(lieuId);
      if (basesResponse && Array.isArray(basesResponse)) {
        const formattedBases = basesResponse.map(base => ({
          id: base.id,
          base: base.base,
          lieuId: lieuId
        }));
        setLieuBases(formattedBases);
      }
      
      const distancesResponse = await getDistancesForLieu(lieuId);
      if (distancesResponse) {
        setDistances(distancesResponse);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des bases:", error);
    }
  };

  useEffect(() => {
    // Remove the automatic location reset effect
    // Only load bases and distances if there's no specific activity location set
    if (planifChantier?.lieuID) {
      const activitiesWithoutLocation = planifActivites.filter(act => !act.lieuID);
      if (activitiesWithoutLocation.length > 0) {
        loadBasesAndDistances(planifChantier.lieuID);
      }
    }
  }, [planifChantier?.lieuID]);

  const handleChange = (activiteId: number, field: keyof JournalActivite, value: any) => {
    if (planifActivites) {
      const updatedActivites = planifActivites.map(activite => {
        if (activite.id === activiteId) {
          const updatedActivite = { ...activite, [field]: value };
          
          // Si on change le lieu, charger les nouvelles bases et liaisons pour le nouveau lieu
          // mais ne pas réinitialiser les bases et liaisons existantes
          if (field === 'lieuID' && value) {
            loadBasesAndDistances(value);
          }
          
          return updatedActivite;
        }
        return activite;
      });
      onPlanifActivitesChange(updatedActivites);
    }
  };

  const handleUpdateLiaisons = (activiteId: number, newLiaisons: LocalisationDistance[]) => {
    console.log("Updating liaisons:", newLiaisons);
    handleLiaisonsChange(newLiaisons, activiteId);
  };

  const handleUpdateBases = (activiteId: number, newBases: Localisation[]) => {
    console.log("Updating bases:", newBases);
    handleBasesChange(newBases, activiteId);
  };

  const calculateQuantity = (activite: JournalActivite) => {
    let total = 0;
    
    // Ajouter les distances des liaisons
    if (activite.liaisons && activite.liaisons.length > 0) {
      total += activite.liaisons.reduce((sum, liaison) => sum + (liaison.distanceInMeters || 0), 0);
    }
    
    // Ajouter le nombre de bases
    if (activite.bases && activite.bases.length > 0) {
      total += activite.bases.length;
    }
    
    return total;
  };

  const handleQuantityChange = (activiteId: number, value: string) => {
    handleChange(activiteId, "quantite", parseFloat(value));
  };

  const handleLiaisonsChange = (newLiaisons: LocalisationDistance[], activiteId: number) => {
    if (!planifActivites) return;
    
    const updatedActivites = planifActivites.map(activite => {
      if (activite.id === activiteId) {
        // Préserver les noms des bases dans les liaisons
        const updatedLiaisons = newLiaisons.map(liaison => {
          // Si la liaison n'a pas de noms de base, essayer de les récupérer
          if (!liaison.baseAName || !liaison.baseBName) {
            const baseA = lieuBases.find(b => b.id === liaison.baseA);
            const baseB = lieuBases.find(b => b.id === liaison.baseB);
            return {
              ...liaison,
              baseAName: liaison.baseAName || baseA?.base || `Base ${liaison.baseA}`,
              baseBName: liaison.baseBName || baseB?.base || `Base ${liaison.baseB}`
            };
          }
          return liaison;
        });
        
        const updatedActivite = {
          ...activite,
          liaisons: updatedLiaisons,
          // Ne pas vider les bases
        };
        updatedActivite.quantite = calculateQuantity(updatedActivite);
        return updatedActivite;
      }
      return activite;
    });
    onPlanifActivitesChange(updatedActivites);
  };

  const handleBasesChange = (newBases: Localisation[], activiteId: number) => {
    if (!planifActivites) return;
    
    const updatedActivites = planifActivites.map(activite => {
      if (activite.id === activiteId) {
        const updatedActivite = {
          ...activite,
          bases: [...newBases],
          // Ne pas vider les liaisons
        };
        updatedActivite.quantite = calculateQuantity(updatedActivite);
        return updatedActivite;
      }
      return activite;
    });
    
    onPlanifActivitesChange(updatedActivites);
  };

  const handleToggleLiaisonMode = (activiteId: number, mode: boolean) => {
    setLiaisonModes(prev => ({
      ...prev,
      [activiteId]: mode
    }));
    
    // Ne pas réinitialiser les bases/liaisons lors du changement de mode
    // Simplement mettre à jour le mode
  };

  const getUsedBases = (currentActiviteId: number): number[] => {
    // Récupérer l'activité courante pour connaître son lieu
    const currentActivite = planifActivites.find(a => a.id === currentActiviteId);
    if (!currentActivite || !currentActivite.lieuID) return [];
    
    // Filtrer les activités ayant la même activiteID ET le même lieuID que l'activité courante
    const sameActivityTypeActivities = planifActivites
      .filter(activite => 
        activite.id !== currentActiviteId &&
        activite.lieuID === currentActivite.lieuID
      );
    
    // Récupérer uniquement les bases directement sélectionnées
    const directlySelectedBases = sameActivityTypeActivities
      .flatMap(activite => activite.bases?.map(base => base.id) || []);
    
    // Ne retourner que les bases directement sélectionnées
    return [...new Set(directlySelectedBases)];
  };

  const getUsedLiaisons = (currentActiviteId: number): number[] => {
    // Récupérer l'activité courante pour connaître son lieu
    const currentActivite = planifActivites.find(a => a.id === currentActiviteId);
    if (!currentActivite || !currentActivite.lieuID) return [];
    
    // Filtrer les activités ayant la même activiteID ET le même lieuID que l'activité courante
    const sameActivityTypeActivities = planifActivites
      .filter(activite => 
        activite.id !== currentActiviteId &&
        activite.lieuID === currentActivite.lieuID
      );
    
    // Récupérer les liaisons directement sélectionnées
    return sameActivityTypeActivities
      .flatMap(activite => activite.liaisons?.map(liaison => liaison.id) || []);
  };

  const handleNotesChange = (activiteId: number, value: string) => {
    handleChange(activiteId, "notes", value);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const openModal = (id: number) => {
    setCurrentActiviteId(id);
    setShowModal(true);
    
    // Charger les bases pour l'activité courante
    const currentActivite = planifActivites.find(activite => activite.id === id);
    if (currentActivite && currentActivite.lieuID) {
      loadBasesAndDistances(currentActivite.lieuID);
    }
  };

  const clearAllLocalisations = (activiteId: number) => {
    if (planifActivites) {
      const updatedActivites = planifActivites.map(activite => {
        if (activite.id === activiteId) {
          return {
            ...activite,
            bases: [],
            liaisons: [],
            quantite: 0
          };
        }
        return activite;
      });
      onPlanifActivitesChange(updatedActivites);
    }
  };

  const requestDeleteActivite = (id: number) => {
    setDeleteConfirm({ show: true, id });
  };

  const confirmDeleteActivite = () => {
    if (deleteConfirm.id !== null) {
      // Mettre à jour le state global si nécessaire
      setDeleteConfirm({ show: false, id: null });
    }
  };

  const addNewActivity = () => {
    const newActivity: JournalActivite = {
      id: nextId,
      activiteID: 0,
      lieuID: 0,
      quantite: 0,
      notes: "",
      bases: [],
      liaisons: [],
      date: "",
      hrsDebut: "",
      hrsFin: "",
      defaultEntrepriseId: null,
      signalisationId: null,
    };
    
    const updatedActivites = [...(planifActivites || []), newActivity];
    onPlanifActivitesChange(updatedActivites);
    setNextId(nextId + 1);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <StatsGrid
        users={userStats.map((stat) => ({
          id: stat.id,
          nom: stat.nom,
        }))}
        nextStep={false}
        activiteCount={planifActivites?.length || 0}
        setUserStats={setUserStats}
        userStats={userStats}
      />

      <div className="space-y-6">
        {planifActivites.map((planifActivite) => (
          <div key={planifActivite.id} className="bg-gray-50 rounded-lg p-6 relative">
            <div className="grid grid-cols-1 gap-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  {planifActivites.indexOf(planifActivite) + 1}.{" "}
                  <span className="text-blue-600 ml-2">
                    {activites?.find(a => a.id === planifActivite.activiteID)?.nom || "Nouvelle activité"}
                  </span>
                </h3>
                {planifActivites.indexOf(planifActivite) > 0 && (
                  <button
                    type="button"
                    onClick={() => requestDeleteActivite(planifActivite.id)}
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
                    value={planifActivite.activiteID || ""}
                    onChange={(e) => handleChange(planifActivite.id, "activiteID", parseInt(e.target.value) || 0)}
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
                    value={planifActivite.lieuID || ""}
                    onChange={(e) => handleChange(planifActivite.id, "lieuID", parseInt(e.target.value) || 0)}
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
                      {planifActivite.liaisons && planifActivite.liaisons.length ? (
                        <FaRuler className="text-blue-600 w-4 h-4" />
                      ) : (
                        <FaHashtag className="text-blue-600 w-4 h-4" />
                      )}
                    </span>
                    <label className="text-gray-700 text-sm font-semibold ml-2">
                      {planifActivite.liaisons && planifActivite.liaisons.length ? "Distance (m) et quantité" : "Quantité et bases"}
                    </label>
                  </div>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                    value={calculateQuantity(planifActivite)}
                    readOnly
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
                <button
                  type="button"
                  onClick={() => openModal(planifActivite.id)}
                  className="w-full min-h-[80px] p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-left"
                >
                  <div className="flex flex-wrap gap-2">
                    {/* Affichage des bases */}
                    {planifActivite.bases && planifActivite.bases.map((base, index) => (
                      <span
                        key={`base-${planifActivite.id}-${base.id}-${index}`}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {base.base}
                      </span>
                    ))}

                    {/* Affichage des liaisons */}
                    {planifActivite.liaisons && planifActivite.liaisons.map((liaison, index) => {
                      // Utiliser les données stockées dans la liaison elle-même plutôt que de chercher dans lieuBases
                      return (
                        <span
                          key={`liaison-${planifActivite.id}-${liaison.id}-${index}`}
                          className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                        >
                          {liaison.baseAName || "Base A"} → {liaison.baseBName || "Base B"} ({liaison.distanceInMeters}m)
                        </span>
                      );
                    })}

                    {/* Message si vide */}
                    {(!planifActivite.bases?.length && !planifActivite.liaisons?.length) && (
                      <span className="text-gray-400 italic">
                        Cliquez pour sélectionner des bases ou des liaisons
                      </span>
                    )}
                  </div>
                </button>
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
                  ref={(el) => (notesRef.current[planifActivite.id] = el)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  placeholder="Ajouter un commentaire..."
                  value={planifActivite.notes || ''}
                  onChange={(e) => handleNotesChange(planifActivite.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      addNewActivity();
                    }
                  }}
                />
              </div>
            </div>

            {showModal && currentActiviteId === planifActivite.id && (
              isLiaisonMode(planifActivite.id) ? (
                <LocalisationLiaisonModal
                  showModal={true}
                  closeModal={handleModalClose}
                  savedLiaisons={planifActivite.liaisons || []}
                  setSavedLiaisons={(liaisons) => handleLiaisonsChange(liaisons, planifActivite.id)}
                  onToggleLiaisonMode={() => handleToggleLiaisonMode(planifActivite.id, !isLiaisonMode(planifActivite.id))}
                  distances={distances}
                  isLiaisonMode={isLiaisonMode(planifActivite.id)}
                  clearAllLocalisations={() => clearAllLocalisations(planifActivite.id)}
                  usedLiaisons={getUsedLiaisons(planifActivite.id)}
                  usedBasesIds={getUsedBases(planifActivite.id)}
                  onUpdateLiaisons={handleUpdateLiaisons}
                  currentActiviteId={planifActivite.id}
                  bases={lieuBases}
                />
              ) : (
                <LocalisationModal
                  showModal={true}
                  closeModal={handleModalClose}
                  savedLocalisations={planifActivite.bases || []}
                  setSavedLocalisations={(bases) => handleBasesChange(bases, planifActivite.id)}
                  isLiaisonMode={isLiaisonMode(planifActivite.id)}
                  setIsLiaisonMode={(mode) => handleToggleLiaisonMode(planifActivite.id, mode)}
                  clearAllLocalisations={() => clearAllLocalisations(planifActivite.id)}
                  bases={lieuBases}
                  usedBases={getUsedBases(planifActivite.id)}
                />
              )
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={addNewActivity}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
        >
          <FaPlusCircle />
          <span>Ajouter une activité</span>
        </button>
      </div>

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
