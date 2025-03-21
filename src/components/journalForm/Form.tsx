import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaFilePdf, FaSave, FaSpinner } from "react-icons/fa";
import { Font, BlobProvider } from "@react-pdf/renderer";
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
  initialPlanifChantier,
  LocalisationDistance,
  JournalUserStats,
  Activite,
  Lieu,
  JournalActivite,
  TabPlanifChantier,
  UserStat,
  SousTraitantFormData,
  JournalSousTraitant,
  JournalChantier,
  PlanifActiviteJournal,
  initialPlanifActiviteJournal
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
  planifActivites: PlanifActiviteJournal[];
  journalMateriaux: any[];
  journalSousTraitants: JournalSousTraitant[];
  userStats: UserStat[];
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
    fetchBases,
    signalisations
  } = useAuth();

  const { type, idPlanif } = useParams<{ type: string; idPlanif: string }>();
  const [journalDate, setJournalDate] = useState<Date>(new Date());
  const [journalArrivee, setJournalArrivee] = useState("");
  const [journalDepart, setJournalDepart] = useState("");
  const [journalWeather, setJournalWeather] = useState("");
  const [journalMeteoId, setJournalMeteoId] = useState<number>(1); // Défaut: Soleil (ID: 1)
  const [journalNotes, setJournalNotes] = useState("");
  const [journalUsers, setJournalUsers] = useState<Employe[]>([]);
  const [planifChantier, setPlanifChantier] = useState<PlanifChantier | null>(null);
  const [planifActivites, setPlanifActivites] = useState<PlanifActiviteJournal[]>([]);
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
  const [journalId, setJournalId] = useState<number | null>(null);
  const [signatureData, setSignatureData] = useState<{
    signature: string;
    signataire: string;
    date: Date;
  } | null>(null);

  const [activitesList, setActivitesList] = useState<Activite[]>([]);
  const [lieuxList, setLieuxList] = useState<Lieu[]>([]);

  useEffect(() => {
    if (activites) {
      setActivitesList(activites);
    }
  }, [activites]);

  useEffect(() => {
    if (lieux) {
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
            console.log("Planification reçue initialement:", activitesData);
            if (activitesData && activitesData.length > 0) {
              console.log("Premier élément de la planification:", activitesData[0]);
              const planifData = activitesData[0];
              // Transformer les données pour inclure les informations nécessaires
              const formattedActivites = activitesData.map((act: any) => ({
                // Propriétés obligatoires de PlanifActivite
                id: act.id,
                planifID: Number(idPlanif),
                PlanifID: Number(idPlanif),
                activiteID: act.activiteID || act.activiteId || null,
                activiteId: act.activiteID || act.activiteId || null,
                lieuID: act.lieuID || act.lieuId || planifData.lieuID, // Utiliser le lieu spécifique de l'activité, sinon celui de la planif
                lieuId: act.lieuID || act.lieuId || planifData.lieuID, // Utiliser le lieu spécifique de l'activité, sinon celui de la planif
                debut: act.hrsDebut || planifData.hrsDebut || "08:00",
                fin: act.hrsFin || planifData.hrsFin || "17:00",
                hrsDebut: act.hrsDebut || planifData.hrsDebut || "08:00",
                hrsFin: act.hrsFin || planifData.hrsFin || "17:00",
                signalisation: act.signalisationID || 0,
                signalisationId: act.signalisationID || 0,
                qteLab: act.qteLab || null,
                isComplete: act.isComplete || false,
                sousTraitantID: act.sousTraitantID || 0,
                defaultEntrepriseId: act.sousTraitantID || planifData.defaultEntrepriseId || 0,
                
                // Propriétés supplémentaires
                quantite: act.quantite || 0,
                notes: act.notes || '',
              }));
              setPlanifActivites(formattedActivites);
            } else {
              // Si pas d'activités, créer une activité vide par défaut
              const emptyActivity: PlanifActiviteJournal = {
                // Propriétés obligatoires de PlanifActivite
                ID: 0,
                PlanifID: Number(idPlanif),
                debut: planifData.hrsDebut || "08:00",
                fin: planifData.hrsFin || "17:00",
                signalisation: planifData.signalisationID || 0,
                signalisationId: planifData.signalisationID || 0,
                lieuId: 0,
                qteLab: null,
                activiteId: 0,
                isComplete: false,
                sousTraitantId: 0,
                
                // Propriétés supplémentaires
                quantite: 0,
                notes: '',
                hrsDebut: planifData.hrsDebut || "08:00",
                hrsFin: planifData.hrsFin || "17:00",
                defaultEntrepriseId: planifData.defaultEntrepriseId || 0,
                date: planifData.date,
                activiteIDs: [],
                bases: [],
                liaisons: []
              };
              setPlanifActivites([emptyActivity]);
            }

            // Si un lieu est défini, récupérer les distances
            if (planifData.lieuID) {
              fetchDistances(planifData.lieuID);
            }
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des données de planification:", error);
          // En cas d'erreur, créer une activité vide par défaut
          const emptyActivity: PlanifActiviteJournal = {
            // Propriétés obligatoires de PlanifActivite
            ID: 0,
            PlanifID: 0,
            debut: "08:00",
            fin: "17:00",
            signalisation: 0,
            signalisationId: 0,
            lieuId: 0,
            qteLab: null,
            activiteId: 0,
            isComplete: false,
            sousTraitantId: 0,
            
            // Propriétés supplémentaires
            quantite: 0,
            notes: '',
            hrsDebut: "08:00",
            hrsFin: "17:00",
            defaultEntrepriseId: 0,
            date: new Date().toISOString().split('T')[0],
            activiteIDs: [],
            bases: [],
            liaisons: []
          };
          setPlanifActivites([emptyActivity]);
        }
      };
      
      fetchPlanifData();
    } else {
      // Si pas de planification sélectionnée, créer une activité vide par défaut
      const emptyActivity: PlanifActiviteJournal = {
        // Propriétés obligatoires de PlanifActivite
        ID: 0,
        PlanifID: 0,
        debut: "08:00",
        fin: "17:00",
        signalisation: 0,
        signalisationId: 0,
        lieuId: 0,
        qteLab: null,
        activiteId: 0,
        isComplete: false,
        sousTraitantId: 0,
        
        // Propriétés supplémentaires
        quantite: 0,
        notes: '',
        hrsDebut: "08:00",
        hrsFin: "17:00",
        defaultEntrepriseId: 0,
        date: new Date().toISOString().split('T')[0],
        activiteIDs: [],
        bases: [],
        liaisons: []
      };
      setPlanifActivites([emptyActivity]);
    }
  }, [idPlanif]);

  useEffect(() => {
    if (idPlanif) {
      fetchDistances(planifChantier?.lieuID || 0);
    }
  }, [idPlanif, planifChantier]);

  useEffect(() => {
    if (journalUsers.length > 0) {
      // Filtrer pour éliminer les utilisateurs sans nom valide
      const validUsers = journalUsers.filter(user => 
        (user.nom && user.nom.trim() !== "") || (user.prenom && user.prenom.trim() !== "")
      );
      
      // Si aucun utilisateur valide, ne rien faire
      if (validUsers.length === 0) {
        console.log("Aucun utilisateur valide pour la synchronisation des statistiques");
        return;
      }
      
      // Vérifier quels utilisateurs ont des statistiques existantes
      const existingUserStats = [...journalUserStats.userStats];
      const updatedUserStats = [];
      
      // Pour chaque utilisateur valide, trouver ou créer des statistiques
      for (const user of validUsers) {
        // Chercher des statistiques existantes pour cet utilisateur
        const existingStat = existingUserStats.find(stat => stat.id === user.id);
        
        if (existingStat) {
          // Mettre à jour le nom si nécessaire
          updatedUserStats.push({
            ...existingStat,
            nom: `${user.prenom || ''} ${user.nom || ''}`.trim()
          });
        } else {
          // Créer de nouvelles statistiques
          updatedUserStats.push({
            id: user.id,
            nom: `${user.prenom || ''} ${user.nom || ''}`.trim(),
            act: Array(10).fill(0),
            ts: 0,
            td: 0
          });
        }
      }
      
      // Recalculer les totaux
      const totals = updatedUserStats.reduce(
        (acc, stat) => {
          for (let i = 0; i < 10; i++) {
            acc.act[i] = (acc.act[i] || 0) + (stat.act[i] || 0);
          }
          acc.ts += stat.ts || 0;
          acc.td += stat.td || 0;
          return acc;
        },
        { act: Array(10).fill(0), ts: 0, td: 0 }
      );
      
      // Mettre à jour les statistiques
      setJournalUserStats({
        userStats: updatedUserStats,
        totals
      });
      
      console.log("Synchronisation des utilisateurs et des statistiques:", { 
        users: validUsers,
        stats: updatedUserStats
      });
    }
  }, [journalUsers]);

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

  const convertToJournalActivite = (planif: PlanifActiviteJournal): JournalActivite => {
    // Préserver l'ID original pour maintenir la cohérence
    const originalId = planif.id || planif.ID;
    
    console.log(`Conversion de PlanifActivite vers JournalActivite: ID=${originalId}, isComplete=${planif.isComplete}`);
    
    return {
      id: originalId, // Assurer que l'ID est préservé
      activiteID: planif.activiteID || planif.activiteId,
      planifID: planif.PlanifID,
      lieuID: planif.lieuID || planif.lieuId,
      quantite: planif.quantite || 0,
      notes: planif.notes || '',
      date: planif.date || '',
      hrsDebut: planif.hrsDebut || planif.debut || planifChantier?.hrsDebut || "08:00",
      hrsFin: planif.hrsFin || planif.fin || planifChantier?.hrsFin || "17:00",
      defaultEntrepriseId: planif.defaultEntrepriseId || planif.sousTraitantId || 0,
      signalisationId: planif.signalisationId || planif.signalisation || 0,
      bases: planif.bases || [],
      liaisons: planif.liaisons || [],
      isComplete: planif.isComplete || false, // Préserver la valeur isComplete
      qteLab: planif.qteLab || null // Ajouter le champ qteLab
    };
  };

  const convertToPlanifActivites = (journal: JournalActivite): PlanifActiviteJournal => {
    if (journal.activiteID === null) {
      throw new Error("activiteID cannot be null");
    }
    
    // Préserver l'ID original pour maintenir la cohérence
    const originalId = journal.id;
    
    return {
      // Propriétés obligatoires de PlanifActivite
      id: originalId, // Assurer que l'ID est préservé
      ID: originalId, // Assurer que l'ID est préservé
      PlanifID: Number(idPlanif),
      debut: journal.hrsDebut || planifChantier?.hrsDebut || "08:00",
      fin: journal.hrsFin || planifChantier?.hrsFin || "17:00",
      signalisation: journal.signalisation || 0,
      signalisationId: journal.signalisationId || 0,
      lieuId: journal.lieuID || 0,
      lieuID: journal.lieuID || 0, // Ajouter pour cohérence
      qteLab: journal.qteLab || null,
      activiteId: journal.activiteID,
      activiteID: journal.activiteID, // Ajouter pour cohérence
      isComplete: journal.isComplete || false, // Préserver la valeur isComplete
      sousTraitantId: journal.defaultEntrepriseId || 0,
      
      // Propriétés supplémentaires
      quantite: journal.quantite,
      notes: journal.notes || '',
      hrsDebut: journal.hrsDebut || planifChantier?.hrsDebut || "08:00",
      hrsFin: journal.hrsFin || planifChantier?.hrsFin || "17:00",
      defaultEntrepriseId: journal.defaultEntrepriseId || 0,
      date: journal.date,
      activiteIDs: [],
      bases: journal.bases || [],
      liaisons: journal.liaisons || []
    };
  };

  const handlePlanifActivitesUpdate = (updatedActivites: JournalActivite[]) => {
    try {
      console.log("Mise à jour des activités dans Form.tsx:", updatedActivites);
      console.log("Détail des activités à mettre à jour:");
      updatedActivites.forEach((act, index) => {
        console.log(`Activité ${index + 1}: ID=${act.id}, activiteID=${act.activiteID}, isComplete=${act.isComplete}`);
      });
      
      const convertedActivites = updatedActivites.map(journal => {
        const converted = convertToPlanifActivites(journal);
        console.log(`Conversion: ID=${journal.id}, isComplete avant=${journal.isComplete}, isComplete après=${converted.isComplete}`);
        return converted;
      });
      
      console.log("Activités converties:", convertedActivites);
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
            
      return {
        sousTraitantID: st.id,
        activiteID: st.activiteID,
        idUnite: st.idUnite || 1, // Utiliser 1 comme valeur par défaut si idUnite est null
        quantite: st.quantite,
        nomSousTraitant: st.nom,
        nomActivite: activite?.nom || '',
        descriptionUnite: unite?.description || ''
      };
    });
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault(); // Empêcher la soumission par défaut du formulaire
    e.stopPropagation(); // Arrêter la propagation de l'événement
    
    // Vérifier si la signature a été complétée
    if (!signatureData) {
      alert("Veuillez compléter la signature avant de soumettre le formulaire.");
      return;
    }
    
    setIsSubmitting(true);
    setSubmitSuccess(null);
    setSubmitError(null);

    // Log des employés avant soumission
    console.log('Employés sélectionnés avant soumission:', journalUsers);
    console.log('Nombre d\'employés:', journalUsers.length);
    journalUsers.forEach((user, index) => {
      console.log(`Employé ${index + 1}: ID=${user.id}, Nom=${user.nom}, Prénom=${user.prenom}`);
    });

    const journalChantier: JournalChantier = {
      id: 0,
      date: planifChantier?.date || new Date().toISOString().split('T')[0],
      hrsDebut: planifChantier?.hrsDebut || '',
      hrsFin: planifChantier?.hrsFin || '',
      planifId: planifChantier?.id || 0,
      meteoTypeId: journalMeteoId, // Utiliser le meteoId stocké dans le state
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
              console.log(`Sous-traitant à envoyer - ID: ${st.id}, Nom: ${st.nom}, ActivitéID: ${st.activiteID}, Quantité: ${st.quantite}, UnitéID: ${st.idUnite}`);
              return {
                journalActiviteId: 0, // Sera mis à jour après création de l'activité
                sousTraitantId: st.id, // Utiliser directement l'ID du sous-traitant
                quantite: st.quantite,
                uniteId: st.idUnite || 1 // Utiliser 1 comme valeur par défaut si idUnite est null
              };
            });

          // Log détaillé de l'activité
          console.log(`Activité à envoyer - ID: ${activite.activiteID}, Lieu: ${activite.lieuID}, Signalisation: ${activite.signalisationId}, QteLab: ${activite.qteLab}, SousTraitant: ${activite.defaultEntrepriseId}`);
          console.log(`Horaires - Début: ${activite.hrsDebut}, Fin: ${activite.hrsFin}`);
          console.log(`Bases: ${activite.bases?.length || 0}, Liaisons: ${activite.liaisons?.length || 0}`);

          return {
            id: 0,
            journalId: 0,
            activiteId: activite.activiteID as number,
            comment: activite.notes || '',
            // Ajouter les nouvelles propriétés requises par le DTO
            hrsDebut: activite.hrsDebut || planifChantier?.hrsDebut || "08:00",
            hrsFin: activite.hrsFin || planifChantier?.hrsFin || "17:00",
            lieuId: activite.lieuID || 0,
            signalisationId: activite.signalisationId || 0,
            qteLab: activite.qteLab, // Peut être null
            sousTraitantId: activite.defaultEntrepriseId, // Peut être null
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
        .filter(user => {
          // Vérifier que l'ID est valide et que l'utilisateur a un nom ou prénom
          const isValidUser = typeof user.id === 'number' && 
                             user.id > 0 && 
                             (user.nom?.trim() || user.prenom?.trim());
          
          console.log(`Filtrage BottinJournal - Utilisateur ${user.id}:`, { 
            id: user.id, 
            nom: user.nom, 
            prenom: user.prenom, 
            isValid: isValidUser 
          });
          
          return isValidUser;
        })
        .map(user => {
          // Vérifier si l'ID est un ID valide d'employé (généralement moins de 1000)
          // Les IDs temporaires générés par Date.now() sont beaucoup plus grands
          const isRealEmployeeId = user.id < 10000;
          
          console.log(`BottinJournal à envoyer - BottinID: ${user.id}, Nom: ${user.nom}, Prénom: ${user.prenom}, EstIDRéel: ${isRealEmployeeId}`);
          
          if (!isRealEmployeeId) {
            console.warn(`Attention: ID d'employé potentiellement invalide: ${user.id}`);
          }
          
          return {
            bottinId: user.id,
            journalId: 0
          };
        })
    };

    // Log complet de l'objet à envoyer
    console.log('Journal Chantier à envoyer (complet):', JSON.stringify(journalChantier, null, 2));
    
    // Log du nombre d'éléments dans chaque section
    console.log('Nombre d\'activités:', journalChantier.journalActivites?.length || 0);
    console.log('Nombre de matériaux:', journalChantier.materiauxJournals?.length || 0);
    console.log('Nombre d\'employés (bottinJournals):', journalChantier.bottinJournals?.length || 0);
    
    // Log détaillé des sous-traitants dans le journal
    console.log('Détail des sous-traitants par activité:');
    journalChantier.journalActivites?.forEach((activite, index) => {
      console.log(`Activité ${index + 1} (ID: ${activite.activiteId}):`);
      console.log(`  Horaires: ${activite.hrsDebut} - ${activite.hrsFin}`);
      console.log(`  Lieu: ${activite.lieuId}, Signalisation: ${activite.signalisationId}`);
      console.log(`  QteLab: ${activite.qteLab}, SousTraitantId: ${activite.sousTraitantId}`);
      activite.sousTraitantJournals?.forEach((st, stIndex) => {
        console.log(`  Sous-traitant ${stIndex + 1}: ID=${st.sousTraitantId}, Quantité=${st.quantite}, UnitéID=${st.uniteId}`);
      });
    });

    try {
      const response = await createJournalChantier(journalChantier);
      console.log('Réponse de la création du journal:', response);
      setSubmitSuccess(`Journal de chantier créé avec succès. ID: ${response.id}`);
      setJournalId(response.id);
      
      // Après avoir créé le journal, générer le PDF
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
    } catch (error) {
      console.error('Erreur lors de la création du journal:', error);
      setSubmitError(`Erreur lors de la création du journal: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePDFGeneration = async (e?: React.MouseEvent) => {
    // Si l'événement existe, empêcher le comportement par défaut
    if (e) {
      e.preventDefault();
      e.stopPropagation(); // Arrêter la propagation de l'événement
    }
    
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

    // Afficher le PDF sans soumettre le formulaire
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
          userStats={journalUserStats}
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
      signalisation: planifChantier.signalisation,
      signalisationId: planifChantier.signalisationId || 0,
      note: planifChantier.note || '',
      lieu: planifChantier.lieu,
      projet: planifChantier.projet,
      defaultEntreprise: planifChantier.defaultEntreprise
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
            journalPlanifId={journalId || Number(idPlanif)}
            signalisations={signalisations || []}
          />
        }>
          {({ blob, url, loading }) => {
            if (loading) return <div>Chargement du document...</div>;
            if (!url || !blob) return <div>Erreur lors de la génération du PDF</div>;
            
            // Utiliser l'ID du journal dans le nom du fichier si disponible
            const fileName = `${formatDateForFileName(journalDate)}_${selectedProject?.NumeroProjet || "NOPROJ"}_${journalId ? journalId.toString().padStart(7, "0") : idPlanif?.padStart(7, "0")}.pdf`;

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
                
                // Rediriger vers la page des rapports
                window.location.href = '/rapport';
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
                      {isSubmitting ? 'Sauvegarde en cours...' : 'Sauvegarder dans le répertoire de projet'}
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

  const formatPlanifToJournal = (planif: any): JournalActivite => {
    return {
      id: planif.id || planif.ID || 0,
      activiteID: planif.activiteID || planif.activiteId || 0,
      lieuID: planif.lieuID || planif.lieuId || 0,
      quantite: planif.quantite || 0,
      notes: planif.notes || planif.note || '',
      date: planif.date || planif.Date || new Date().toISOString().split('T')[0],
      hrsDebut: planif.hrsDebut || planif.debut || planifChantier?.hrsDebut || "08:00",
      hrsFin: planif.hrsFin || planif.fin || planifChantier?.hrsFin || "17:00",
      defaultEntrepriseId: planif.defaultEntrepriseId || planif.sousTraitantId || planifChantier?.defaultEntrepriseId || 0,
      signalisation: planif.signalisation || 0,
      signalisationId: planif.signalisationId || 0,
      bases: planif.bases || [],
      liaisons: planif.liaisons || [],
      planifID: planif.planifID || planif.PlanifID || planifChantier?.id || 0,
      qteLab: planif.qteLab || null,
      isComplete: planif.isComplete || false,
    };
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-4">
      {!showPDF ? (
        <div className="w-full max-w-4xl bg-white rounded shadow-md p-6 space-y-6">
          <div className="mb-8 text-left">
            <h1 className="text-3xl font-bold text-blue-800 mb-2">Journal de Chantier</h1>
            <p className="text-gray-500 text-lg">Saisie des activités quotidiennes à partir d'une planification de chantier</p>
            <div className="h-1 w-32 bg-blue-600 mt-2 rounded-full"></div>
          </div>
          
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
                  meteoId={journalMeteoId}
                  setMeteoId={setJournalMeteoId}
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
                  userStats={journalUserStats}
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
                <>
                  {console.log("Données envoyées à SousTraitantSection:", {
                    planifActivites: planifActivites,
                    journalSousTraitants: journalSousTraitants
                  })}
                  <SousTraitantSection
                    sousTraitants={journalSousTraitants}
                    setSousTraitants={setJournalSousTraitants}
                    planifActivites={planifActivites}
                  />
                </>
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
                    // Simplement stocker les données de signature sans déclencher d'autres actions
                    console.log("Signature reçue, stockage des données sans soumission");
                    setSignatureData(data);
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
              onClick={(e) => handleSubmit(e)}
              className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center ${isSubmitting || !signatureData ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isSubmitting || !signatureData}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Soumission en cours...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
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
