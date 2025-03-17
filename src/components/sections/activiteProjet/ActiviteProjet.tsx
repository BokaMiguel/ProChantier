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
  FaClock,
  FaUsers,
  FaExclamationTriangle,
  FaCheck,
  FaSun,
  FaMoon,
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
  userStats: JournalUserStats;
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
  const { activites, lieux, bases, signalisations } = useAuth();
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

  useEffect(() => {
    if (users.length > 0) {
      // Vérifier si tous les utilisateurs ont des statistiques
      const usersWithoutStats = users.filter(
        user => !userStats.userStats.some(stat => stat.id === user.id)
      );
      
      if (usersWithoutStats.length > 0) {
        // Créer des statistiques pour les utilisateurs manquants
        const newUserStats = [
          ...userStats.userStats,
          ...usersWithoutStats.map(user => ({
            id: user.id,
            nom: `${user.prenom || ''} ${user.nom || ''}`.trim(),
            act: Array(10).fill(0), // Initialiser un tableau de 10 éléments à 0
            ts: 0,
            td: 0
          }))
        ];
        
        // Mettre à jour les statistiques
        setUserStats({
          userStats: newUserStats,
          totals: calculateTotals(newUserStats)
        });
      }
      
      // Supprimer les statistiques des utilisateurs qui ne sont plus dans la liste
      const statsToRemove = userStats.userStats.filter(
        stat => !users.some(user => user.id === stat.id)
      );
      
      if (statsToRemove.length > 0) {
        const updatedStats = userStats.userStats.filter(
          stat => !statsToRemove.some(s => s.id === stat.id)
        );
        
        setUserStats({
          userStats: updatedStats,
          totals: calculateTotals(updatedStats)
        });
      }
    }
  }, [users]);

  const calculateTotals = (stats: UserStat[]) => {
    return stats.reduce(
      (acc: { act: number[], ts: number, td: number }, stat: UserStat) => {
        for (let i = 0; i < 10; i++) {
          acc.act[i] = (acc.act[i] || 0) + (stat.act[i] || 0);
        }
        acc.ts += stat.ts || 0;
        acc.td += stat.td || 0;
        return acc;
      },
      { act: Array(10).fill(0), ts: 0, td: 0 }
    );
  };

  const handleChange = (activiteId: number, field: keyof JournalActivite, value: any) => {
    if (planifActivites) {
      // Log pour déboguer
      console.log(`Mise à jour de l'activité ID: ${activiteId}, champ: ${field}, valeur:`, value);
      console.log("État actuel des activités:", planifActivites);
      
      const updatedActivites = planifActivites.map(activite => {
        if (activite.id === activiteId) {
          console.log(`Activité trouvée pour mise à jour: ID=${activite.id}, isComplete avant=${activite.isComplete}`);
          const updatedActivite = { ...activite, [field]: value };
          console.log(`Activité après mise à jour: ID=${updatedActivite.id}, isComplete après=${updatedActivite.isComplete}`);
          
          // Si on change le lieu, charger les nouvelles bases et liaisons pour le nouveau lieu
          // mais ne pas réinitialiser les bases et liaisons existantes
          if (field === 'lieuID' && value) {
            loadBasesAndDistances(value);
          }
          
          return updatedActivite;
        }
        return activite;
      });
      
      // Log pour vérifier que les mises à jour sont correctes
      console.log("Activités mises à jour:", updatedActivites);
      
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
      planifID: planifChantier?.id || 0,
      lieuID: 0,
      quantite: 0,
      notes: "",
      date: "",
      hrsDebut: planifChantier?.hrsDebut || "08:00",
      hrsFin: planifChantier?.hrsFin || "17:00",
      defaultEntrepriseId: null,
      signalisationId: 0,
      bases: [],
      liaisons: [],
      isComplete: false,
      qteLab: null,
    };
    
    const updatedActivites = [...(planifActivites || []), newActivity];
    onPlanifActivitesChange(updatedActivites);
    setNextId(nextId + 1);
  };

  // Fonction pour trouver le nom de la signalisation en fonction de son ID
  const getSignalisationName = (signalisationId: number | undefined | null): string => {
    if (!signalisationId || signalisationId === 0 || !signalisations) return "Aucune";
    const signalisation = signalisations.find(s => s.id === signalisationId);
    return signalisation ? signalisation.nom : "Aucune";
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 space-y-4">
      <StatsGrid
        users={userStats.userStats.map((stat) => ({
          id: stat.id,
          nom: stat.nom,
        }))}
        nextStep={false}
        activiteCount={planifActivites?.length || 0}
        setUserStats={setUserStats}
        userStats={userStats}
      />

      <div className="space-y-4">
        {planifActivites.map((planifActivite) => (
          <div key={planifActivite.id} className="bg-gray-50 rounded-lg p-4 relative mb-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <span className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full mr-2">
                  {planifActivites.indexOf(planifActivite) + 1}
                </span>
                <span className="text-blue-600">
                  {activites?.find(a => a.id === planifActivite.activiteID)?.nom || "Nouvelle activité"}
                </span>
                {planifActivite.isComplete && 
                  <span className="ml-2 text-green-500" title="Activité complétée">✅</span>
                }
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

            {/* Grille principale à 2 colonnes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-4">
              {/* Colonne gauche */}
              <div className="space-y-4">
                {/* Activité */}
                <div>
                  <div className="flex items-center mb-1">
                    <span className="text-blue-500 mr-2">
                      <FaHardHat className="w-4 h-4" />
                    </span>
                    <label className="text-gray-700 text-sm font-medium">
                      Activité
                    </label>
                  </div>
                  <select
                    value={planifActivite.activiteID || ""}
                    onChange={(e) => handleChange(planifActivite.id, "activiteID", parseInt(e.target.value) || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">Sélectionner une activité</option>
                    {activites?.map((act) => (
                      <option key={act.id} value={act.id}>
                        {act.nom}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Lieu */}
                <div>
                  <div className="flex items-center mb-1">
                    <span className="text-blue-500 mr-2">
                      <FaMapSigns className="w-4 h-4" />
                    </span>
                    <label className="text-gray-700 text-sm font-medium">
                      Lieu
                    </label>
                  </div>
                  <select
                    value={planifActivite.lieuID || ""}
                    onChange={(e) => handleChange(planifActivite.id, "lieuID", parseInt(e.target.value) || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">Sélectionner un lieu</option>
                    {lieux?.map((lieu) => (
                      <option key={lieu.id} value={lieu.id}>
                        {lieu.nom}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantité Lab */}
                <div>
                  <div className="flex items-center mb-1">
                    <span className="text-blue-500 mr-2">
                      <FaHashtag className="w-4 h-4" />
                    </span>
                    <label className="text-gray-700 text-sm font-medium">
                      Quantité Lab
                    </label>
                  </div>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={planifActivite.qteLab || ""}
                    onChange={(e) => handleChange(planifActivite.id, "qteLab", e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="Nombre"
                    min="0"
                  />
                </div>
              </div>

              {/* Colonne droite */}
              <div className="space-y-4">
                {/* Horaire */}
                <div>
                  <div className="flex items-center mb-1">
                    <span className="text-blue-500 mr-2">
                      <FaClock className="w-4 h-4" />
                    </span>
                    <label className="text-gray-700 text-sm font-medium">
                      Horaire
                    </label>
                    <span className="ml-2">
                      {parseInt(planifActivite.hrsDebut?.split(':')[0] || '08') < 17 ? 
                        <span title="Jour">☀️</span> : 
                        <span title="Soir">🌙</span>
                      }
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="time"
                      className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      value={planifActivite.hrsDebut || "08:00"}
                      onChange={(e) => handleChange(planifActivite.id, "hrsDebut", e.target.value)}
                    />
                    <input
                      type="time"
                      className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      value={planifActivite.hrsFin || "17:00"}
                      onChange={(e) => handleChange(planifActivite.id, "hrsFin", e.target.value)}
                    />
                  </div>
                </div>

                {/* Signalisation */}
                <div>
                  <div className="flex items-center mb-1">
                    <span className="text-blue-500 mr-2">
                      <FaExclamationTriangle className="w-4 h-4" />
                    </span>
                    <label className="text-gray-700 text-sm font-medium">
                      Signalisation
                    </label>
                  </div>
                  <select
                    value={planifActivite.signalisationId || ""}
                    onChange={(e) => handleChange(planifActivite.id, "signalisationId", parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">Sélectionner une signalisation</option>
                    {signalisations?.map((signal) => (
                      <option key={signal.id} value={signal.id}>
                        {signal.nom}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantité et bases */}
                <div>
                  <div className="flex items-center mb-1">
                    <span className="text-blue-500 mr-2">
                      {isLiaisonMode(planifActivite.id) ? (
                        <FaRuler className="w-4 h-4" />
                      ) : (
                        <FaHashtag className="w-4 h-4" />
                      )}
                    </span>
                    <label className="text-gray-700 text-sm font-medium">
                      {isLiaisonMode(planifActivite.id) ? "Distance totale en (m)" : "Quantité et bases"}
                    </label>
                  </div>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed text-sm"
                    value={calculateQuantity(planifActivite)}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Deuxième rangée - Statut */}
            <div className="mb-4">
              <div className="flex items-center mb-1">
                <span className="text-blue-500 mr-2">
                  <FaCheck className="w-4 h-4" />
                </span>
                <label className="text-gray-700 text-sm font-medium">
                  Statut
                </label>
              </div>
              <div className="flex items-center">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-600"
                    checked={planifActivite.isComplete || false}
                    onChange={(e) => handleChange(planifActivite.id, "isComplete", e.target.checked)}
                  />
                  <span className="ml-2 text-gray-700 text-sm">Complété</span>
                </label>
                <div className={`ml-4 px-2 py-1 rounded-full text-xs ${planifActivite.isComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {planifActivite.isComplete ? 'Terminé' : 'En cours'}
                </div>
              </div>
            </div>

            {/* Bases et liaisons */}
            <div className="mb-4">
              <div className="flex items-center mb-1">
                <span className="text-blue-500 mr-2">
                  <FaMapMarkerAlt className="w-4 h-4" />
                </span>
                <label className="text-gray-700 text-sm font-medium">
                  Bases et liaisons
                </label>
              </div>
              <button
                type="button"
                onClick={() => openModal(planifActivite.id)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left text-sm min-h-[80px] overflow-y-auto max-h-[200px]"
              >
                <div className="flex flex-wrap gap-2">
                  {planifActivite.bases && planifActivite.bases.map((base, index) => (
                    <span
                      key={`base-${planifActivite.id}-${base.id}-${index}`}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                    >
                      {base.base}
                    </span>
                  ))}

                  {planifActivite.liaisons && planifActivite.liaisons.map((liaison, index) => (
                    <span
                      key={`liaison-${planifActivite.id}-${liaison.id}-${index}`}
                      className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs"
                    >
                      {liaison.baseAName || "Base A"} → {liaison.baseBName || "Base B"} ({liaison.distanceInMeters}m)
                    </span>
                  ))}

                  {(!planifActivite.bases?.length && !planifActivite.liaisons?.length) && (
                    <span className="text-gray-400 italic text-sm">
                      Cliquez pour sélectionner des bases ou des liaisons
                    </span>
                  )}
                </div>
              </button>
            </div>

            {/* Commentaire */}
            <div>
              <div className="flex items-center mb-1">
                <span className="text-blue-500 mr-2">
                  <FaComment className="w-4 h-4" />
                </span>
                <label className="text-gray-700 text-sm font-medium">
                  Commentaire
                </label>
              </div>
              <textarea
                ref={(el) => (notesRef.current[planifActivite.id] = el)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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

      {/* Modal pour la sélection des bases */}
      {showModal && currentActiviteId !== null && !isLiaisonMode(currentActiviteId) && (
        <LocalisationModal
          showModal={showModal}
          closeModal={handleModalClose}
          savedLocalisations={planifActivites.find(a => a.id === currentActiviteId)?.bases || []}
          setSavedLocalisations={(bases) => handleUpdateBases(currentActiviteId, bases)}
          isLiaisonMode={isLiaisonMode(currentActiviteId)}
          setIsLiaisonMode={(mode) => handleToggleLiaisonMode(currentActiviteId, mode)}
          clearAllLocalisations={() => clearAllLocalisations(currentActiviteId)}
          bases={lieuBases}
          usedBases={getUsedBases(currentActiviteId)}
        />
      )}

      {/* Modal pour la sélection des liaisons */}
      {showModal && currentActiviteId !== null && isLiaisonMode(currentActiviteId) && (
        <LocalisationLiaisonModal
          showModal={showModal}
          closeModal={handleModalClose}
          savedLiaisons={planifActivites.find(a => a.id === currentActiviteId)?.liaisons || []}
          setSavedLiaisons={(liaisons) => handleLiaisonsChange(liaisons, currentActiviteId)}
          onToggleLiaisonMode={(mode) => handleToggleLiaisonMode(currentActiviteId, mode)}
          distances={distances}
          isLiaisonMode={isLiaisonMode(currentActiviteId)}
          clearAllLocalisations={() => clearAllLocalisations(currentActiviteId)}
          usedLiaisons={getUsedLiaisons(currentActiviteId)}
          usedBasesIds={getUsedBases(currentActiviteId)}
          onUpdateLiaisons={handleUpdateLiaisons}
          currentActiviteId={currentActiviteId}
          bases={lieuBases}
        />
      )}
    </div>
  );
};

export default ActiviteProjet;
