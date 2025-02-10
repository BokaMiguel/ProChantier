import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaArrowRight, FaFilePdf } from "react-icons/fa";
import { PDFViewer, Font } from "@react-pdf/renderer";
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
} from "../../models/JournalFormModel";
import { PDFDocument } from "../../helper/PDFGenerator";
import { getDistancesForLieu, getPlanifChantier, getPlanifActivites } from "../../services/JournalService";

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

interface PDFContentProps {
  journalDate: string;
  journalArrivee: string;
  journalDepart: string;
  journalWeather: string;
  journalUsers: Employe[];
  planifChantier: PlanifChantier;
  planifActivites: PlanifActivites[];
  journalMateriaux: any[];
  journalSousTraitants: any[];
  userStats: JournalUserStats["userStats"];
  notes: string;
  projetId?: string;
  signatureData?: SignatureData | null;
}

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
  journalSousTraitants: any[];
  userStats: { id: number; nom: string; act: number[]; ts: number; td: number }[];
  notes: string;
  projetId: string;
  signatureData: { signature: string; signataire: string; date: Date } | null;
};

export default function Form() {
  const {
    lieux,
    sousTraitants,
    activites,
    signalisations,
    selectedProject,
  } = useAuth();

  const { type, idPlanif } = useParams<{ type: string; idPlanif: string }>();

  const [journalDate, setJournalDate] = useState<Date>(new Date());
  const [journalArrivee, setJournalArrivee] = useState("");
  const [journalDepart, setJournalDepart] = useState("");
  const [journalWeather, setJournalWeather] = useState("");
  const [journalNotes, setJournalNotes] = useState("");

  const [journalUsers, setJournalUsers] = useState<Employe[]>([
    {
      id: 1,
      nom: "",
      prenom: "",
      fonction: {
        id: null,
        nom: "",
      },
      equipement: {
        id: null,
        nom: "",
      },
    },
  ]);

  const [planifChantier, setPlanifChantier] = useState<PlanifChantier>(initialPlanifChantier);
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
  const [journalSousTraitants, setJournalSousTraitants] = useState<any[]>([]);
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
            setPlanifActivites(activitesData);

            // Si un lieu est défini, récupérer les distances
            if (planifData.lieuID) {
              fetchDistances(planifData.lieuID);
            }
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des données de planification:", error);
        }
      };

      fetchPlanifData();
    }
  }, [idPlanif]);

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

  const handleUserStatsChange = (newUserStats: JournalUserStats) => {
    setJournalUserStats(newUserStats);
  };

  const handlePDFGeneration = () => {
    const pdfData: PDFData = {
      journalDate,
      journalArrivee,
      journalDepart,
      journalWeather,
      journalUsers,
      planifChantier,
      planifActivites,
      journalMateriaux,
      journalSousTraitants,
      userStats: journalUserStats.userStats,
      notes: journalNotes,
      projetId: selectedProject?.ID.toString() || "",
      signatureData,
    };

    setShowPDF(true);
    setPdfEnabled(true);
  };

  const PDFContent = () => (
    <PDFViewer width="100%" height="1000px">
      <PDFDocument
        formData={{
          journalDate: journalDate.toISOString().split('T')[0],
          journalArrivee,
          journalDepart,
          journalWeather,
          journalUsers,
          planifChantier,
          planifActivites,
          journalMateriaux,
          journalSousTraitants,
          userStats: journalUserStats.userStats,
          notes: journalNotes,
          projetId: selectedProject?.ID.toString() || "",
          signatureData,
        }}
        activites={activites}
        bases={[]}
        distances={distances}
        lieux={lieux}
        journalPlanifId={Number(idPlanif)}
      />
    </PDFViewer>
  );

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
                <InfoEmployes users={journalUsers} setUsers={setJournalUsers} />
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
                <ActiviteProjet
                  users={journalUsers}
                  activitesState={planifActivites}
                  setActivitesState={setPlanifActivites}
                  savedBases={journalSavedBases}
                  setSavedBases={setJournalSavedBases}
                  savedLiaisons={journalSavedLiaisons}
                  setSavedLiaisons={setJournalSavedLiaisons}
                  userStats={journalUserStats.userStats}
                  setUserStats={handleUserStatsChange}
                  savedBasesAttachment={savedBasesAttachment}
                  setSavedBasesAttachment={setSavedBasesAttachment}
                />
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
                title={`${
                  visibleSections.indexOf("sousTraitants") + 1
                }. Sous-Traitants`}
                sectionKey="sousTraitants"
                isOpen={sections.sousTraitants.open}
                onToggle={toggleSection}
              />
              {sections.sousTraitants.open && (
                <SousTraitantSection
                  sousTraitants={journalSousTraitants}
                  setSousTraitants={setJournalSousTraitants}
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
        <PDFContent />
      )}
    </div>
  );
}
