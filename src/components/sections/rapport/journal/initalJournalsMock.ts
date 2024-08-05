import { Journal } from "../../../../models/JournalFormModel";

export const initialJournals: Journal[] = [
  {
    id: 1,
    projetInfo: {
      type: "Journal de Chantier",
      date: new Date("2024-05-01"),
      arrivee: "08:00",
      depart: "16:00",
      weather: { id: 3, name: 'Pluie' },
      nomProjet: "2024-1232"
    },
    activites: [
      {
          id: 1,
          nom: "Excavation",
          startHour: "08:00",
          endHour: "10:00",
          entreprise: "Entreprise A",
          localisation: "Site A",
          lieu: ["Lieu A"],
          quantite: 10,
          notes: "Préparation du terrain",
          isComplete: false
      },
      {
          id: 2,
          nom: "Fondations",
          startHour: "10:00",
          endHour: "12:00",
          entreprise: "Entreprise B",
          localisation: "Site B",
          lieu: ["Lieu B"],
          quantite: 20,
          notes: "Coulage du béton",
          isComplete: false
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
        fonction: "Ingénieur",
        equipement: "Casque",
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
      type: "Journal de Chantier",
      date: new Date("2024-06-15"),
      arrivee: "07:00",
      depart: "15:00",
      weather: { id: 2, name: 'Soleil' },
      nomProjet: "2024-1432"
    },
    activites: [
      {
          id: 3,
          nom: "Montage échafaudage",
          startHour: "07:00",
          endHour: "09:00",
          entreprise: "Entreprise C",
          localisation: "Site C",
          lieu: ["Lieu C"],
          quantite: 15,
          notes: "Assemblage complet",
          isComplete: false
      },
    ],
    materiaux: [{ id: 3, nom: "Échafaudage", quantite: 50 }],
    sousTraitants: [{ id: 2, nom: "Sous-traitant B", quantite: 3 }],
    employes: [
      {
        id: 2,
        nom: "Martin",
        prenom: "Paul",
        fonction: "Ouvrier",
        equipement: "Gants",
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
      type: "Journal de Chantier",
      date: new Date("2024-07-10"),
      arrivee: "06:00",
      depart: "14:00",
      weather: { id: 2, name: 'Nuage' },
      nomProjet: "2024-1567"
    },
    activites: [
      {
          id: 4,
          nom: "Pose de tuyaux",
          startHour: "06:00",
          endHour: "10:00",
          entreprise: "Entreprise D",
          localisation: "Site D",
          lieu: ["Lieu D"],
          quantite: 25,
          notes: "Installation réussie",
          isComplete: false
      },
    ],
    materiaux: [{ id: 4, nom: "Tuyaux", quantite: 30 }],
    sousTraitants: [{ id: 3, nom: "Sous-traitant C", quantite: 4 }],
    employes: [
      {
        id: 3,
        nom: "Boka",
        prenom: "Miguel",
        fonction: "Ouvrier",
        equipement: "Gants",
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
      type: "Bon de Travail",
      date: new Date("2024-08-01"),
      arrivee: "19:00",
      depart: "22:00",
      weather: { id: 5, name: 'Chaleur' },
      nomProjet: "2024-1789"
    },
    activites: [
      {
          id: 5,
          nom: "Isolation",
          startHour: "09:00",
          endHour: "13:00",
          entreprise: "Entreprise E",
          localisation: "Site E",
          lieu: ["Lieu E"],
          quantite: 30,
          notes: "Isolation thermique",
          isComplete: false
      },
    ],
    materiaux: [{ id: 5, nom: "Laine de verre", quantite: 70 }],
    sousTraitants: [{ id: 4, nom: "Sous-traitant D", quantite: 6 }],
    employes: [
      {
        id: 4,
        nom: "Durand",
        prenom: "Alice",
        fonction: "Technicien",
        equipement: "Casque",
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
      type: "Journal de Chantier",
      date: new Date("2024-09-15"),
      arrivee: "19:00",
      depart: "22:00",
      weather: { id: 1, name: 'Soleil' },
      nomProjet: "2024-1980"
    },
    activites: [
      {
          id: 6,
          nom: "Peinture",
          startHour: "08:00",
          endHour: "12:00",
          entreprise: "Entreprise F",
          localisation: "Site F",
          lieu: ["Lieu F"],
          quantite: 20,
          notes: "Application de deux couches",
          isComplete: false
      },
    ],
    materiaux: [{ id: 6, nom: "Peinture", quantite: 40 }],
    sousTraitants: [{ id: 5, nom: "Sous-traitant E", quantite: 2 }],
    employes: [
      {
        id: 5,
        nom: "Blanc",
        prenom: "Luc",
        fonction: "Peintre",
        equipement: "Casque",
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
      type: "Journal de Chantier",
      date: new Date("2024-10-20"),
      arrivee: "07:30",
      depart: "15:30",
      weather: { id: 4, name: 'Neige' },
      nomProjet: "2024-2001"
    },
    activites: [
      {
          id: 7,
          nom: "Charpente",
          startHour: "07:30",
          endHour: "11:30",
          entreprise: "Entreprise G",
          localisation: "Site G",
          lieu: ["Lieu G"],
          quantite: 35,
          notes: "Travail difficile à cause de la neige",
          isComplete: false
      },
    ],
    materiaux: [{ id: 7, nom: "Bois", quantite: 60 }],
    sousTraitants: [{ id: 6, nom: "Sous-traitant F", quantite: 4 }],
    employes: [
      {
        id: 6,
        nom: "Noir",
        prenom: "Pierre",
        fonction: "Charpentier",
        equipement: "Casque",
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
      type: "Journal de Chantier",
      date: new Date("2024-11-05"),
      arrivee: "08:00",
      depart: "16:00",
      weather: { id: 2, name: 'Nuage' },
      nomProjet: "2024-2123"
    },
    activites: [
      {
          id: 8,
          nom: "Installation électrique",
          startHour: "08:00",
          endHour: "12:00",
          entreprise: "Entreprise H",
          localisation: "Site H",
          lieu: ["Lieu H"],
          quantite: 25,
          notes: "Installation des câbles principaux",
          isComplete: false
      },
    ],
    materiaux: [{ id: 8, nom: "Câbles", quantite: 100 }],
    sousTraitants: [{ id: 7, nom: "Sous-traitant G", quantite: 5 }],
    employes: [
      {
        id: 7,
        nom: "Vert",
        prenom: "Emilie",
        fonction: "Électricien",
        equipement: "Gants",
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
      type: "Journal de Chantier",
      date: new Date("2024-12-10"),
      arrivee: "09:00",
      depart: "17:00",
      weather: { id: 1, name: 'Soleil' },
      nomProjet: "2024-2201"
    },
    activites: [
      {
          id: 9,
          nom: "Plomberie",
          startHour: "09:00",
          endHour: "13:00",
          entreprise: "Entreprise I",
          localisation: "Site I",
          lieu: ["Lieu I"],
          quantite: 30,
          notes: "Installation des conduites d'eau",
          isComplete: false
      },
    ],
    materiaux: [{ id: 9, nom: "Tuyaux", quantite: 80 }],
    sousTraitants: [{ id: 8, nom: "Sous-traitant H", quantite: 3 }],
    employes: [
      {
        id: 8,
        nom: "Jaune",
        prenom: "Isabelle",
        fonction: "Plombier",
        equipement: "Gants",
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
      type: "Journal de Chantier",
      date: new Date("2024-01-25"),
      arrivee: "06:00",
      depart: "14:00",
      weather: { id: 2, name: 'Nuage' },
      nomProjet: "2024-2301"
    },
    activites: [
      {
          id: 10,
          nom: "Toiture",
          startHour: "06:00",
          endHour: "10:00",
          entreprise: "Entreprise J",
          localisation: "Site J",
          lieu: ["Lieu J"],
          quantite: 20,
          notes: "Installation des tuiles",
          isComplete: false
      },
    ],
    materiaux: [{ id: 10, nom: "Tuiles", quantite: 100 }],
    sousTraitants: [{ id: 9, nom: "Sous-traitant I", quantite: 4 }],
    employes: [
      {
        id: 9,
        nom: "Rouge",
        prenom: "Julien",
        fonction: "Couvreur",
        equipement: "Casque",
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
      type: "Journal de Chantier",
      date: new Date("2024-02-15"),
      arrivee: "07:00",
      depart: "15:00",
      weather: { id: 5, name: 'Chaleur' },
      nomProjet: "2024-2401"
    },
    activites: [
      {
          id: 11,
          nom: "Revêtement de sol",
          startHour: "07:00",
          endHour: "11:00",
          entreprise: "Entreprise K",
          localisation: "Site K",
          lieu: ["Lieu K"],
          quantite: 25,
          notes: "Pose de carrelage",
          isComplete: false
      },
    ],
    materiaux: [{ id: 11, nom: "Carrelage", quantite: 200 }],
    sousTraitants: [{ id: 10, nom: "Sous-traitant J", quantite: 2 }],
    employes: [
      {
        id: 10,
        nom: "Blanc",
        prenom: "Marie",
        fonction: "Carreleur",
        equipement: "Gants",
      },
    ],
    entreprise: "Entreprise K",
    localisation: "Site K",
    plageHoraire: "07:00 - 15:00",
    notes: "Temps chaud, travail ralenti",
    statut: { id: 2, name: 'En cours' }
  }
];
