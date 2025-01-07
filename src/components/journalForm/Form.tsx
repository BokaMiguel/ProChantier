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
import { useAuth } from "../../context/AuthContext";
import {
  Employe,
  ActivitePlanif,
  initialActivite,
  LocalisationDistance,
  Localisation,
  JournalUserStats,
} from "../../models/JournalFormModel";
import { PDFDocument } from "../../helper/PDFGenerator";
import { getDistancesForLieu } from "../../services/JournalService";

Font.register({
  family: "Inter",
  src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2",
});

export default function Form() {
  const {
    lieux,
    sousTraitants,
    activitesPlanif,
    bases,
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

  const [journalActivitesState, setJournalActivitesState] = useState<
    ActivitePlanif[]
  >([initialActivite]);
  const [journalSavedBases, setJournalSavedBases] = useState<Localisation[]>([]);
  const [journalSavedLiaisons, setJournalSavedLiaisons] = useState<
    LocalisationDistance[]
  >([]);

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

  const [sections, setSections] = useState({
    infoProjet: { open: true, visible: true },
    infoEmployes: { open: true, visible: true },
    grilleActivites: { open: true, visible: true },
    materiaux: { open: true, visible: true },
    sousTraitants: { open: true, visible: true },
    notes: { open: true, visible: true },
  });

  const [showPDF, setShowPDF] = useState(false);

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
    if (idPlanif && activitesPlanif && activites) {
      const currentPlanif = activitesPlanif.find(
        (planif) => planif.id === Number(idPlanif)
      );
      if (currentPlanif) {
        const lieu = lieux?.find((l) => l.id === currentPlanif.lieuID);
        const entreprise = sousTraitants?.find(
          (st) => st.id === currentPlanif.defaultEntrepriseId
        );
        const signalisation = signalisations?.find(
          (sig) => sig.id === currentPlanif.signalisationId
        );

        setJournalActivitesState([
          {
            ...currentPlanif,
            lieuID: lieu?.id ?? null,
            note: currentPlanif.note || "",
            defaultEntrepriseId: entreprise?.id ?? null,
            signalisationId: signalisation?.id ?? null,
          },
        ]);
        setJournalSavedBases([]);
        setJournalSavedLiaisons([]);

        if (currentPlanif.date) {
          setJournalDate(new Date(currentPlanif.date));
        }
        setJournalArrivee(currentPlanif.hrsDebut || "");
        setJournalDepart(currentPlanif.hrsFin || "");

        if (lieu) {
          fetchDistances(lieu.id);
        }
      }
    }
  }, [
    idPlanif,
    activitesPlanif,
    activites,
    lieux,
    sousTraitants,
    signalisations,
  ]);

  useEffect(() => {
    // Update journalUserStats when journalUsers changes
    setJournalUserStats((prevStats) => ({
      ...prevStats,
      userStats: journalUsers.map((user) => ({
        id: user.id,
        nom: `${user.prenom} ${user.nom}`,
        act: Array(10).fill(0),
        ts: 0,
        td: 0,
      })),
    }));
  }, [journalUsers]);

  const fetchDistances = async (lieuId: number) => {
    try {
      const distancesData = await getDistancesForLieu(lieuId);
      setDistances(distancesData);
    } catch (error) {
      console.error("Erreur lors de la récupération des distances:", error);
    }
  };

  const toggleSection = (section: keyof typeof sections) => {
    setSections((prevSections) => ({
      ...prevSections,
      [section]: {
        ...prevSections[section],
        open: !prevSections[section].open,
      },
    }));
  };

  const getVisibleSections = () => {
    return Object.entries(sections)
      .filter(([_, value]) => value.visible)
      .map(([key]) => key);
  };

  const handleUserStatsChange = (newUserStats: JournalUserStats) => {
    setJournalUserStats(newUserStats);
  };

  const logFormData = () => {
    console.log("Form Data:");
    console.log("Date:", journalDate);
    console.log("Arrivée:", journalArrivee);
    console.log("Départ:", journalDepart);
    console.log("Météo:", journalWeather);
    console.log("Utilisateurs:", journalUsers);
    console.log("Activités:", journalActivitesState);
    console.log("Matériaux:", journalMateriaux);
    console.log("Sous-traitants:", journalSousTraitants);
    console.log("Statistiques utilisateurs:", journalUserStats);
  };

  const handleGeneratePDF = async () => {
    logFormData();

    const uniqueLieuIds = [
      ...new Set(
        journalActivitesState
          .map((a) => a.lieuID)
          .filter((id): id is number => id !== null)
      ),
    ];
    const allDistances = await Promise.all(
      uniqueLieuIds.map((lieuId) => getDistancesForLieu(lieuId))
    );
    const flattenedDistances = allDistances.flat();

    console.log("Flattened distances:", flattenedDistances);

    setDistances(flattenedDistances);

    const processedActivities = journalActivitesState.map((activity) => {
      const activityDistances = flattenedDistances.filter(
        (d) => d.LieuID === activity.lieuID
      );
      const activityBases = activity.bases || [];

      const relevantDistances = activityDistances.filter(
        (d) =>
          activityBases.some((b) => b.id === d.BaseA) &&
          activityBases.some((b) => b.id === d.BaseB)
      );

      return {
        ...activity,
        processedDistances: relevantDistances,
      };
    });

    setJournalActivitesState(processedActivities);
    setShowPDF(true);
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
          journalActivitesState,
          journalMateriaux,
          journalSousTraitants,
          userStats: journalUserStats.userStats,
          notes: journalNotes,
          projetId: selectedProject?.NumeroProjet?.toString() || ''
        }}
        activites={activites}
        bases={bases || []}
        distances={distances}
        lieux={lieux}
        journalPlanifId={Number(idPlanif)}
      />
    </PDFViewer>
  );

  const visibleSections = getVisibleSections();

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
                  activitesState={journalActivitesState}
                  setActivitesState={setJournalActivitesState}
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

          <div className="text-right mt-6  space-x-4">
            <button
              onClick={handleGeneratePDF}
              className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition-colors duration-300"
            >
              Générer PDF
              <FaFilePdf className="ml-2" />
            </button>
            <button
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition-colors duration-300"
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
