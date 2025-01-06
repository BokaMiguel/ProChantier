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
}

export interface Lieu {
  id: number;
  nom: string;
  projetId: number;
}

export interface ActivitePlanif {
  id: number;
  activiteID: number | null;
  lieuID: number | null;
  quantite: number;
  note: string;
  date: string;
  hrsDebut: string;
  hrsFin: string;
  defaultEntrepriseId: number | null;
  signalisationId: number | null;
  isLab?: boolean;
  bases?: Localisation[];
  liaisons?: LocalisationDistance[];
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
  quantite?: number;
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
  activites: ActivitePlanif[];
  employes: Employe[];
  materiaux: Materiau[];
  sousTraitants: SousTraitant[];
  userStats?: UserStat[];
  statut: Statut;
}

export type ExpandedSections = {
  activites: boolean;
  materiaux: boolean;
  sousTraitants: boolean;
  employes: boolean;
};

// Valeurs initiales
export const initialActivite: ActivitePlanif = {
  id: 1,
  activiteID: null,
  lieuID: null,
  quantite: 0,
  note: "",
  date: new Date().toISOString().split('T')[0],
  hrsDebut: "",
  hrsFin: "",
  defaultEntrepriseId: null,
  signalisationId: null,
  isLab: false,
  bases: [],
  liaisons: []
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
  activites: [initialActivite],
  employes: [],
  materiaux: [initialMateriau],
  sousTraitants: [initialSousTraitant],
  userStats: [],
  statut: initialStatut
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