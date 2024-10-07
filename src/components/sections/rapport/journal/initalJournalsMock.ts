import { Journal } from "../../../../models/JournalFormModel";

export const initialJournals: Journal[] = [
  {
    id: 1,
    projetInfo: {
      type: 1,
      date: new Date("2024-05-01"),
      arrivee: "08:00",
      depart: "16:00",
      weather: { id: 3, name: 'Pluie' },
      nomProjet: "2024-1232"
    },
    activites: [
      {
        id: 11,
        activiteID: 0,
        hrsDebut: "07:00",
        hrsFin: "11:00",
        defaultEntrepriseId: 0,
        note: "Pose de carrelage",
        lieuID: null,
        quantite: 0,
        date: "",
        signalisationId: null
      },
    ],
    materiaux: [
      { id: 1, nom: "Ciment", quantite: 100 },
      { id: 2, nom: "Gravier", quantite: 200 },
    ],
    sousTraitants: [{ id: 1, nom: "Sous-traitant A", quantite: 5 }],
    employes: [
      {
        id: 1,
        nom: "Dupont",
        prenom: "Jean",
        fonction: {
          id: null,
          nom: ""
        },
        equipement: {
          id: null,
          nom: ""
        }
      },
    ],
    entreprise: "Entreprise A",
    localisation: "Site A",
    plageHoraire: "08:00 - 16:00",
    notes: "Jour de pluie, progression ralentie",
    statut: { id: 1, name: 'En attente' }
  },
  {
    id: 2,
    projetInfo: {
      type: 1,
      date: new Date("2024-06-15"),
      arrivee: "07:00",
      depart: "15:00",
      weather: { id: 2, name: 'Soleil' },
      nomProjet: "2024-1432"
    },
    activites: [
      {
        id: 11,
        activiteID: 0,
        hrsDebut: "07:00",
        hrsFin: "11:00",
        defaultEntrepriseId: 0,
        note: "Pose de carrelage",
        lieuID: null,
        quantite: 0,
        date: "",
        signalisationId: null
      },
    ],
    materiaux: [{ id: 3, nom: "Échafaudage", quantite: 50 }],
    sousTraitants: [{ id: 2, nom: "Sous-traitant B", quantite: 3 }],
    employes: [
      {
        id: 2,
        nom: "Martin",
        prenom: "Paul",
        fonction: {
          id: null,
          nom: ""
        },
        equipement: {
          id: null,
          nom: ""
        }
      },
    ],
    entreprise: "Entreprise C",
    localisation: "Site C",
    plageHoraire: "07:00 - 15:00",
    notes: "Beau temps, travail rapide",
    statut: { id: 2, name: 'En cours' }
  },
  {
    id: 3,
    projetInfo: {
      type: 1,
      date: new Date("2024-07-10"),
      arrivee: "06:00",
      depart: "14:00",
      weather: { id: 2, name: 'Nuage' },
      nomProjet: "2024-1567"
    },
    activites: [
      {
        id: 11,
        activiteID: 0,
        hrsDebut: "07:00",
        hrsFin: "11:00",
        defaultEntrepriseId: 0,
        note: "Pose de carrelage",
        lieuID: null,
        quantite: 0,
        date: "",
        signalisationId: null
      },
    ],
    materiaux: [{ id: 4, nom: "Tuyaux", quantite: 30 }],
    sousTraitants: [{ id: 3, nom: "Sous-traitant C", quantite: 4 }],
    employes: [
      {
        id: 3,
        nom: "Boka",
        prenom: "Miguel",
        fonction: {
          id: null,
          nom: ""
        },
        equipement: {
          id: null,
          nom: ""
        }
      },
    ],
    entreprise: "Entreprise D",
    localisation: "Site D",
    plageHoraire: "06:00 - 14:00",
    notes: "Temps nuageux, conditions idéales",
    statut: { id: 3, name: 'Terminé' }
  },
  {
    id: 4,
    projetInfo: {
      type: 1,   
      date: new Date("2024-08-01"),
      arrivee: "19:00",
      depart: "22:00",
      weather: { id: 5, name: 'Chaleur' },
      nomProjet: "2024-1789"
    },
    activites: [
      {
        id: 11,
        activiteID: 0,
        hrsDebut: "07:00",
        hrsFin: "11:00",
        defaultEntrepriseId: 0,
        note: "Pose de carrelage",
        lieuID: null,
        quantite: 0,
        date: "",
        signalisationId: null
      },
    ],
    materiaux: [{ id: 5, nom: "Laine de verre", quantite: 70 }],
    sousTraitants: [{ id: 4, nom: "Sous-traitant D", quantite: 6 }],
    employes: [
      {
        id: 4,
        nom: "Durand",
        prenom: "Alice",
        fonction: {
          id: null,
          nom: ""
        },
        equipement: {
          id: null,
          nom: ""
        }
      },
    ],
    entreprise: "Entreprise E",
    localisation: "Site E",
    plageHoraire: "09:00 - 17:00",
    notes: "Temps chaud, pauses régulières",
    statut: { id: 2, name: 'En cours' }
  },
  {
    id: 5,
    projetInfo: {
      type: 1,
      date: new Date("2024-09-15"),
      arrivee: "19:00",
      depart: "22:00",
      weather: { id: 1, name: 'Soleil' },
      nomProjet: "2024-1980"
    },
    activites: [
      {
        id: 11,
        activiteID: 0,
        hrsDebut: "07:00",
        hrsFin: "11:00",
        defaultEntrepriseId: 0,
        note: "Pose de carrelage",
        lieuID: null,
        quantite: 0,
        date: "",
        signalisationId: null
      },
    ],
    materiaux: [{ id: 6, nom: "Peinture", quantite: 40 }],
    sousTraitants: [{ id: 5, nom: "Sous-traitant E", quantite: 2 }],
    employes: [
      {
        id: 5,
        nom: "Blanc",
        prenom: "Bob",
        fonction: {
          id: null,
          nom: ""
        },
        equipement: {
          id: null,
          nom: ""
        }
      },
    ],
    entreprise: "Entreprise F",
    localisation: "Site F",
    plageHoraire: "08:00 - 16:00",
    notes: "Beau temps, travail sans interruptions",
    statut: { id: 3, name: 'Terminé' }
  },
  {
    id: 6,
    projetInfo: {
      type: 1,
      date: new Date("2024-10-20"),
      arrivee: "07:30",
      depart: "15:30",
      weather: { id: 4, name: 'Neige' },
      nomProjet: "2024-2001"
    },
    activites: [
      {
        id: 11,
        activiteID: 0,
        hrsDebut: "07:00",
        hrsFin: "11:00",
        defaultEntrepriseId: 0,
        note: "Pose de carrelage",
        lieuID: null,
        quantite: 0,
        date: "",
        signalisationId: null
      },
    ],
    materiaux: [{ id: 7, nom: "Bois", quantite: 60 }],
    sousTraitants: [{ id: 6, nom: "Sous-traitant F", quantite: 4 }],
    employes: [
      {
        id: 6,
        nom: "Noir",
        prenom: "Pierre",
        fonction: {
          id: null,
          nom: ""
        },
        equipement: {
          id: null,
          nom: ""
        }
      },
    ],
    entreprise: "Entreprise G",
    localisation: "Site G",
    plageHoraire: "07:30 - 15:30",
    notes: "Neige persistante, travail ralenti",
    statut: { id: 1, name: 'En attente' }
  },
  {
    id: 7,
    projetInfo: {
      type: 1,
      date: new Date("2024-11-05"),
      arrivee: "08:00",
      depart: "16:00",
      weather: { id: 2, name: 'Nuage' },
      nomProjet: "2024-2123"
    },
    activites: [
      {
        id: 11,
        activiteID: 0,
        hrsDebut: "07:00",
        hrsFin: "11:00",
        defaultEntrepriseId: 0,
        note: "Pose de carrelage",
        lieuID: null,
        quantite: 0,
        date: "",
        signalisationId: null
      },
    ],
    materiaux: [{ id: 8, nom: "Câbles", quantite: 100 }],
    sousTraitants: [{ id: 7, nom: "Sous-traitant G", quantite: 5 }],
    employes: [
      {
        id: 7,
        nom: "Vert",
        prenom: "Emilie",
        fonction: {
          id: null,
          nom: ""
        },
        equipement: {
          id: null,
          nom: ""
        }
      },
    ],
    entreprise: "Entreprise H",
    localisation: "Site H",
    plageHoraire: "08:00 - 16:00",
    notes: "Temps nuageux, travail efficace",
    statut: { id: 2, name: 'En cours' }
  },
  {
    id: 8,
    projetInfo: {
      type: 1,
      date: new Date("2024-12-10"),
      arrivee: "09:00",
      depart: "17:00",
      weather: { id: 1, name: 'Soleil' },
      nomProjet: "2024-2201"
    },
    activites: [
      {
        id: 11,
        activiteID: 0,
        hrsDebut: "07:00",
        hrsFin: "11:00",
        defaultEntrepriseId: 0,
        note: "Pose de carrelage",
        lieuID: null,
        quantite: 0,
        date: "",
        signalisationId: null
      },
    ],
    materiaux: [{ id: 9, nom: "Tuyaux", quantite: 80 }],
    sousTraitants: [{ id: 8, nom: "Sous-traitant H", quantite: 3 }],
    employes: [
      {
        id: 8,
        nom: "Jaune",
        prenom: "Isabelle",
        fonction: {
          id: null,
          nom: ""
        },
        equipement: {
          id: null,
          nom: ""
        }
      },
    ],
    entreprise: "Entreprise I",
    localisation: "Site I",
    plageHoraire: "09:00 - 17:00",
    notes: "Beau temps, travail sans interruptions",
    statut: { id: 3, name: 'Terminé' }
  },
  {
    id: 9,
    projetInfo: {
      type: 1,
      date: new Date("2024-01-25"),
      arrivee: "06:00",
      depart: "14:00",
      weather: { id: 2, name: 'Nuage' },
      nomProjet: "2024-2301"
    },
    activites: [
      {
        id: 11,
        activiteID: 0,
        hrsDebut: "07:00",
        hrsFin: "11:00",
        defaultEntrepriseId: 0,
        note: "Pose de carrelage",
        lieuID: null,
        quantite: 0,
        date: "",
        signalisationId: null
      },
    ],
    materiaux: [{ id: 10, nom: "Tuiles", quantite: 100 }],
    sousTraitants: [{ id: 9, nom: "Sous-traitant I", quantite: 4 }],
    employes: [
      {
        id: 9,
        nom: "Rouge",
        prenom: "Julien",
        fonction: {
          id: null,
          nom: ""
        },
        equipement: {
          id: null,
          nom: ""
        }
      },
    ],
    entreprise: "Entreprise J",
    localisation: "Site J",
    plageHoraire: "06:00 - 14:00",
    notes: "Temps nuageux, travail sans interruptions",
    statut: { id: 1, name: 'En attente' }
  },
  {
    id: 10,
    projetInfo: {
      type: 1,
      date: new Date("2024-02-15"),
      arrivee: "07:00",
      depart: "15:00",
      weather: { id: 5, name: 'Chaleur' },
      nomProjet: "2024-2401"
    },
    activites: [
      {
        id: 11,
        activiteID: 0,
        hrsDebut: "07:00",
        hrsFin: "11:00",
        defaultEntrepriseId: 0,
        note: "Pose de carrelage",
        lieuID: null,
        quantite: 0,
        date: "",
        signalisationId: null
      },
    ],
    materiaux: [{ id: 11, nom: "Carrelage", quantite: 200 }],
    sousTraitants: [{ id: 10, nom: "Sous-traitant J", quantite: 2 }],
    employes: [
      {
        id: 10,
        nom: "Blanc",
        prenom: "Marie",
        fonction: {
          id: null,
          nom: ""
        },
        equipement: {
          id: null,
          nom: ""
        }
      },
    ],
    entreprise: "Entreprise K",
    localisation: "Site K",
    plageHoraire: "07:00 - 15:00",
    notes: "Temps chaud, travail ralenti",
    statut: { id: 2, name: 'En cours' }
  }
];
