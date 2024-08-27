export interface Employe {
  id: number;
  nom: string;
  prenom: string;
  fonction: Fonction;
  equipement: Equipement;
}

export interface Fonction {
  id: number | null;
  nom: string;
}

export interface Equipement {
  id: number | null;
  nom: string;
}

export interface Lieu {
  id: number;
  nom: string;
  projetId: number;
}

export interface Activite {
  id: number;
  nom: string;
  projetId: number;
}

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

export interface ProjectInfo {
  type: number;
  nomProjet: string;
  date: Date;
  arrivee: string;
  depart: string;
  weather: Meteo;
}

export interface Statut {
  id: number;
  name: string;
}

export const statuts: Statut[] = [
  { id: 1, name: 'En attente' },
  { id: 2, name: 'En cours' },
  { id: 3, name: 'Terminé' }
];

export interface Meteo {
  id: number;
  name: string;
}

export type ExpandedSections = {
  activites: boolean;
  materiaux: boolean;
  sousTraitants: boolean;
  employes: boolean;
};

export const meteo: Meteo[] = [
  { id: 1, name: 'Soleil' },
  { id: 2, name: 'Nuage' },
  { id: 3, name: 'Pluie' },
  { id: 4, name: 'Neige' },
  { id: 5, name: 'Chaleur' }
];

export const initialMeteo: Meteo = {
  id: 1,
  name: "Soleil",
};

export const initialStatut: Statut = {
  id: 2,
  name: 'En cours'
};

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
  statut: Statut;
}

export const initialActivite: ActivitePlanif = {
  id: 1, 
  activiteID: 0,
  quantite: 0,
  hrsDebut: "",
  hrsFin: "",
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
  statut: initialStatut
};

export interface SignalisationProjet {
  id: number;
  idProjet: number;
  nom: string;
}

export interface ActivitePlanif {
  id: number;
  activiteID: number;
  lieuID?: number;
  hrsDebut: string;
  hrsFin: string;
  defaultEntrepriseId?: number;
  isLab?: boolean;
  signalisationId?: number;
  note?: string;
  quantite?: number;
}

export interface Localisation {
  id: number;
  base: string;
  lieuId: number;
}

export interface LocalisationDistance {
  id: number;
  baseA: number;
  baseB: number;
  distance: number;
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
