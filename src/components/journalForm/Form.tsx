import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { FaArrowRight, FaFilePdf } from "react-icons/fa";
import { PDFViewer, Font, BlobProvider } from "@react-pdf/renderer";
import InfoProjet from "../sections/InfoProjet";
import InfoEmployes from "../sections/InfoEmployes";
import ActiviteProjet from "../sections/activiteProjet/ActiviteProjet";
import SousTraitantSection from "../sections/SousTraitantSection";
import MateriauxInfo from "../sections/MeteriauxInfo";
import SectionHeader from "../sections/sectionHeader/SectionHeader";
import SignatureSection from "../sections/signature/SignatureSection";
import { useAuth } from "../../context/AuthContext";
import {
  Employe,
  PlanifChantier,
  PlanifActivites,
  initialPlanifChantier,
  LocalisationDistance,
  Localisation,
  JournalUserStats,
  SignatureData,
  Activite,
  Lieu,
  JournalActivite,
  TabPlanifChantier,
  UserStat,
  SousTraitant,
  Journal,
  SousTraitantFormData,
  JournalSousTraitant,
  JournalChantier
} from "../../models/JournalFormModel";
import { PDFDocument } from "../../helper/PDFGenerator";
import {
  getDistancesForLieu, getPlanifChantier, getPlanifActivites, createJournalChantier, saveJournalPdf
} from "../../services/JournalService";
import {
  format
} from "date-fns";

Font.register({
  family: "Inter",
  src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2",
});

type SectionKey =
  | "materiaux"
  | "sousTraitants"
  | "infoProjet"
  | "infoEmployes"
  | "grilleActivites"
  | "notes"
  | "signature";

type Sections = {
  [key in SectionKey]: { open: boolean; visible: boolean };
};

type PDFData = {
  journalDate: Date;
  journalArrivee: string;
  journalDepart: string;
  journalWeather: string;
  journalUsers: Employe[];
  planifChantier: PlanifChantier;
  planifActivites: PlanifActivites[];
  journalMateriaux: any[];
  journalSousTraitants: JournalSousTraitant[];
  userStats: { id: number; nom: string; act: number[]; ts: number; td: number }[];
  totals: { act: number[]; ts: number; td: number };
  notes: string;
  projetId: string;
  signatureData: { signature: string; signataire: string; date: Date } | null;
};

const formatDateForFileName = (date: Date): string => {
  return format(date, "yyyyMMdd");
};

export default function Form() {
  const {
    lieux,
    activites,
    selectedProject,
    bases,
    unites,
    fetchBases
  } = useAuth();

  const { type, idPlanif } = useParams<{ type: string; idPlanif: string }>();

  const [journal, setJournal] = useState<Journal | null>(null);
  const [journalDate, setJournalDate] = useState<Date>(new Date());
  const [journalArrivee, setJournalArrivee] = useState("");
  const [journalDepart, setJournalDepart] = useState("");
  const [journalWeather, setJournalWeather] = useState("");
  const [journalNotes, setJournalNotes] = useState("");

  const [journalUsers, setJournalUsers] = useState<Employe[]>([]);

  const [planifChantier, setPlanifChantier] = useState<PlanifChantier | null>(null);

  console.log('Form - Auth Context Data:', {
    lieux,
    activites,
    selectedProject,
    bases,
    planifChantier
  });

  useEffect(() => {
    if (unites) {
      console.log('Form - Unités disponibles:', unites);
    }
  }, [unites]);

  const [planifActivites, setPlanifActivites] = useState<PlanifActivites[]>([]);
  
  const [journalSavedBases, setJournalSavedBases] = useState<Localisation[]>([]);
  const [journalSavedLiaisons, setJournalSavedLiaisons] = useState<LocalisationDistance[]>([]);
  const [savedBasesAttachment, setSavedBasesAttachment] = useState<string[]>([]);

  const [journalUserStats, setJournalUserStats] = useState<JournalUserStats>({
    userStats: [],
    totals: {
      act: [],
      ts: 0,
      td: 0,
    },
  });
  
  const [journalMateriaux, setJournalMateriaux] = useState<any[]>([]);
  const [journalSousTraitants, setJournalSousTraitants] = useState<SousTraitantFormData[]>([]);
  const [distances, setDistances] = useState<LocalisationDistance[]>([]);

  const [sections, setSections] = useState<Sections>({
    infoProjet: { open: true, visible: true },
    infoEmployes: { open: true, visible: true },
    grilleActivites: { open: true, visible: true },
    materiaux: { open: true, visible: true },
    sousTraitants: { open: true, visible: true },
    notes: { open: true, visible: true },
    signature: { open: true, visible: true },
  });

  const [showPDF, setShowPDF] = useState(false);
  const [pdfEnabled, setPdfEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [signatureData, setSignatureData] = useState<{
    signature: string;
    signataire: string;
    date: Date;
  } | null>(null);

  const [activitesList, setActivitesList] = useState<Activite[]>([]);
  const [lieuxList, setLieuxList] = useState<Lieu[]>([]);

  useEffect(() => {
    if (activites) {
      console.log('Setting activitesList from activites:', activites);
      setActivitesList(activites);
    }
  }, [activites]);

  useEffect(() => {
    if (lieux) {
      console.log('Setting lieuxList from lieux:', lieux);
      setLieuxList(lieux);
    }
  }, [lieux]);

  useEffect(() => {
    if (type === "entretien") {
      setSections((prevSections) => ({
        ...prevSections,
        sousTraitants: { ...prevSections.sousTraitants, visible: false },
      }));
    } else if (type === "civil") {
      setSections((prevSections) => ({
        ...prevSections,
        materiaux: { ...prevSections.materiaux, visible: false },
      }));
    }
  }, [type]);

  useEffect(() => {
    if (idPlanif) {
      const fetchPlanifData = async () => {
        try {
          const planifData = await getPlanifChantier(Number(idPlanif));
          if (planifData) {
            setPlanifChantier(planifData);
            
            // Mettre à jour les champs du journal
            setJournalDate(new Date(planifData.date));
            setJournalArrivee(planifData.hrsDebut);
            setJournalDepart(planifData.hrsFin);
            
            // Récupérer les activités associées
            const activitesData = await getPlanifActivites(Number(idPlanif));
            if (activitesData && activitesData.length > 0) {
              // Transformer les données pour inclure les informations nécessaires
              const formattedActivites = activitesData.map((act: PlanifActivites) => ({
                id: act.id,
                activiteID: act.activiteID,
                lieuID: act.lieuID || planifData.lieuID, // Garder le lieu existant ou utiliser celui de la planif par défaut
                quantite: 0,
                notes: '',
                planifID: Number(idPlanif)
              }));
              setPlanifActivites(formattedActivites);
            } else {
              // Si pas d'activités, créer une activité vide par défaut
              setPlanifActivites([{
                id: Date.now(),
                activiteID: null,
                lieuID: null, // Ne pas forcer le lieu par défaut
                quantite: 0,
                notes: '',
                planifID: 0
              }]);
            }

            // Si un lieu est défini, récupérer les distances
            if (planifData.lieuID) {
              fetchDistances(planifData.lieuID);
            }
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des données de planification:", error);
          // En cas d'erreur, créer une activité vide
          setPlanifActivites([{
            id: Date.now(),
            activiteID: null,
            lieuID: null, // Ne pas forcer le lieu par défaut
            quantite: 0,
            notes: '',
            planifID: 0
          }]);
        }
      };

      fetchPlanifData();
    } else {
      // Si pas de planification sélectionnée, créer une activité vide
      setPlanifActivites([{
        id: Date.now(),
        activiteID: null,
        lieuID: null, // Ne pas forcer le lieu par défaut
        quantite: 0,
        notes: '',
        planifID: 0
      }]);
    }
  }, [idPlanif]);

  useEffect(() => {
    // Synchroniser userStats avec journalUsers
    const updatedStats = journalUsers.map(user => {
      // Chercher les stats existantes pour cet utilisateur
      const existingStat = journalUserStats.userStats.find(stat => stat.id === user.id);
      if (existingStat) {
        return {
          ...existingStat,
          nom: user.nom && user.prenom ? `${user.prenom} ${user.nom}` : existingStat.nom
        };
      }
      // Créer de nouvelles stats pour un nouvel utilisateur
      return {
        id: user.id,
        nom: user.nom && user.prenom ? `${user.prenom} ${user.nom}` : "",
        act: Array(10).fill(0),
        ts: 0,
        td: 0
      };
    });

    setJournalUserStats(prev => ({
      ...prev,
      userStats: updatedStats
    }));
  }, [journalUsers]);

  useEffect(() => {
    if (idPlanif) {
      fetchDistances(planifChantier?.lieuID || 0);
    }
  }, [idPlanif, planifChantier]);

  const fetchDistances = async (lieuId: number) => {
    try {
      const distancesData = await getDistancesForLieu(lieuId);
      setDistances(distancesData);
    } catch (error) {
      console.error("Erreur lors de la récupération des distances:", error);
    }
  };

  const toggleSection = (section: SectionKey) => {
    setSections((prevSections) => ({
      ...prevSections,
      [section]: {
        ...prevSections[section],
        open: !prevSections[section].open,
      },
    }));
  };

  const visibleSections = Object.keys(sections).filter(
    (key) => sections[key as SectionKey].visible
  ) as SectionKey[];

  const handleUserStatsUpdate = (act: number[]) => {
    const updatedStats = journalUserStats.userStats.map((user: UserStat) => ({
      ...user,
      act
    }));

    setJournalUserStats({
      ...journalUserStats,
      userStats: updatedStats
    });
  };

  const convertToJournalActivite = (planif: PlanifActivites): JournalActivite => {
    if (!planifChantier) throw new Error("planifChantier is undefined");
    
    return {
      id: planif.id,
      activiteID: planif.activiteID,
      lieuID: planif.lieuID || planifChantier.lieuID, // Utiliser le lieu spécifique de l'activité, sinon celui de la planif
      quantite: planif.quantite || 0,
      date: planifChantier.date,
      hrsDebut: planifChantier.hrsDebut,
      hrsFin: planifChantier.hrsFin,
      defaultEntrepriseId: planifChantier.defaultEntrepriseId,
      signalisationId: planifChantier.signalisationId,
      notes: planif.notes || '',
      bases: planif.bases || [],
      liaisons: planif.liaisons || []
    };
  };

  const convertToPlanifActivites = (journal: JournalActivite): PlanifActivites => {
    if (journal.activiteID === null) {
      throw new Error("activiteID cannot be null");
    }
    
    return {
      id: journal.id,
      planifID: Number(idPlanif),
      activiteID: journal.activiteID,
      lieuID: journal.lieuID, // Garder le lieu spécifique de l'activité
      quantite: journal.quantite,
      notes: journal.notes || '',
      bases: journal.bases,
      liaisons: journal.liaisons
    };
  };

  const handlePlanifActivitesUpdate = (updatedActivites: JournalActivite[]) => {
    try {
      console.log("Updating activities:", updatedActivites);
      const convertedActivites = updatedActivites.map(convertToPlanifActivites);
      console.log("Converted activities:", convertedActivites);
      setPlanifActivites(convertedActivites);
    } catch (error) {
      console.error("Error updating planif activites:", error);
    }
  };

  const transformSousTraitantsForJournal = (sousTraitants: SousTraitantFormData[]): JournalSousTraitant[] => {
    console.log('Transformation des sous-traitants pour le journal:', sousTraitants);
    
    return sousTraitants.map(st => {
      const activite = activites?.find(a => a.id === st.activiteID);
      const unite = unites?.find(u => u.idUnite === st.idUnite);
      
      console.log(`Sous-traitant à envoyer - ID: ${st.id}, Nom: ${st.nom}, ActivitéID: ${st.activiteID}`);
      
      return {
        sousTraitantID: st.id,
        activiteID: st.activiteID,
        idUnite: st.idUnite,
        quantite: st.quantite,
        nomSousTraitant: st.nom,
        nomActivite: activite?.nom || '',
        descriptionUnite: unite?.description || ''
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setSubmitSuccess(null);
    setSubmitError(null);

    const journalChantier: JournalChantier = {
      id: 0,
      date: planifChantier?.date || new Date().toISOString().split('T')[0],
      hrsDebut: planifChantier?.hrsDebut || '',
      hrsFin: planifChantier?.hrsFin || '',
      planifId: planifChantier?.id || 0,
      meteoId: undefined,
      statutId: 1,
      projetId: planifChantier?.projetID || 0,
      notes: journalNotes,
      equipeJournals: undefined,
      materiauxJournals: journalMateriaux.map(materiau => ({
        journalId: 0,
        materielId: materiau.materielId || materiau.id, // Utiliser materielId s'il existe, sinon utiliser id
        quantite: materiau.quantite
      })),
      journalActivites: planifActivites
        .filter(activite => activite.activiteID !== null)
        .map(activite => {
          // Trouver les sous-traitants associés à cette activité
          const relatedSousTraitants = journalSousTraitants
            .filter(st => st.activiteID === activite.activiteID)
            .map(st => {
              console.log(`Sous-traitant à envoyer - ID: ${st.id}, Nom: ${st.nom}, ActivitéID: ${st.activiteID}`);
              return {
                journalActiviteId: 0, // Sera mis à jour après création de l'activité
                sousTraitantId: st.id, // Utiliser directement l'ID du sous-traitant
                quantite: st.quantite,
                uniteId: st.idUnite || 0
              };
            });

          return {
            id: 0,
            journalId: 0,
            activiteId: activite.activiteID as number,
            comment: activite.notes || '',
            localisationJournals: activite.bases?.map(base => ({
              id: 0,
              journalActiviteId: 0,
              localisationId: base.id
            })) || [],
            localisationDistanceJournals: activite.liaisons?.map(liaison => ({
              id: 0,
              journalActiviteId: 0,
              localisationDistanceId: liaison.id
            })) || [],
            sousTraitantJournals: relatedSousTraitants
          };
        }),
      bottinJournals: journalUsers
        .filter(user => 
          typeof user.id === 'number' && 
          user.id.toString().length <= 5 &&
          (user.nom?.trim() || user.prenom?.trim())
        )
        .map(user => ({
          bottinId: user.id,
          journalId: 0
        }))
    };

    console.log('Journal Chantier à envoyer:', journalChantier);
    
    // Log détaillé des sous-traitants dans le journal
    console.log('Détail des sous-traitants par activité:');
    journalChantier.journalActivites?.forEach((activite, index) => {
      console.log(`Activité ${index + 1} (ID: ${activite.activiteId}):`);
      activite.sousTraitantJournals?.forEach((st, stIndex) => {
        console.log(`  Sous-traitant ${stIndex + 1}: ID=${st.sousTraitantId}, Quantité=${st.quantite}, UnitéID=${st.uniteId}`);
      });
    });

    try {
      const response = await createJournalChantier(journalChantier);
      console.log('Réponse de la création du journal:', response);
      setSubmitSuccess(`Journal de chantier créé avec succès. ID: ${response.id}`);
      
      // Après avoir créé le journal, générer le PDF
      if (signatureData) {
        // S'assurer que nous avons les bases pour le lieu actuel
        if (planifChantier?.lieuID) {
          try {
            console.log('Chargement des bases pour le lieu:', planifChantier.lieuID);
            await fetchBases(planifChantier.lieuID);
          } catch (error) {
            console.error('Erreur lors du chargement des bases:', error);
          }
        }
        
        setShowPDF(true);
        setPdfEnabled(true);
      } else {
        alert("Veuillez compléter la signature avant de générer le PDF.");
      }
    } catch (error) {
      console.error('Erreur lors de la création du journal:', error);
      setSubmitError(`Erreur lors de la création du journal: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePDFGeneration = async () => {
    // Vérifier si la signature a été complétée
    if (!signatureData) {
      alert("Veuillez compléter la signature avant de générer le PDF.");
      return;
    }
    
    // S'assurer que nous avons les bases pour le lieu actuel
    if (planifChantier?.lieuID) {
      try {
        console.log('Chargement des bases pour le lieu:', planifChantier.lieuID);
        await fetchBases(planifChantier.lieuID);
      } catch (error) {
        console.error('Erreur lors du chargement des bases:', error);
      }
    }

    setShowPDF(true);
    setPdfEnabled(true);
  };

  const renderActiviteProjet = () => {
    if (!planifChantier) return null;

    try {
      const journalActivites = planifActivites.map(planif => {
        if (planif.activiteID === null) {
          throw new Error("activiteID cannot be null");
        }
        return convertToJournalActivite(planif);
      });

      return (
        <ActiviteProjet
          users={journalUsers}
          planifChantier={{
            ...planifChantier,
            note: planifChantier.note || '',
            activites: []
          } as TabPlanifChantier}
          planifActivites={journalActivites}
          userStats={journalUserStats.userStats}
          setUserStats={(newStats: JournalUserStats) => setJournalUserStats(newStats)}
          setPlanifActivites={handlePlanifActivitesUpdate}
          onPlanifActivitesChange={handlePlanifActivitesUpdate}
        />
      );
    } catch (error) {
      console.error("Error rendering ActiviteProjet:", error);
      return null;
    }
  };

  const renderPDF = () => {
    if (!planifChantier) return null;

    // S'assurer que toutes les propriétés requises sont présentes
    const planifChantierData: PlanifChantier = {
      id: planifChantier.id || 0,
      date: planifChantier.date || new Date().toISOString().split('T')[0],
      hrsDebut: planifChantier.hrsDebut || '',
      hrsFin: planifChantier.hrsFin || '',
      lieuID: planifChantier.lieuID || 0,
      projetID: planifChantier.projetID || 0,
      defaultEntrepriseId: planifChantier.defaultEntrepriseId || 0,
      isLab: planifChantier.isLab || false,
      signalisationId: planifChantier.signalisationId || 0,
      note: planifChantier.note || '',
      lieu: planifChantier.lieu,
      projet: planifChantier.projet,
      defaultEntreprise: planifChantier.defaultEntreprise,
      signalisation: planifChantier.signalisation
    };

    return (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        backgroundColor: "white"
      }}>
        <BlobProvider document={
          <PDFDocument
            data={{
              journalDate,
              journalArrivee,
              journalDepart,
              journalWeather,
              journalUsers,
              planifChantier: planifChantier || initialPlanifChantier,
              planifActivites,
              journalMateriaux,
              journalSousTraitants: transformSousTraitantsForJournal(journalSousTraitants),
              userStats: journalUserStats.userStats,
              totals: journalUserStats.totals,
              notes: journalNotes,
              signatureData: signatureData,
            }}
            selectedProject={selectedProject}
            activites={activites}
            lieux={lieux}
            bases={bases}
            journalPlanifId={Number(idPlanif)}
          />
        }>
          {({ blob, url, loading }) => {
            if (loading) return <div>Chargement du document...</div>;
            if (!url || !blob) return <div>Erreur lors de la génération du PDF</div>;
            
            const fileName = `${formatDateForFileName(journalDate)}_${selectedProject?.NumeroProjet || "NOPROJ"}_${idPlanif?.padStart(7, "0")}.pdf`;

            const handleDownload = () => {
              const link = document.createElement('a');
              link.href = url;
              link.download = fileName;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            };

            const handleSaveToDB = async () => {
              if (!selectedProject?.NumeroProjet) {
                alert("Numéro de projet manquant. Impossible de sauvegarder le PDF.");
                return;
              }

              try {
                setIsSubmitting(true);
                const response = await saveJournalPdf(blob, String(selectedProject.NumeroProjet), fileName);
                alert(`PDF sauvegardé avec succès: ${response.message}`);
                console.log('Réponse de sauvegarde du PDF:', response);
                
                // Fermer la vue PDF et revenir au formulaire
                setShowPDF(false);
                
                // Réinitialiser le formulaire ou rediriger vers une autre page si nécessaire
                // window.location.href = '/planification'; // Décommenter pour rediriger
              } catch (error) {
                console.error('Erreur lors de la sauvegarde du PDF:', error);
                alert(`Erreur lors de la sauvegarde du PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
              } finally {
                setIsSubmitting(false);
              }
            };

            return (
              <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "10px", backgroundColor: "#f0f0f0", display: "flex", justifyContent: "space-between" }}>
                  <button
                    onClick={() => setShowPDF(false)}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Retour au formulaire
                  </button>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleDownload}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
                    >
                      <FaFilePdf className="mr-2" />
                      Télécharger
                    </button>
                    <button
                      onClick={handleSaveToDB}
                      className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Sauvegarde en cours...' : 'Sauvegarder dans le répertoire'}
                    </button>
                  </div>
                </div>
                <iframe 
                  src={url} 
                  style={{ flex: 1, border: "none" }}
                  title="PDF Preview"
                />
              </div>
            );
          }}
        </BlobProvider>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-4">
      {!showPDF ? (
        <div className="w-full max-w-4xl bg-white rounded shadow-md p-6 space-y-6">
          {sections.infoProjet.visible && (
            <section>
              <SectionHeader
                title={`${
                  visibleSections.indexOf("infoProjet") + 1
                }. Informations du Projet`}
                sectionKey="infoProjet"
                isOpen={sections.infoProjet.open}
                onToggle={toggleSection}
              />
              {sections.infoProjet.open && (
                <InfoProjet
                  date={journalDate}
                  setDate={setJournalDate}
                  arrivee={journalArrivee}
                  setArrivee={setJournalArrivee}
                  depart={journalDepart}
                  setDepart={setJournalDepart}
                  weather={journalWeather}
                  setWeather={setJournalWeather}
                />
              )}
            </section>
          )}

          {sections.infoEmployes.visible && (
            <section>
              <SectionHeader
                title={`${
                  visibleSections.indexOf("infoEmployes") + 1
                }. Informations des Employés`}
                sectionKey="infoEmployes"
                isOpen={sections.infoEmployes.open}
                onToggle={toggleSection}
              />
              {sections.infoEmployes.open && (
                <InfoEmployes
                  users={journalUsers}
                  setUsers={setJournalUsers}
                  userStats={journalUserStats.userStats}
                  setUserStats={setJournalUserStats}
                />
              )}
            </section>
          )}

          {sections.grilleActivites.visible && (
            <section>
              <SectionHeader
                title={`${
                  visibleSections.indexOf("grilleActivites") + 1
                }. Grille des Activités`}
                sectionKey="grilleActivites"
                isOpen={sections.grilleActivites.open}
                onToggle={toggleSection}
              />
              {sections.grilleActivites.open && (
                renderActiviteProjet()
              )}
            </section>
          )}

          {sections.materiaux.visible && (
            <section>
              <SectionHeader
                title={`${
                  visibleSections.indexOf("materiaux") + 1
                }. Matériaux/Outillage`}
                sectionKey="materiaux"
                isOpen={sections.materiaux.open}
                onToggle={toggleSection}
              />
              {sections.materiaux.open && (
                <MateriauxInfo
                  materiaux={journalMateriaux}
                  setMateriaux={setJournalMateriaux}
                />
              )}
            </section>
          )}

          {sections.sousTraitants.visible && (
            <section>
              <SectionHeader
                title={`${visibleSections.indexOf("sousTraitants") + 1}. Sous-Traitants`}
                sectionKey="sousTraitants"
                isOpen={sections.sousTraitants.open}
                onToggle={toggleSection}
              />
              {sections.sousTraitants.open && (
                <SousTraitantSection
                  sousTraitants={journalSousTraitants}
                  setSousTraitants={setJournalSousTraitants}
                  defaultEntrepriseId={planifChantier?.defaultEntrepriseId}
                  planifActivites={planifActivites.map(planif => {
                    try {
                      return convertToJournalActivite(planif);
                    } catch (error) {
                      console.error("Error converting planif to journal activite:", error);
                      return null;
                    }
                  }).filter((activite): activite is JournalActivite => activite !== null)}
                />
              )}
            </section>
          )}

          {sections.notes.visible && (
            <section>
              <SectionHeader
                title={`${
                  visibleSections.indexOf("notes") + 1
                }. Notes et Remarques`}
                sectionKey="notes"
                isOpen={sections.notes.open}
                onToggle={toggleSection}
              />
              {sections.notes.open && (
                <div className="bg-white rounded-lg shadow p-6">
                  <textarea
                    id="notes"
                    className="w-full min-h-[150px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    value={journalNotes}
                    onChange={(e) => setJournalNotes(e.target.value)}
                    placeholder="Entrez vos observations, commentaires ou points importants de la journée..."
                  />
                </div>
              )}
            </section>
          )}

          {sections.signature.visible && (
            <section>
              <SectionHeader
                title={`${
                  visibleSections.indexOf("signature") + 1
                }. Signature`}
                sectionKey="signature"
                isOpen={sections.signature.open}
                onToggle={toggleSection}
              />
              {sections.signature.open && (
                <SignatureSection
                  onSignatureComplete={(data) => {
                    setSignatureData(data);
                    setPdfEnabled(true);
                  }}
                />
              )}
            </section>
          )}

          {/* Message de succès */}
          {submitSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
              <span className="block sm:inline">{submitSuccess}</span>
            </div>
          )}
          
          {/* Message d'erreur */}
          {submitError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              <span className="block sm:inline">{submitError}</span>
            </div>
          )}
          
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={handlePDFGeneration}
              className={`bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center ${!signatureData ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!signatureData}
            >
              <FaFilePdf className="mr-2" />
              Générer PDF
            </button>
            <button
              type="submit"
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center ${isSubmitting || !signatureData ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleSubmit}
              disabled={isSubmitting || !signatureData}
            >
              {isSubmitting ? 'Envoi en cours...' : (
                <>
                  <FaArrowRight className="mr-2" />
                  Soumettre
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        renderPDF()
      )}
    </div>
  );
}
