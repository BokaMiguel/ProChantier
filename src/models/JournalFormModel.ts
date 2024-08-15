// models/JournalFormModel.ts

export interface Employe {
  id: number;
  nom: string;
  prenom: string;
  fonction: {
    id: number | null;
    nom: string;
  };
  equipement: {
    id: number | null;
    nom: string;
  };
}

export interface Activite {
  id: number;
  nom: string;
  entreprise?: string;
  localisation?: string;
  startHour: string;
  endHour: string;
  signalisation?: string;
  notes?: string;
  isLab?: boolean;
  lieu?: string[];
  quantite?: number;
  distanceMax?: number;
  isComplete: boolean;
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
  type: "Bon de Travail" | "Journal de Chantier";
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
  activites: Activite[];
  employes: Employe[];
  materiaux: Materiau[];
  sousTraitants: SousTraitant[];
  statut: Statut;
}

export const initialActivite: Activite = {
  id: 1,
  nom: "",
  lieu: [],
  localisation: "",
  quantite: 0,
  notes: "",
  startHour: "",
  endHour: "",
  isComplete: false
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
    type: 'Bon de Travail',
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

export interface Materiau {
  id: number;
  nom: string;
}

export interface SousTraitant {
  id: number;
  nom: string;
}

export interface Fonction {
  id: number;
  nom: string;
}

export interface Equipement {
  id: number;
  nom: string;
}

export interface Localisation {
  id: number;
  base: string;
}