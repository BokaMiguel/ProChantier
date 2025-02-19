// Types de base
export interface Employe {
  id: number;
  nom: string;
  prenom: string;
  fonction: Fonction | null;
  equipement: Equipement | null;
}

export interface Fonction {
  id: number | null;
  nom: string;
}

export interface Equipement {
  id: number | null;
  nom: string;
}

// Types pour les statistiques
export interface UserStat {
  id: number;
  nom: string;
  act: number[];
  ts: number;
  td: number;
}

export interface JournalUserStats {
  userStats: UserStat[];
  totals: {
    act: number[];
    ts: number;
    td: number;
  };
}

// Types pour les activités et localisations
export interface Activite {
  id: number;
  nom: string;
  projetId: number;
  type?: "liaison" | "normal";
}

export interface Lieu {
  id: number;
  nom: string;
  projetId: number;
}

export interface ActivitePlanif {
  id: number;
  projetId: number;
  lieuID: number;
  hrsDebut: string;
  hrsFin: string;
  defaultEntrepriseId: number;
  signalisationId: number;
  note: string;
  isLab: boolean;
  date: string;
  activiteIDs: number[];
  quantite: number;
  nomActivite?: string;
}

export interface PlanifActivites {
  id: number;
  planifID: number;
  activiteID: number | null;
  lieuID?: number | null;
  quantite: number;
  notes: string;
  bases?: Localisation[];
  liaisons?: LocalisationDistance[];
  activiteNom?: string;
  lieuNom?: string;
}

// Types pour la localisation
export interface Localisation {
  id: number;
  base: string;
  lieuId: number;
}

export interface LocalisationDistance {
  id: number;
  baseA: number;
  baseB: number;
  distanceInMeters: number;
}

// Types pour les matériaux et sous-traitants
export interface Materiau {
  id: number;
  nom: string;
  quantite?: number;
}

export interface SousTraitant {
  id: number;
  nom: string;
  quantite: number;
  activiteId?: number | null;
  uniteId?: number | null;
}

// Types pour les unités
export interface Unite {
  id: number;
  nom: string;
  symbole: string;
}

// Mock des unités (à remplacer par l'appel API)
export const unites: Unite[] = [
  { id: 1, nom: "Mètre", symbole: "m" },
  { id: 2, nom: "Mètre carré", symbole: "m²" },
  { id: 3, nom: "Mètre cube", symbole: "m³" },
  { id: 4, nom: "Kilogramme", symbole: "kg" },
  { id: 5, nom: "Unité", symbole: "u" },
  { id: 6, nom: "Heure", symbole: "h" }
];

// Types pour la météo et le statut
export interface Meteo {
  id: number;
  name: string;
}

export interface Statut {
  id: number;
  name: string;
}

export const meteo: Meteo[] = [
  { id: 1, name: 'Soleil' },
  { id: 2, name: 'Nuage' },
  { id: 3, name: 'Pluie' },
  { id: 4, name: 'Neige' },
  { id: 5, name: 'Chaleur' }
];

export const statuts: Statut[] = [
  { id: 1, name: 'En attente' },
  { id: 2, name: 'En cours' },
  { id: 3, name: 'Terminé' }
];

export const initialMeteo: Meteo = { id: 1, name: "Soleil" };
export const initialStatut: Statut = { id: 2, name: 'En cours' };

// Types pour les planifications
export interface PlanifChantier {
  id: number;
  date: string;
  hrsDebut: string;
  hrsFin: string;
  lieuID: number;
  projetID: number;
  defaultEntrepriseId: number;
  isLab: boolean;
  signalisationId: number;
  note?: string;
  quantite?: number;
  lieu?: {
    id: number;
    nom: string;
  };
  projet?: {
    id: number;
    nomProjet: string;
  };
  defaultEntreprise?: {
    id: number;
    nom: string;
  };
  signalisation?: {
    id: number;
    nom: string;
  };
}

export interface TabPlanifChantier {
  id: number;
  lieuID: number;
  projetID: number;
  hrsDebut: string;
  hrsFin: string;
  defaultEntrepriseId: number;
  isLab: boolean;
  signalisationId: number;
  note: string;
  date: string;
  activites?: TabPlanifActivites[];
}

export interface TabPlanifActivites {
  notes?: string;
  quantite?: number;
  id: number;
  planifID: number;
  activiteID: number | null;
}

export interface JournalActivite {
  id: number;
  activiteID: number | null;
  lieuID: number | null;
  quantite: number;
  notes?: string;
  date: string;
  hrsDebut: string;
  hrsFin: string;
  defaultEntrepriseId: number | null;
  signalisationId: number | null;
  bases: Localisation[];
  liaisons: LocalisationDistance[];
}

// Types pour le journal
export interface ProjectInfo {
  type: number;
  nomProjet: string;
  date: Date;
  arrivee: string;
  depart: string;
  weather: Meteo;
}

export interface Journal {
  id: number;
  projetInfo: ProjectInfo;
  entreprise: string;
  localisation: string;
  plageHoraire: string;
  notes: string;
  planifChantier?: PlanifChantier;
  planifActivites?: PlanifActivites[];
  employes: Employe[];
  materiaux: Materiau[];
  sousTraitants: SousTraitant[];
  userStats?: UserStat[];
  statut: Statut;
  signatureData?: SignatureData;
}

export interface SignatureData {
  signature: string;
  signataire: string;
  date: Date;
}

export interface JournalFormData {
  id: number;
  projetInfo: ProjectInfo;
  entreprise: string;
  localisation: string;
  plageHoraire: string;
  notes: string;
  activites: ActivitePlanif[];
  employes: Employe[];
  materiaux: Materiau[];
  sousTraitants: SousTraitant[];
  userStats?: UserStat[];
  statut: Statut;
  signatureData?: SignatureData;
}

export interface PDFData {
  journalDate: string;
  journalArrivee: string;
  journalDepart: string;
  journalWeather: string;
  journalUsers: Employe[];
  journalActivitesState: ActivitePlanif[];
  journalMateriaux: Materiau[];
  journalSousTraitants: SousTraitant[];
  userStats: UserStat[];
  notes: string;
  projetId?: string;
  signatureData?: SignatureData | null;
}

export type ExpandedSections = {
  activites: boolean;
  materiaux: boolean;
  sousTraitants: boolean;
  employes: boolean;
};

export type SectionKey = 
  | "materiaux"
  | "sousTraitants"
  | "infoProjet"
  | "infoEmployes"
  | "grilleActivites"
  | "notes"
  | "signature";

export type Sections = {
  [K in SectionKey]: {
    open: boolean;
    visible: boolean;
  };
};

// Nouvelles interfaces pour le journal de chantier
export interface JournalChantier {
  id: number;
  date: string;
  hrsDebut: string;
  hrsFin: string;
  planifId: number;
  meteoId?: number;
  statutId: number;
  projetId: number;
  notes: string;
  equipeJournals?: EquipeJournal[];
  materiauxJournals?: MateriauxJournal[];
  sousTraitantJournals?: SousTraitantJournal[];
  journalActivites?: JournalActivites[];
}

export interface MateriauxJournal {
  journalId: number;
  materielId: number;
  quantite: number;
}

export interface StatutJournal {
  id: number;
  nom: string;
}

export interface MeteoJournal {
  id: number;
  date: string;
  type: string;
  averse?: string;
  journalId: number;
}

export interface SousTraitantJournal {
  journalId: number;
  sousTraitantId: number;
  quantite: number;
}

export interface JournalActivites {
  id: number;
  journalId: number;
  activiteId: number;
  comment?: string;
}

export interface LocalisationJournal {
  id: number;
  journalActiviteId: number;
  localisationId: number;
}

export interface LocalisationDistanceJournal {
  id: number;
  journalActiviteId: number;
  localisationDistanceId: number;
}

export interface EquipeJournal {
  journalId: number;
  equipeId: number;
}

export interface EquipeChantier {
  id: number;
  nom: string;
  projetId: number;
}

// Valeurs initiales
export const initialPlanifChantier: PlanifChantier = {
  id: 0,
  date: new Date().toISOString().split('T')[0],
  hrsDebut: "",
  hrsFin: "",
  lieuID: 0,
  projetID: 0,
  defaultEntrepriseId: 0,
  isLab: false,
  signalisationId: 0,
  note: "",
  quantite: 0
};

export const initialActivite: ActivitePlanif = {
  id: 1,
  projetId: 0,
  lieuID: 0,
  hrsDebut: "",
  hrsFin: "",
  defaultEntrepriseId: 0,
  signalisationId: 0,
  note: "",
  isLab: false,
  date: "",
  activiteIDs: [],
  quantite: 0,
  nomActivite: "",
};

export const initialMateriau: Materiau = {
  id: 1,
  nom: "",
  quantite: 0,
};

export const initialSousTraitant: SousTraitant = {
  id: 1,
  nom: "",
  quantite: 0,
  activiteId: null,
  uniteId: null,
};

export const initialJournal: Journal = {
  id: 1,
  projetInfo: {
    type: 1,
    date: new Date(),
    arrivee: '',
    depart: '',
    weather: initialMeteo,
    nomProjet: ""
  },
  entreprise: '',
  localisation: '',
  plageHoraire: '',
  notes: '',
  planifChantier: initialPlanifChantier,
  planifActivites: [],
  employes: [],
  materiaux: [initialMateriau],
  sousTraitants: [initialSousTraitant],
  userStats: [],
  statut: initialStatut,
  signatureData: undefined
};

export interface SignalisationProjet {
  id: number;
  idProjet: number;
  nom: string;
}

export interface TabEquipes {
  id: number;
  nomEquipe: string;
  projetId: number;
}

export interface TabBottins {
  id: number;
  nom: string;
}

export interface TabBottinsEquipe {
  idEquipe: number;
  idBottins: number;
}

// Nouveau modèle : TabMateriauxJournal
export interface TabMateriauxJournal {
  journalId: number; // FK vers Journal
  materialId: number; // FK vers Materiau
  quantite: number;
}

// Nouveau modèle : TabSousTraitantJournal
export interface TabSousTraitantJournal {
  journalId: number; // FK vers Journal
  sousTraitantId: number; // FK vers SousTraitant
  quantite: number;
}

// Nouveau modèle : TabTypeProjet
export interface TabTypeProjet {
  id: number;
  description: string;
}

// Nouveau modèle : TabLocalisationActivites
export interface TabLocalisationActivites {
  activiteId: number; // FK vers Activite
  locDistanceId: number; // FK vers LocalisationDistance
  locId: number; // FK vers Localisation
}

// Nouveau modèle : TabEquipeJournal
export interface TabEquipeJournal {
  journalId: number; // FK vers Journal
  equipeId: number; // FK vers TabEquipes
}