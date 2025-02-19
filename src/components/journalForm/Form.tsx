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
  JournalSousTraitant
} from "../../models/JournalFormModel";
import { PDFDocument } from "../../helper/PDFGenerator";
import {
  getDistancesForLieu, getPlanifChantier, getPlanifActivites
} from "../../services/JournalService";
import { format } from "date-fns";

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
                lieuID: planifData.lieuID, // Utiliser le lieu de la planification
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
                lieuID: planifData.lieuID, // Utiliser le lieu de la planification
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
            lieuID: null,
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
        lieuID: null,
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
      lieuID: planifChantier.lieuID,
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
      lieuID: journal.lieuID,
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
    return sousTraitants.map(st => {
      const activite = activites?.find(a => a.id === st.activiteID);
      const unite = unites?.find(u => u.idUnite === st.idUnite);
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
    if (!journal) return;

    const journalToSubmit = {
      ...journal,
      sousTraitants: transformSousTraitantsForJournal(journalSousTraitants)
    };

    // ... reste du code de soumission
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

    const pdfData: PDFData = {
      journalDate: journalDate,
      journalArrivee: journalArrivee,
      journalDepart: journalDepart,
      journalWeather: journalWeather,
      journalUsers,
      planifChantier: planifChantierData,
      planifActivites: planifActivites.map(act => {
        if (act.activiteID === null) {
          throw new Error("activiteID cannot be null");
        }
        return {
          ...act,
          activiteID: act.activiteID
        };
      }),
      journalMateriaux,
      journalSousTraitants: transformSousTraitantsForJournal(journalSousTraitants),
      userStats: journalUserStats.userStats,
      totals: journalUserStats.totals || { act: [], ts: 0, td: 0 },
      notes: journalNotes,
      projetId: selectedProject?.ID?.toString() || '0',
      signatureData: signatureData,
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
            if (!url) return <div>Erreur lors de la génération du PDF</div>;
            
            const handleDownload = () => {
              const fileName = `${formatDateForFileName(journalDate)}_${selectedProject?.NumeroProjet || "NOPROJ"}_${idPlanif?.padStart(7, "0")}`;

              const link = document.createElement('a');
              link.href = url;
              link.download = `${fileName}.pdf`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            };

            return (
              <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "10px", backgroundColor: "#f0f0f0", display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={handleDownload}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
                  >
                    <FaFilePdf className="mr-2" />
                    Télécharger le PDF
                  </button>
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

  const handlePDFGeneration = async () => {
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

          <div className="text-right mt-6 space-x-4">
            <button
              onClick={handlePDFGeneration}
              disabled={!pdfEnabled}
              className={`inline-flex items-center px-4 py-2 ${
                pdfEnabled
                  ? "bg-red-500 hover:bg-red-700"
                  : "bg-gray-400 cursor-not-allowed"
              } text-white rounded transition-colors duration-300`}
            >
              Générer PDF
              <FaFilePdf className="ml-2" />
            </button>
            <button
              disabled={!pdfEnabled}
              className={`inline-flex items-center px-4 py-2 ${
                pdfEnabled
                  ? "bg-blue-500 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              } text-white rounded transition-colors duration-300`}
            >
              Envoyer le formulaire
              <FaArrowRight className="ml-2" />
            </button>
          </div>
        </div>
      ) : (
        renderPDF()
      )}
    </div>
  );
}
