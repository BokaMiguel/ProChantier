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
};

export const initialMateriau: Materiau = {
    id: 1,
    nom: "",
    quantite: 0,
};
