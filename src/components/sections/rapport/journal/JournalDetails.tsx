import React, { useEffect, useState } from "react";
import ExpandableSection from "./ExpandableSection";
import {
  FaTasks,
  FaBoxes,
  FaUserTie,
  FaMapMarkerAlt,
  FaStickyNote,
  FaList,
  FaBalanceScale,
  FaPeopleCarry,
  FaRoute,
  FaHardHat,
  FaChevronUp,
  FaChevronDown,
  FaHammer,
  FaWrench,
  FaTools,
  FaRulerCombined,
  FaBolt,
  FaHardHat as FaHelmet,
  FaBox,
  FaRuler,
  FaBriefcase
} from "react-icons/fa";
import { 
  ExpandedSections, 
  JournalChantier, 
  LocalisationDistance, 
  JournalActivites,
  LocalisationJournal,
  LocalisationDistanceJournal,
  BottinJournal,
  SousTraitantJournal,
  MateriauxJournal
} from "../../../../models/JournalFormModel";
import { useAuth } from "../../../../context/AuthContext";
import { getDistancesForLieu } from "../../../../services/JournalService";
import { getMeteoName } from "../../../../services/IconServices";

interface JournalDetailsProps {
  journal: JournalChantier;
  expandedSections: ExpandedSections;
  toggleSectionExpand: (section: keyof ExpandedSections) => void;
}

const JournalDetails: React.FC<JournalDetailsProps> = ({
  journal,
  expandedSections,
  toggleSectionExpand,
}) => {
  // Utiliser les données du contexte d'authentification
  const { employees, activites, materiaux, sousTraitants, lieux, bases, unites } = useAuth();
  const [localisationDistances, setLocalisationDistances] = useState<LocalisationDistance[]>([]);
  // État pour suivre les activités développées
  const [expandedActivities, setExpandedActivities] = useState<number[]>([]);
  // État pour suivre l'onglet actif pour chaque activité
  const [activeTab, setActiveTab] = useState<Record<number, string>>({});

  // Fonction pour basculer l'état d'expansion d'une activité
  const toggleActivityExpand = (activityId: number) => {
    setExpandedActivities(prev => 
      prev.includes(activityId) 
        ? prev.filter(id => id !== activityId) 
        : [...prev, activityId]
    );
    
    // Si on développe une activité, définir l'onglet par défaut sur "localisation"
    if (!expandedActivities.includes(activityId)) {
      setActiveTab(prev => ({
        ...prev,
        [activityId]: "localisation"
      }));
    }
  };
  
  // Fonction pour changer d'onglet
  const changeTab = (activityId: number, tab: string) => {
    setActiveTab(prev => ({
      ...prev,
      [activityId]: tab
    }));
  };

  // Charger les distances de localisation lorsque les bases sont disponibles
  useEffect(() => {
    const fetchDistances = async () => {
      if (lieux && lieux.length > 0) {
        try {
          // Pour chaque lieu, récupérer les distances
          const allDistances: LocalisationDistance[] = [];
          
          for (const lieu of lieux) {
            const lieuDistances = await getDistancesForLieu(lieu.id);
            if (lieuDistances && lieuDistances.length > 0) {
              allDistances.push(...lieuDistances);
            }
          }
          
          setLocalisationDistances(allDistances);
        } catch (error) {
          console.error("Erreur lors de la récupération des distances:", error);
        }
      }
    };

    fetchDistances();
  }, [lieux]);

  // Fonction pour trouver le nom d'un employé par son ID
  const getEmployeeName = (bottinId: number) => {
    const employee = employees?.find(emp => emp.id === bottinId);
    return employee ? `${employee.prenom} ${employee.nom}` : `ID: ${bottinId}`;
  };

  // Fonction pour trouver le nom d'une activité par son ID
  const getActiviteName = (activiteId: number) => {
    const activite = activites?.find(act => act.id === activiteId);
    return activite ? activite.nom : `ID: ${activiteId}`;
  };

  // Fonction pour trouver le nom d'un matériau par son ID
  const getMaterialName = (materielId: number) => {
    const materiel = materiaux?.find(mat => mat.id === materielId);
    return materiel ? materiel.nom : `ID: ${materielId}`;
  };

  // Fonction pour trouver le nom d'un sous-traitant par son ID
  const getSousTraitantName = (sousTraitantId: number) => {
    const sousTraitant = sousTraitants?.find(st => st.id === sousTraitantId);
    return sousTraitant ? sousTraitant.nom : `ID: ${sousTraitantId}`;
  };

  // Fonction pour trouver le nom d'un lieu par son ID
  const getLieuName = (lieuId: number) => {
    const lieu = lieux?.find(l => l.id === lieuId);
    return lieu ? lieu.nom : `ID: ${lieuId}`;
  };

  // Fonction pour trouver le nom d'une base par son ID et afficher le lieu associé
  const getBaseWithLieu = (baseId: number) => {
    const base = bases?.find(b => b.id === baseId);
    if (!base) return { base: `Base ID: ${baseId}`, lieuNom: '' };
    
    const lieu = lieux?.find(l => l.id === base.lieuId);
    const lieuNom = lieu ? lieu.nom : '';
    
    return {
      base: base.base,
      lieuNom: lieuNom
    };
  };

  // Fonction pour trouver le nom d'une base par son ID
  const getBaseName = (baseId: number) => {
    const base = bases?.find(b => b.id === baseId);
    return base ? base.base : `ID: ${baseId}`;
  };

  // Fonction pour trouver les détails d'une liaison par son ID avec les lieux associés
  const getLiaisonDetails = (liaisonId: number) => {
    const liaison = localisationDistances.find(ld => ld.id === liaisonId);
    if (!liaison) return null;
    
    const baseADetails = getBaseWithLieu(liaison.baseA);
    const baseBDetails = getBaseWithLieu(liaison.baseB);
    
    // Vérifier si les deux bases appartiennent au même lieu
    const sameLieu = baseADetails.lieuNom === baseBDetails.lieuNom && baseADetails.lieuNom !== '';
    
    // Trouver l'ID du lieu si les bases sont dans le même lieu
    let lieuId = 0;
    if (sameLieu) {
      const base = bases?.find(b => b.id === liaison.baseA);
      if (base) {
        lieuId = base.lieuId;
      }
    }
    
    return {
      baseA: baseADetails.base,
      baseALieu: baseADetails.lieuNom,
      baseB: baseBDetails.base,
      baseBLieu: baseBDetails.lieuNom,
      sameLieu: sameLieu,
      lieuId: lieuId,
      lieuCommun: sameLieu ? baseADetails.lieuNom : '',
      distance: liaison.distanceInMeters
    };
  };

  // Fonction pour trouver le symbole d'une unité par son ID
  const getUniteSymbol = (uniteId: number) => {
    const unite = unites?.find(u => u.idUnite === uniteId);
    return unite ? unite.description : '';
  };

  // Fonction pour afficher les localisations d'une activité
  const renderLocalisations = (activite: JournalActivites) => {
    const localisationJournals = activite.localisationJournals || [];
    const localisationDistanceJournals = activite.localisationDistanceJournals || [];
    
    if (localisationJournals.length === 0 && localisationDistanceJournals.length === 0) {
      return (
        <div className="flex items-center justify-center py-4 text-blue-400">
          <FaMapMarkerAlt className="mr-2" />
          <span>Aucune localisation disponible</span>
        </div>
      );
    }

    // Regrouper les bases par lieu
    const basesByLieu: Record<number, { lieuNom: string, bases: { id: number, base: string }[] }> = {};
    
    localisationJournals.forEach((loc: LocalisationJournal) => {
      const baseWithLieu = getBaseWithLieu(loc.localisationId);
      const base = bases?.find(b => b.id === loc.localisationId);
      
      if (base) {
        if (!basesByLieu[base.lieuId]) {
          const lieu = lieux?.find(l => l.id === base.lieuId);
          basesByLieu[base.lieuId] = {
            lieuNom: lieu ? lieu.nom : `Lieu ID: ${base.lieuId}`,
            bases: []
          };
        }
        
        basesByLieu[base.lieuId].bases.push({
          id: loc.id,
          base: base.base
        });
      }
    });

    // Regrouper les liaisons par lieu
    const liaisonsByLieu: Record<number, { 
      lieuNom: string, 
      liaisons: { 
        id: number, 
        localisationDistanceId: number,
        baseA: string,
        baseB: string,
        distance: number
      }[] 
    }> = {};
    
    // Liaisons internes (même lieu)
    localisationDistanceJournals.forEach((liaison: LocalisationDistanceJournal) => {
      const liaisonDetails = getLiaisonDetails(liaison.localisationDistanceId);
      
      if (liaisonDetails && liaisonDetails.sameLieu) {
        const lieuId = liaisonDetails.lieuId;
        
        if (!liaisonsByLieu[lieuId]) {
          liaisonsByLieu[lieuId] = {
            lieuNom: liaisonDetails.lieuCommun,
            liaisons: []
          };
        }
        
        liaisonsByLieu[lieuId].liaisons.push({
          id: liaison.id,
          localisationDistanceId: liaison.localisationDistanceId,
          baseA: liaisonDetails.baseA,
          baseB: liaisonDetails.baseB,
          distance: liaisonDetails.distance
        });
      }
    });

    // Liaisons externes (lieux différents)
    const externalLiaisons = localisationDistanceJournals.filter(liaison => {
      const details = getLiaisonDetails(liaison.localisationDistanceId);
      return details && !details.sameLieu;
    });

    return (
      <div className="space-y-4">
        {Object.keys(basesByLieu).length > 0 && (
          <div>
            {Object.entries(basesByLieu).map(([lieuId, data]) => (
              <div key={lieuId} className="mb-4">
                <div className="flex items-center mb-2">
                  <FaMapMarkerAlt className="mr-2 text-blue-600" /> 
                  <span className="font-medium text-blue-800">Lieu: {data.lieuNom} ({data.bases.length} bases)</span>
                </div>
                <div className="flex flex-wrap gap-2 ml-6">
                  {data.bases.map((baseInfo) => (
                    <div 
                      key={baseInfo.id} 
                      className="flex items-center bg-white border border-blue-200 text-blue-800 px-3 py-2 rounded-md shadow-sm"
                    >
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                      <span>{baseInfo.base}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Liaisons internes (même lieu) */}
        {Object.keys(liaisonsByLieu).length > 0 && (
          <div>
            {Object.entries(liaisonsByLieu).map(([lieuId, data]) => (
              <div key={lieuId} className="mb-4">
                <div className="flex items-center mb-2">
                  <FaRoute className="mr-2 text-blue-600" /> 
                  <span className="font-medium text-blue-800">Lieu: {data.lieuNom} ({data.liaisons.length} liaisons)</span>
                </div>
                <div className="flex flex-wrap gap-2 ml-6">
                  {data.liaisons.map((liaison) => (
                    <div 
                      key={liaison.id} 
                      className="flex items-center bg-white border border-blue-200 text-blue-800 px-3 py-2 rounded-md shadow-sm"
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                        <span className="font-medium text-blue-700">{liaison.baseA}</span>
                        <svg className="mx-1 text-blue-400" width="16" height="6" viewBox="0 0 20 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19.3536 4.35355C19.5488 4.15829 19.5488 3.84171 19.3536 3.64645L16.1716 0.464466C15.9763 0.269204 15.6597 0.269204 15.4645 0.464466C15.2692 0.659728 15.2692 0.976311 15.4645 1.17157L18.2929 4L15.4645 6.82843C15.2692 7.02369 15.2692 7.34027 15.4645 7.53553C15.6597 7.7308 15.9763 7.7308 16.1716 7.53553L19.3536 4.35355ZM0 4.5H19V3.5H0V4.5Z" fill="currentColor"/>
                        </svg>
                        <span className="font-medium text-blue-700">{liaison.baseB}</span>
                        <span className="ml-2 text-xs text-blue-600">{liaison.distance} m</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Liaisons externes (lieux différents) */}
        {externalLiaisons.length > 0 && (
          <div>
            <div className="flex items-center mb-2">
              <FaRoute className="mr-2 text-blue-600" /> 
              <span className="font-medium text-blue-800">Liaisons entre lieux différents ({externalLiaisons.length})</span>
            </div>
            <div className="flex flex-wrap gap-2 ml-6">
              {externalLiaisons.map((liaison: LocalisationDistanceJournal) => {
                const liaisonDetails = getLiaisonDetails(liaison.localisationDistanceId);
                
                return (
                  <div 
                    key={liaison.id} 
                    className="flex items-center bg-white border border-blue-200 text-blue-800 px-3 py-2 rounded-md shadow-sm"
                  >
                    {liaisonDetails ? (
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                        <span className="font-medium text-blue-700">{liaisonDetails.baseA}</span>
                        <svg className="mx-1 text-blue-400" width="16" height="6" viewBox="0 0 20 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19.3536 4.35355C19.5488 4.15829 19.5488 3.84171 19.3536 3.64645L16.1716 0.464466C15.9763 0.269204 15.6597 0.269204 15.4645 0.464466C15.2692 0.659728 15.2692 0.976311 15.4645 1.17157L18.2929 4L15.4645 6.82843C15.2692 7.02369 15.2692 7.34027 15.4645 7.53553C15.6597 7.7308 15.9763 7.7308 16.1716 7.53553L19.3536 4.35355ZM0 4.5H19V3.5H0V4.5Z" fill="currentColor"/>
                        </svg>
                        <span className="font-medium text-blue-700">{liaisonDetails.baseB}</span>
                        <span className="ml-2 text-xs text-blue-600">{liaisonDetails.distance} m</span>
                        <span className="ml-2 text-xs text-gray-600">({liaisonDetails.baseALieu} - {liaisonDetails.baseBLieu})</span>
                      </div>
                    ) : (
                      <span className="text-blue-500">Liaison #{liaison.localisationDistanceId}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Fonction pour calculer la quantité totale (somme des distances ou nombre de bases)
  const calculateQuantity = (activite: JournalActivites) => {
    const localisationJournals = activite.localisationJournals || [];
    const localisationDistanceJournals = activite.localisationDistanceJournals || [];
    
    if (localisationDistanceJournals.length > 0) {
      // Calculer la somme des distances en mètres
      let totalDistance = 0;
      let validDistances = 0;
      
      localisationDistanceJournals.forEach((liaison: LocalisationDistanceJournal) => {
        const liaisonDetails = getLiaisonDetails(liaison.localisationDistanceId);
        if (liaisonDetails && liaisonDetails.distance) {
          totalDistance += liaisonDetails.distance;
          validDistances++;
        }
      });
      
      if (validDistances > 0) {
        return `${totalDistance} mètres (${localisationDistanceJournals.length} liaison${localisationDistanceJournals.length > 1 ? 's' : ''})`;
      }
      
      return `${localisationDistanceJournals.length} liaison${localisationDistanceJournals.length > 1 ? 's' : ''}`;
    } else if (localisationJournals.length > 0) {
      return `${localisationJournals.length} base${localisationJournals.length > 1 ? 's' : ''}`;
    }
    
    return "N/A";
  };

  // Fonction pour obtenir l'icône appropriée pour une activité en fonction de son nom
  const getActivityIcon = (activiteId: number | null) => {
    if (!activiteId || !activites) return <FaHammer className="mr-2" />;
    
    const activite = activites.find(a => a.id === activiteId);
    if (!activite) return <FaHammer className="mr-2" />;
    
    const nom = activite.nom.toLowerCase();
    
    if (nom.includes('démolition') || nom.includes('demolition')) {
      return <FaHammer className="mr-2" />;
    } else if (nom.includes('électrique') || nom.includes('electrique') || nom.includes('électricité') || nom.includes('electricite')) {
      return <FaBolt className="mr-2" />;
    } else if (nom.includes('trottoir') || nom.includes('bordure') || nom.includes('pavage')) {
      return <FaRulerCombined className="mr-2" />;
    } else if (nom.includes('plomberie') || nom.includes('tuyau')) {
      return <FaWrench className="mr-2" />;
    } else {
      return <FaTools className="mr-2" />;
    }
  };

  // Fonction pour obtenir le nom d'un matériau
  const getMateriauxName = (materiauxId: number | null) => {
    if (!materiauxId || !materiaux) return "Matériau inconnu";
    
    const materiau = materiaux.find(m => m.id === materiauxId);
    return materiau ? materiau.nom : "Matériau inconnu";
  };

  return (
    <tr>
      <td colSpan={7} className="p-0 bg-white">
        <div className="px-6 py-8 border-t border-blue-100">
          <div className="flex flex-col space-y-8">
            {/* Section Employés */}
            <ExpandableSection
              isOpen={expandedSections.employes}
              toggleSection={() => toggleSectionExpand("employes")}
              title={`Employés (${journal.bottinJournals?.length || 0})`}
              icon={<FaUserTie />}
            >
              <div className="bg-white rounded-lg overflow-hidden">
                {journal.bottinJournals && journal.bottinJournals.length > 0 ? (
                  <div className="flex flex-wrap gap-4">
                    {journal.bottinJournals.map((bottinJournal: BottinJournal) => {
                      const employee = employees?.find(emp => emp.id === bottinJournal.bottinId);
                      return (
                        <div 
                          key={bottinJournal.bottinId} 
                          className="flex-1 min-w-[250px] bg-white rounded-lg border border-blue-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="bg-blue-50 px-4 py-3 border-b border-blue-100">
                            <h3 className="font-semibold text-blue-800">{getEmployeeName(bottinJournal.bottinId)}</h3>
                          </div>
                          <div className="p-4 space-y-2">
                            <div className="flex items-center text-sm">
                              <FaBriefcase className="text-blue-500 mr-2" />
                              <span className="text-gray-600 mr-2">Fonction:</span>
                              <span className="font-medium">{employee?.fonction?.nom || 'N/A'}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <FaTools className="text-blue-500 mr-2" />
                              <span className="text-gray-600 mr-2">Équipement:</span>
                              <span className="font-medium">{employee?.equipement?.nom || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-blue-50 rounded-lg">
                    <p className="text-blue-500">Aucun employé associé à ce journal</p>
                  </div>
                )}
              </div>
            </ExpandableSection>

            {/* Section Activités */}
            <ExpandableSection
              isOpen={expandedSections.activites}
              toggleSection={() => toggleSectionExpand("activites")}
              title={`Activités (${journal.journalActivites?.length || 0})`}
              icon={<FaTools />}
            >
              {journal.journalActivites && journal.journalActivites.length > 0 ? (
                <div className="space-y-6">
                  {journal.journalActivites.map((activite: JournalActivites) => (
                    <div 
                      key={activite.id} 
                      className="bg-white rounded-lg border border-blue-100 overflow-hidden shadow-sm"
                    >
                      {/* En-tête de l'activité */}
                      <div 
                        className={`text-white p-4 cursor-pointer hover:bg-blue-700 transition-colors duration-200 ${
                          expandedActivities.includes(activite.id) ? 'bg-blue-900' : 'bg-blue-600'
                        }`}
                        onClick={() => toggleActivityExpand(activite.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className={`font-bold text-lg flex items-center ${
                              expandedActivities.includes(activite.id) ? 'text-blue-100' : 'text-white'
                            }`}>
                              {getActivityIcon(activite.activiteId)}
                              {getActiviteName(activite.activiteId)}
                            </h3>
                            <div className="text-blue-200 text-sm mt-1">
                              ACT {journal.journalActivites?.findIndex(a => a.id === activite.id) !== undefined ? 
                                journal.journalActivites?.findIndex(a => a.id === activite.id) + 1 : ''}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="flex items-center bg-blue-500 px-3 py-1 rounded-full mr-3">
                              <FaBalanceScale className="mr-2" />
                              <span className="font-medium">{calculateQuantity(activite)}</span>
                            </div>
                            {expandedActivities.includes(activite.id) ? <FaChevronUp /> : <FaChevronDown />}
                          </div>
                        </div>
                      </div>
                      {/* Contenu de l'activité - visible seulement si développé */}
                      {expandedActivities.includes(activite.id) && (
                        <div className="p-5">
                          {/* Onglets */}
                          <div className="flex border-b border-gray-200 mb-4">
                            <button 
                              onClick={() => changeTab(activite.id, "localisation")}
                              className={`flex items-center px-4 py-3 font-medium text-sm rounded-t-lg transition-colors duration-200 ${
                                activeTab[activite.id] === "localisation"
                                  ? "bg-blue-100 text-blue-700 border-b-2 border-blue-500"
                                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                              }`}
                            >
                              <FaMapMarkerAlt className={`${activeTab[activite.id] === "localisation" ? "text-blue-600" : "text-gray-400"} mr-2`} />
                              <span>Localisation {
                                (activite.localisationJournals?.length || 0) > 0 && (activite.localisationDistanceJournals?.length || 0) === 0 ? 
                                  `(${activite.localisationJournals?.length} bases)` : 
                                  (activite.localisationDistanceJournals?.length || 0) > 0 ? 
                                    `(${activite.localisationDistanceJournals?.length} liaisons)` : 
                                    ''
                              }
                              </span>
                            </button>
                            <button 
                              onClick={() => changeTab(activite.id, "sous-traitants")}
                              className={`flex items-center px-4 py-3 font-medium text-sm rounded-t-lg transition-colors duration-200 ${
                                activeTab[activite.id] === "sous-traitants"
                                  ? "bg-blue-100 text-blue-700 border-b-2 border-blue-500"
                                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                              }`}
                            >
                              <FaHardHat className={`${activeTab[activite.id] === "sous-traitants" ? "text-blue-600" : "text-gray-400"} mr-2`} />
                              <span>Sous-traitants {activite.sousTraitantJournals && activite.sousTraitantJournals.length > 0 ? `(${activite.sousTraitantJournals.length})` : ''}</span>
                            </button>
                            <button 
                              onClick={() => changeTab(activite.id, "notes")}
                              className={`flex items-center px-4 py-3 font-medium text-sm rounded-t-lg transition-colors duration-200 ${
                                activeTab[activite.id] === "notes"
                                  ? "bg-blue-100 text-blue-700 border-b-2 border-blue-500"
                                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                              }`}
                            >
                              <FaStickyNote className={`${activeTab[activite.id] === "notes" ? "text-blue-600" : "text-gray-400"} mr-2`} />
                              <span>Notes {activite.comment ? '(1)' : ''}</span>
                            </button>
                          </div>
                          
                          {/* Contenu de l'onglet */}
                          {activeTab[activite.id] === "localisation" ? (
                            <div>
                              <div className="bg-blue-50 p-4 rounded-lg">
                                {renderLocalisations(activite)}
                              </div>
                            </div>
                          ) : activeTab[activite.id] === "sous-traitants" ? (
                            <div>
                              {activite.sousTraitantJournals && activite.sousTraitantJournals.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                  {activite.sousTraitantJournals.map((sousTraitant: SousTraitantJournal) => {
                                    const sousTraitantInfo = sousTraitants?.find(st => st.id === sousTraitant.sousTraitantId);
                                    return (
                                      <div 
                                        key={`${activite.id}-${sousTraitant.sousTraitantId}`}
                                        className="bg-white rounded-lg border border-blue-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                                      >
                                        <div className="bg-blue-50 px-4 py-3 border-b border-blue-100">
                                          <h3 className="font-semibold text-blue-800">{getSousTraitantName(sousTraitant.sousTraitantId)}</h3>
                                        </div>
                                        <div className="p-4">
                                          <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Quantité:</span>
                                            <span className="text-lg font-semibold text-blue-700">{sousTraitant.quantite} {getUniteSymbol(sousTraitant.uniteId)}</span>
                                          </div>
                                          {sousTraitantInfo && (
                                            <div className="mt-2 pt-2 border-t border-blue-50">
                                              <p className="text-sm text-gray-600">{sousTraitantInfo.nom}</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="text-center py-6 bg-blue-50 rounded-lg">
                                  <p className="text-blue-500">Aucun sous-traitant associé à cette activité</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="bg-blue-50 p-4 rounded-lg">
                              {activite.comment ? (
                                <p className="text-gray-700 whitespace-pre-line">{activite.comment}</p>
                              ) : (
                                <p className="text-blue-500 text-center">Aucune note pour cette activité</p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-blue-50 rounded-lg">
                  <p className="text-blue-500">Aucune activité associée à ce journal</p>
                </div>
              )}
            </ExpandableSection>

            {/* Section Matériaux */}
            <ExpandableSection
              isOpen={expandedSections.materiaux}
              toggleSection={() => toggleSectionExpand("materiaux")}
              title={`Matériaux (${journal.materiauxJournals?.length || 0})`}
              icon={<FaBox />}
            >
              {journal.materiauxJournals && journal.materiauxJournals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Utiliser un Set pour éviter les doublons basés sur materielId */}
                  {Array.from(new Map(journal.materiauxJournals.map(item => [item.materielId, item])).values()).map((materiau: MateriauxJournal) => {
                    const materielInfo = materiaux?.find(m => m.id === materiau.materielId);
                    return (
                      <div 
                        key={materiau.materielId}
                        className="bg-white rounded-lg border border-blue-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="bg-blue-50 px-4 py-3 border-b border-blue-100">
                          <h3 className="font-semibold text-blue-800">{getMateriauxName(materiau.materielId)}</h3>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Quantité:</span>
                            <span className="text-lg font-semibold text-blue-700">{materiau.quantite}</span>
                          </div>
                          {materielInfo && (
                            <div className="mt-2 pt-2 border-t border-blue-50">
                              <p className="text-sm text-gray-600">{materielInfo.nom}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 bg-blue-50 rounded-lg">
                  <p className="text-blue-500">Aucun matériau associé à ce journal</p>
                </div>
              )}
            </ExpandableSection>
          </div>
        </div>
      </td>
    </tr>
  );
};

export default JournalDetails;
