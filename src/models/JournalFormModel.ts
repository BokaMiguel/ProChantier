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

//Interface obsolète, à supprimer ultérieurement
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
  labQuantity: number | null;
  date: string;
  activiteIDs: number[];
  quantite: number;
  nomActivite?: string;
  activitesDetails?: Array<{
    activiteId: number;
    hrsDebut?: string;
    hrsFin?: string;
    isComplete?: boolean;
  }>;
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
  hrsDebut: string;
  hrsFin: string;
  defaultEntrepriseId: number;
  signalisationId: number;
  note: string;
  isLab: boolean;
  labQuantity: number | null;
  date: string;
  activiteIDs: number[];
  nomActivite?: string;
  activitesDetails?: Array<{
    activiteId: number;
    hrsDebut?: string;
    hrsFin?: string;
    isComplete?: boolean;
  }>;
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
  baseAName?: string;
  baseBName?: string;
}

// Types pour les matériaux et sous-traitants
export interface Materiau {
  id: number;
  nom: string;
  quantite?: number;
}

export interface SousTraitantFormData {
  id: number;
  nom: string;
  quantite: number;
  activiteID: number | null;
  idUnite: number | null;
}

export interface SousTraitant {
  id: number;
  nom: string;
}

export interface JournalSousTraitant {
  journalID?: number;
  sousTraitantID: number;
  activiteID: number | null;
  idUnite: number | null;
  quantite: number;
  // Propriétés pour l'affichage
  nomSousTraitant?: string;
  nomActivite?: string;
  descriptionUnite?: string;
}

// Types pour les unités
export interface Unite {
  idUnite: number;
  description: string;
  descriptionCourt: string;
}

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
  labQuantity?: number;
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
  date: string;
  lieuID: number;
  projetID: number;
  hrsDebut: string;
  hrsFin: string;
  defaultEntrepriseId: number;
  isLab: boolean;
  signalisationId: number;
  note: string;
  activites?: TabPlanifActivites[];
}

export const initialPlanifChantier: TabPlanifChantier = {
  id: 0,
  date: new Date().toISOString().split('T')[0],
  lieuID: 0,
  projetID: 0,
  hrsDebut: "",
  hrsFin: "",
  defaultEntrepriseId: 0,
  isLab: false,
  signalisationId: 0,
  note: "",
  activites: []
};

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
  notes: string;
  date: string;
  hrsDebut: string;
  hrsFin: string;
  defaultEntrepriseId: number | null;
  signalisationId: number | null;
  bases: Localisation[];
  liaisons: LocalisationDistance[];
  planifID?: number;
  signalisation?: number;
  qteLab?: number | null;
  isComplete?: boolean;
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
  projetInfo: any;
  employes: any;
  date: Date;
  arrivee: string;
  depart: string;
  meteo: string;
  temperature: number;
  conditions: string[];
  planifChantier: TabPlanifChantier;
  planifActivites: JournalActivite[];
  journalMateriaux: any[];
  journalSousTraitants: JournalSousTraitant[];
  userStats: UserStat[];
  totals: { act: number[]; ts: number; td: number };
  notes: string;
  signalisations: any[];
}

export const initialJournal: Journal = {
  date: new Date(),
  arrivee: "",
  depart: "",
  meteo: "",
  temperature: 0,
  conditions: [],
  planifChantier: initialPlanifChantier,
  planifActivites: [],
  journalMateriaux: [],
  journalSousTraitants: [],
  userStats: [],
  totals: { act: [], ts: 0, td: 0 },
  notes: "",
  signalisations: [],
  projetInfo: undefined,
  employes: undefined
};

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
  meteoTypeId?: number;
  statutId: number;
  projetId: number;
  typeId?: number;
  plageHoraire?: string;
  notes: string;
  equipeJournals?: EquipeJournal[];
  materiauxJournals?: MateriauxJournal[];
  journalActivites?: JournalActivites[];
  bottinJournals?: BottinJournal[];
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

export interface JournalActivites {
  id: number;
  journalId: number;
  activiteId: number;
  comment?: string;
  hrsDebut: string;
  hrsFin: string;
  lieuId: number;
  signalisationId: number;
  qteLab?: number | null;
  sousTraitantId?: number | null;
  localisationJournals?: LocalisationJournal[];
  localisationDistanceJournals?: LocalisationDistanceJournal[];
  sousTraitantJournals?: SousTraitantJournal[];
}

export interface SousTraitantJournal {
  journalActiviteId: number;
  sousTraitantId: number;
  quantite: number;
  uniteId: number;
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

export interface BottinJournal {
  bottinId: number;
  journalId: number;
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

// Nouvelles interfaces pour la gestion des équipes
export interface TabEquipeChantier {
  id: number;
  nom: string;
  projetId: number;
  employes?: {
    bottinID: number;
    nom: string;
    prenom: string;
    fonction?: {
      id: number | null;
      nom: string;
    } | null;
    equipement?: {
      id: number | null;
      nom: string;
    } | null;
  }[];
}

export interface TabBottinsEquipeChantier {
  EquipeID: number;
  BottinID: number;
  Nom: string;
  Prenom: string;
}

export interface TabBottin {
  ID: number;
  Nom: string;
  Prenom: string;
}

// Valeurs initiales
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
  labQuantity: null,
  date: "",
  activiteIDs: [],
  quantite: 0,
  nomActivite: "",
  activitesDetails: []
};

export const initialMateriau: Materiau = {
  id: 1,
  nom: "",
  quantite: 0,
};

export const initialSousTraitant: SousTraitant = {
  id: 1,
  nom: "",
};

// Types pour les planifications
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

export interface TabLocalisationActivites {
  activiteId: number; // FK vers Activite
  locDistanceId: number; // FK vers LocalisationDistance
  locId: number; // FK vers Localisation
}

export interface TabEquipeJournal {
  journalId: number; // FK vers Journal
  equipeId: number; // FK vers TabEquipes
}

// Nouveaux modèles pour la planification
export interface Planif {
  ID: number;
  ProjetID: number;
  HrsDebut: string;
  HrsFin: string;
  DefaultEntrepriseId: number;
  Note: string;
  Date: string;
  PlanifActivites: PlanifActivite[];
}

export interface PlanifActivite {
  ID: number;
  PlanifID: number;
  debut: string;
  fin: string;
  signalisation: number;
  lieuId: number;
  qteLab?: number | null;
  activiteId: number;
  isComplete?: boolean;
  sousTraitantId?: number; // Champ ajouté pour le sous-traitant spécifique à l'activité
}

// Interface de transition pour assurer la compatibilité entre les deux modèles
export interface PlanifActiviteJournal extends PlanifActivite {
  // Propriétés spécifiques au journal
  id?: number; // Pour compatibilité avec l'ancien format
  activiteID?: number | null; // Pour compatibilité avec l'ancien format
  lieuID?: number | null; // Pour compatibilité avec l'ancien format
  planifID?: number; // Pour compatibilité avec l'ancien format
  quantite: number;
  notes: string;
  bases?: Localisation[];
  liaisons?: LocalisationDistance[];
  activiteNom?: string;
  lieuNom?: string;
  
  // Propriétés supplémentaires de l'ancienne interface PlanifActivites
  hrsDebut?: string;
  hrsFin?: string;
  defaultEntrepriseId?: number;
  signalisationId?: number;
  note?: string;
  isLab?: boolean;
  labQuantity?: number | null;
  date?: string;
  activiteIDs?: number[];
  nomActivite?: string;
  activitesDetails?: Array<{
    activiteId: number;
    hrsDebut?: string;
    hrsFin?: string;
    isComplete?: boolean;
  }>;
}

// Constante pour initialiser une nouvelle activité de journal
export const initialPlanifActiviteJournal: PlanifActiviteJournal = {
  ID: 0,
  PlanifID: 0,
  debut: "",
  fin: "",
  signalisation: 0,
  lieuId: 0,
  qteLab: null,
  activiteId: 0,
  isComplete: false,
  sousTraitantId: undefined,
  quantite: 0,
  notes: "",
  id: 0,
  activiteID: null,
  lieuID: null,
  planifID: 0
};

export const initialPlanifActivite: PlanifActivite = {
  ID: 0,
  PlanifID: 0,
  debut: "",
  fin: "",
  signalisation: 0,
  lieuId: 0,
  qteLab: null,
  activiteId: 0,
  isComplete: false,
  sousTraitantId: undefined
};

export const initialPlanif: Planif = {
  ID: 0,
  ProjetID: 0,
  HrsDebut: "",
  HrsFin: "",
  DefaultEntrepriseId: 0,
  Note: "",
  Date: new Date().toISOString().split('T')[0],
  PlanifActivites: [],
};