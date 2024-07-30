export interface User {
    id: number;
    nom: string;
    fonction: string;
    equipement: string;
}

export interface Activite {
    id: number;
    nom: string;
    lieu: string;
    localisation: string;
    quantite: number;
    notes: string;
}

export interface Materiau {
    id: number;
    nom: string;
    quantite: number;
}

export interface ProjectInfo {
    type: string;
    date: Date;
    arrivee: string;
    depart: string;
    weather: string;
}

export const initialActivite: Activite = {
    id: 1,
    nom: "",
    lieu: "",
    localisation: "",
    quantite: 0,
    notes: "",
};

export const initialMateriau: Materiau = {
    id: 1,
    nom: "",
    quantite: 0,
};

export interface Journal {
    id: number;
    projetInfo: ProjectInfo;
    entreprise: string;
    localisation: string;
    axe: string;
    plageHoraire: string;
    sign: string;
    notes: string;
    activites: Activite[];
}

export const initialJournal: Journal = {
    id: 1,
    projetInfo: {
        type: '',
        date: new Date(),
        arrivee: '',
        depart: '',
        weather: '',
    },
    entreprise: '',
    localisation: '',
    axe: '',
    plageHoraire: '',
    sign: '',
    notes: '',
    activites: [initialActivite],
};
