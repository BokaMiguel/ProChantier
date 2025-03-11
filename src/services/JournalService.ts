// src/services/JournalService.ts

import { Unite, TabEquipeChantier, TabBottinsEquipeChantier } from '../models/JournalFormModel';
import { userManager } from './AuthService';

export const getAuthorizedProjects = async (userId: string) => {
  try {
    // Récupérer l'utilisateur actuel et son token d'accès
    const user = await userManager.getUser();
    const accessToken = user?.access_token;
    
    if (!accessToken) {
      console.warn('No access token available for API request');
    }
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Ajouter le token d'authentification s'il est disponible
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    const response = await fetch(
      `${process.env.REACT_APP_BRUNEAU_API}/Horizon/projets/GetAuthorizedProjects/${userId}`,
      { 
        method: 'GET',
        headers
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const dataText = await response.text();
    if (!dataText || dataText.trim() === '') {
      console.log('No projects found for user:', userId);
      return [];
    }
    
    try {
      return JSON.parse(dataText);
    } catch (parseError) {
      console.error('Error parsing projects data:', parseError);
      console.log('Raw response:', dataText);
      return [];
    }
  } catch (error) {
    console.error('Error fetching authorized projects:', error);
    throw error;
  }
};

export const getEmployeeList = async (projectId: number) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/GetEmployeeList/${projectId}`,
    { method: "GET" }
  );
  return response.json();
};

export const getFonctionEmploye = async () => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/GetFonctionEmploye`,
    { method: "GET" }
  );
  return response.json();
};

export const getLieuProjet = async (projectId: number) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/GetLieuProjet/${projectId}`,
    { method: "GET" }
  );
  return response.json();
};

export const getActiviteProjet = async (projectId: number) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/GetActiviteProjet/${projectId}`,
    { method: "GET" }
  );
  return response.json();
};

export const createOrUpdateActivite = async (nom: string, projetID: number, id?: number) => {
  const response = await fetch(`${process.env.REACT_APP_BRUNEAU_API}/ProChantier/CreateOrUpdateActiviteProjet`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ Nom: nom, ProjetID: projetID, ID: id }),
  });
  if (!response.ok) {
    throw new Error("Failed to create or update activite");
  }
  const data = await response.json();
  return data.id; // Retourne l'ID de l'activite créée ou mise à jour
};

export const deleteActivite = async (activiteId: number) => {
  const response = await fetch(`${process.env.REACT_APP_BRUNEAU_API}/ProChantier/DeleteActiviteProjet/${activiteId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete activite");
  }
};

export const getEquipementsProjet = async (projectId: number) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/GetEquipementsProjet/${projectId}`,
    { method: "GET" }
  );
  return response.json();
};

export const getMateriauxOutillage = async () => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/GetMateriauxOutils`,
    { method: "GET" }
  );
  return response.json();
};

export const getBases = async (lieuId: number) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/GetBases/${lieuId}`,
    { method: "GET" }
  );
  return response.json();
};

export const createOrUpdateBase = async (Base: string, LieuID: number, Id?: number) => {
  console.log('Base', Base)
  console.log('LieuID', LieuID)
  const response = await fetch(`${process.env.REACT_APP_BRUNEAU_API}/ProChantier/CreateOrUpdateBase`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ Base, LieuID, Id }),
  });
  if (!response.ok) {
    throw new Error("Failed to create or update base");
  }
  const data = await response.json();
  return data.id; // Retourne l'ID de la base créée ou mise à jour
};

export const deleteBase = async (baseId: number) => {
  const response = await fetch(`${process.env.REACT_APP_BRUNEAU_API}/ProChantier/DeleteBase/${baseId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete base");
  }
};

// New methods for Lieu, Fonction, Equipement

export const createOrUpdateLieu = async (nom: string, ProjetID: number, id?: number) => {
  const response = await fetch(`${process.env.REACT_APP_BRUNEAU_API}/ProChantier/CreateOrUpdateLieuProjet`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nom, ProjetID, id }),
  });
  if (!response.ok) {
    throw new Error("Failed to create or update lieu");
  }
  const data = await response.json();
  return data.id; // Retourne l'ID du lieu créé ou mis à jour
};

export const deleteLieu = async (lieuId: number) => {
  const response = await fetch(`${process.env.REACT_APP_BRUNEAU_API}/ProChantier/DeleteLieuProjet/${lieuId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete lieu");
  }
};

export const createOrUpdateFonction = async (nom: string, id?: number) => {
  const response = await fetch(`${process.env.REACT_APP_BRUNEAU_API}/ProChantier/CreateOrUpdateFonctionEmploye`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nom, id }),
  });
  if (!response.ok) {
    throw new Error("Failed to create or update fonction");
  }
};

export const updateEmployeeDetails = async (
  employeeId: number,
  fonctionId: number | null,
  equipementId: number | null
) => {
  const response = await fetch(`${process.env.REACT_APP_BRUNEAU_API}/ProChantier/UpdateEmployeeDetails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      employeeId,
      fonctionId,
      equipementId,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update employee details");
  }
};


export const deleteFonction = async (fonctionId: number) => {
  const response = await fetch(`${process.env.REACT_APP_BRUNEAU_API}/ProChantier/DeleteFonctionEmploye/${fonctionId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete fonction");
  }
};

export const createOrUpdateEquipement = async (nom: string, projectId: number, id?: number) => {
  const response = await fetch(`${process.env.REACT_APP_BRUNEAU_API}/ProChantier/CreateOrUpdateEquipementsProjet`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nom, ProjetID: projectId, id }),
  });
  if (!response.ok) {
    throw new Error("Failed to create or update equipement");
  }
};

export const deleteEquipement = async (equipementId: number) => {
  const response = await fetch(`${process.env.REACT_APP_BRUNEAU_API}/ProChantier/DeleteEquipementsProjet/${equipementId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete equipement");
  }
};

export const getMateriauxOutils = async (id: number) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/GetMateriauxOutils/${id}`,
    { method: "GET" }
  );
  return response.json();
};

export const createOrUpdateMateriauxOutils = async (nom: string, id?: number) => {
  const response = await fetch(`${process.env.REACT_APP_BRUNEAU_API}/ProChantier/CreateOrUpdateMateriauxOutils`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nom, id }),
  });
  if (!response.ok) {
    throw new Error("Failed to create or update materiaux/outils");
  }
};

export const deleteMateriauxOutils = async (id: number) => {
  const response = await fetch(`${process.env.REACT_APP_BRUNEAU_API}/ProChantier/DeleteMateriauxOutils/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete materiaux/outils");
  }
};

export const getSousTraitantProjet = async () => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/GetSousTraitantProjet`,
    { method: "GET" }
  );
  return response.json();
};

export const createOrUpdateSousTraitantProjet = async (nom: string, id?: number) => {
  const response = await fetch(`${process.env.REACT_APP_BRUNEAU_API}/ProChantier/CreateOrUpdateSousTraitantProjet`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nom, id }),
  });
  if (!response.ok) {
    throw new Error("Failed to create or update sous-traitant projet");
  }
};

export const deleteSousTraitantProjet = async (id: number) => {
  const response = await fetch(`${process.env.REACT_APP_BRUNEAU_API}/ProChantier/DeleteSousTraitantProjet/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete sous-traitant projet");
  }
};

export const getDistancesForLieu = async (lieuId: number | null) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/GetDistancesForLieu/${lieuId}`,
    { method: "GET" }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch distances for the specified Lieu");
  }
  return response.json();
};

export const createOrUpdateDistance = async (lieuId: number, baseA: number, baseB: number, distance: number) => {
  const response = await fetch(`${process.env.REACT_APP_BRUNEAU_API}/ProChantier/CreateOrUpdateDistance`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ LieuID: lieuId, BaseA: baseA, BaseB: baseB, DistanceInMeters: distance }),
  });
  if (!response.ok) {
    throw new Error("Failed to create or update distance");
  }
};

export const deleteDistance = async (distanceId: number) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/DeleteDistance/${distanceId}`,
    {
      method: "DELETE",
    }
  );
  if (!response.ok) {
    throw new Error("Failed to delete distance");
  }
};

export const getLocalisationActivites = async (activiteId: number) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/GetLocalisationActivites/${activiteId}`,
    { method: "GET" }
  );
  return response.json();
};

export const createOrUpdateLocalisationActivites = async (
  ActiviteID: number,
  LocDistanceID?: number,
  LocID?: number
) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/CreateOrUpdateLocalisationActivites`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ActiviteID, LocDistanceID, LocID }),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to create or update localisation activites");
  }
};

export const deleteLocalisationActivites = async (
  activiteId: number,
  locDistanceId?: number
) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/DeleteLocalisationActivites/${activiteId}/${locDistanceId}`,
    { method: "DELETE" }
  );
  if (!response.ok) {
    throw new Error("Failed to delete localisation activites");
  }
};

export const getMateriauxJournal = async (journalId: number) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/GetMateriauxJournal/${journalId}`,
    { method: "GET" }
  );
  return response.json();
};

export const createOrUpdateMateriauxJournal = async (
  JournalID: number,
  MaterielID: number,
  Quantite: number
) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/CreateOrUpdateMateriauxJournal`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ JournalID, MaterielID, Quantite }),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to create or update materiaux journal");
  }
};

export const deleteMateriauxJournal = async (
  journalId: number,
  materielId: number
) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/DeleteMateriauxJournal/${journalId}/${materielId}`,
    { method: "DELETE" }
  );
  if (!response.ok) {
    throw new Error("Failed to delete materiaux journal");
  }
};

export const getSousTraitantJournal = async (journalId: number) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/GetSousTraitantJournal/${journalId}`,
    { method: "GET" }
  );
  return response.json();
};

export const createOrUpdateSousTraitantJournal = async (
  JournalID: number,
  SousTraitantID: number,
  Quantite: number
) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/CreateOrUpdateSousTraitantJournal`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ JournalID, SousTraitantID, Quantite }),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to create or update sous-traitant journal");
  }
};

export const deleteSousTraitantJournal = async (
  journalId: number,
  sousTraitantId: number
) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/DeleteSousTraitantJournal/${journalId}/${sousTraitantId}`,
    { method: "DELETE" }
  );
  if (!response.ok) {
    throw new Error("Failed to delete sous-traitant journal");
  }
};

export const getJournalProjet = async (journalId: number) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/GetJournalProjet/${journalId}`,
    { method: "GET" }
  );
  return response.json();
};

export const createOrUpdateJournalProjet = async (
  Date: string,
  HrsDebut: string,
  HrsFin: string,
  StatutId: number,
  IDProjet: number,
  ActiviteID: number,
  IDProjetType?: number,
  MeteoId?: number,
) => {
  
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/CreateOrUpdateJournalProjet`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Date,
        HrsDebut,
        HrsFin,
        MeteoId,
        StatutId,
        IDProjetType,
        IDProjet,
        ActiviteID,
      }),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to create or update journal projet");
  }
};

export const deleteJournalProjet = async (journalId: number) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/DeleteJournalProjet/${journalId}`,
    { method: "DELETE" }
  );
  if (!response.ok) {
    throw new Error("Failed to delete journal projet");
  }
};

export const createOrUpdateActivitePlanif = async (activiteData: any, projectId: number) => {
  const formattedData = {
    ID: activiteData.id || undefined, // Ajout de l'ID facultatif
    ActiviteID: activiteData.activiteId,
    LieuID: activiteData.lieuId,
    ProjetID: projectId,
    HrsDebut: activiteData.startHour,
    HrsFin: activiteData.endHour,
    DefaultEntrepriseId: activiteData.defaultEntrepriseId,
    IsLab: activiteData.isLab || false,
    SignalisationId: activiteData.signalisationId,
    Note: activiteData.note || "",
    Date: activiteData.date || null,
    Quantite: activiteData.quantite || 0,
  };

  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/CreateOrUpdateActivitePlanif`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formattedData),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create or update activite planif");
  }

  const result = await response.json();
  return result.id; // Assurez-vous que l'API retourne l'ID de l'entité créée/mise à jour
};


export const deleteActivitePlanif = async (id: number) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/DeleteActivitePlanif/${id}`,
    { method: "DELETE" }
  );
  if (!response.ok) {
    throw new Error("Failed to delete activite planif");
  }
};

export const getEquipeChantier = async (id: number): Promise<TabEquipeChantier> => {
  try {
    // Importer userManager directement ici pour éviter les problèmes de dépendances circulaires
    const { userManager } = require('./AuthService');
    const user = await userManager.getUser();
    
    if (!user || !user.access_token) {
      throw new Error("Utilisateur non authentifié ou token d'accès non disponible");
    }
    
    const response = await fetch(`${process.env.REACT_APP_BRUNEAU_API}/ProChantier/GetEquipeChantier/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${user.access_token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'équipe:", error);
    throw error;
  }
};

export const getEquipeChantierByProjet = async (projetId: number) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/GetEquipeChantierByProjet/${projetId}`,
    { method: "GET" }
  );
  return response.json();
};

export const createOrUpdateEquipeChantier = async (equipe: TabEquipeChantier): Promise<TabEquipeChantier> => {
  try {
    // Importer userManager directement ici pour éviter les problèmes de dépendances circulaires
    const { userManager } = require('./AuthService');
    const user = await userManager.getUser();
    
    if (!user || !user.access_token) {
      throw new Error("Utilisateur non authentifié ou token d'accès non disponible");
    }
    
    const response = await fetch(`${process.env.REACT_APP_BRUNEAU_API}/ProChantier/CreateOrUpdateEquipeChantier`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(equipe),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Erreur lors de la création/mise à jour de l'équipe:", error);
    throw error;
  }
};

export const deleteEquipeChantier = async (id: number): Promise<void> => {
  try {
    // Importer userManager directement ici pour éviter les problèmes de dépendances circulaires
    const { userManager } = require('./AuthService');
    const user = await userManager.getUser();
    
    if (!user || !user.access_token) {
      throw new Error("Utilisateur non authentifié ou token d'accès non disponible");
    }
    
    const response = await fetch(`${process.env.REACT_APP_BRUNEAU_API}/ProChantier/DeleteEquipeChantier/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${user.access_token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Erreur lors de la suppression de l'équipe:", error);
    throw error;
  }
};

export const addEmployeToEquipe = async (equipeId: number, employeId: number): Promise<void> => {
  try {
    // Importer userManager directement ici pour éviter les problèmes de dépendances circulaires
    const { userManager } = require('./AuthService');
    const user = await userManager.getUser();
    
    if (!user || !user.access_token) {
      throw new Error("Utilisateur non authentifié ou token d'accès non disponible");
    }
    
    const response = await fetch(`${process.env.REACT_APP_BRUNEAU_API}/ProChantier/AddEmployeToEquipe`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        EquipeID: equipeId,
        EmployeID: employeId
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'employé à l'équipe:", error);
    throw error;
  }
};

export const removeEmployeFromEquipe = async (equipeId: number, employeId: number): Promise<void> => {
  try {
    const response = await fetch(`${process.env.REACT_APP_BRUNEAU_API}/ProChantier/DeleteBottinsEquipeChantier/${equipeId}/${employeId}`, {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Erreur lors du retrait de l'employé de l'équipe:", error);
    throw error;
  }
};

export const getBottinsEquipeChantier = async (equipeId: number) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/GetBottinsEquipeChantier/${equipeId}`,
      { method: "GET" }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching bottins for equipe:', error);
    throw error;
  }
};

export const createOrUpdateBottinsEquipeChantier = async (bottin: {
  EquipeID: number;
  BottinID: number;
}) => {
  try {
    // Importer userManager directement ici pour éviter les problèmes de dépendances circulaires
    const { userManager } = require('./AuthService');
    const user = await userManager.getUser();
    
    if (!user || !user.access_token) {
      throw new Error("Utilisateur non authentifié ou token d'accès non disponible");
    }
    
    const response = await fetch(`${process.env.REACT_APP_BRUNEAU_API}/ProChantier/CreateOrUpdateBottinsEquipeChantier`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bottin),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error creating/updating bottin equipe:', error);
    throw error;
  }
};

export const deleteBottinsEquipeChantier = async (equipeId: number, bottinId: number) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/DeleteBottinsEquipeChantier/${equipeId}/${bottinId}`,
      { method: "DELETE" }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting bottin equipe:', error);
    throw error;
  }
};

export const getEquipeJournal = async (journalID: number) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/GetEquipeJournal/${journalID}`,
    { method: "GET" }
  );
  return response.json();
};

export const createOrUpdateEquipeJournal = async (equipeData: any) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/CreateOrUpdateEquipeJournal`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(equipeData),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to create or update equipe journal");
  }
  return response.json();
};

export const deleteEquipeJournal = async (
  equipeID: number,
  journalID: number
) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/DeleteEquipeJournal/${equipeID}/${journalID}`,
    { method: "DELETE" }
  );
  if (!response.ok) {
    throw new Error("Failed to delete equipe journal");
  }
};

export const getMeteoJournal = async (id: number) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/GetMeteoJournal/${id}`,
    { method: "GET" }
  );
  return response.json();
};

export const createOrUpdateMeteoJournal = async (meteoData: any) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/CreateOrUpdateMeteoJournal`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(meteoData),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to create or update meteo journal");
  }
  return response.json();
};

export const deleteMeteoJournal = async (id: number) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/DeleteMeteoJournal/${id}`,
    { method: "DELETE" }
  );
  if (!response.ok) {
    throw new Error("Failed to delete meteo journal");
  }
};

export const getSignalisationProjet = async (projetId: number) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/GetSignalisationProjet/${projetId}`,
    { method: "GET" }
  );
  return response.json();
};

export const createOrUpdateSignalisationProjet = async (
  signalisationData: any
) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/CreateOrUpdateSignalisationProjet`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(signalisationData),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to create or update signalisation projet");
  }
  return response.json();
};

export const deleteSignalisationProjet = async (id: number) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/DeleteSignalisationProjet/${id}`,
    { method: "DELETE" }
  );
  if (!response.ok) {
    throw new Error("Failed to delete signalisation projet");
  }
};

export const getStatutJournal = async (id: number) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/GetStatutJournal/${id}`,
    { method: "GET" }
  );
  return response.json();
};

export const createOrUpdateStatutJournal = async (statutData: any) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/CreateOrUpdateStatutJournal`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(statutData),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to create or update statut journal");
  }
  return response.json();
};

export const deleteStatutJournal = async (id: number) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/DeleteStatutJournal/${id}`,
    { method: "DELETE" }
  );
  if (!response.ok) {
    throw new Error("Failed to delete statut journal");
  }
};


export const getPlanifChantier = async (id: number) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/GetPlanifChantier/${id}`,
    { method: "GET" }
  );
  if (!response.ok) {
    throw new Error("Failed to get planif chantier");
  }
  return await response.json();
};

export const createOrUpdatePlanifChantier = async (planifData: any) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/CreateOrUpdatePlanifChantier`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(planifData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur API:", errorText);
      throw new Error(`Failed to create or update planif chantier: ${errorText}`);
    }

    const responseText = await response.text();
    console.log("Réponse brute de l'API:", responseText);

    // Si la réponse est vide, retourner un objet par défaut
    if (!responseText) {
      console.log("Réponse vide de l'API, utilisation d'une réponse par défaut");
      return { id: planifData.ID };
    }

    try {
      const result = JSON.parse(responseText);
      console.log("Réponse parsée:", result);
      
      // Assurer que l'ID est correctement exposé dans la réponse
      if (result && typeof result === 'object') {
        // Si l'ID est présent sous une forme ou une autre, standardiser à 'id'
        if (result.ID !== undefined && result.id === undefined) {
          result.id = result.ID;
        } else if (result.Id !== undefined && result.id === undefined) {
          result.id = result.Id;
        }
        
        // Si aucun ID n'est présent mais que nous avons un nombre, c'est probablement l'ID
        if (result.id === undefined && typeof result === 'number') {
          return { id: result };
        }
      }
      
      return result;
    } catch (parseError) {
      console.error("Erreur de parsing JSON:", parseError);
      
      // Vérifier si la réponse est un nombre (ID)
      const numericId = Number(responseText.trim());
      if (!isNaN(numericId)) {
        console.log("La réponse est un ID numérique:", numericId);
        return { id: numericId };
      }
      
      // Si on ne peut pas parser la réponse mais qu'on a un ID, on le retourne
      return { id: planifData.ID };
    }
  } catch (error) {
    console.error("Erreur lors de la création/mise à jour de la planification:", error);
    throw error;
  }
};

export const deletePlanifChantier = async (id: number) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/DeletePlanifChantier/${id}`,
    {
      method: "DELETE",
    }
  );
  if (!response.ok) {
    throw new Error("Failed to delete planif chantier");
  }
  return await response.json();
};

export const getPlanifActivites = async (planifId: number) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/GetPlanifActivites/${planifId}`,
      { method: "GET" }
    );
    
    if (!response.ok) {
      // Gérer explicitement les erreurs HTTP
      if (response.status === 404) {
        // Si aucune activité n'est trouvée, retourner un tableau vide
        return [];
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Vérifier si la réponse est vide
    const text = await response.text();
    if (!text || text.trim() === '') {
      return [];
    }
    
    try {
      // Tenter de parser le JSON
      const data = JSON.parse(text);
      return data;
    } catch (parseError) {
      console.error(`Erreur de parsing JSON dans getPlanifActivites pour planifId=${planifId}:`, parseError);
      return [];
    }
  } catch (error) {
    console.error(`Erreur dans getPlanifActivites pour planifId=${planifId}:`, error);
    // En cas d'erreur, retourner un tableau vide plutôt que de propager l'erreur
    return [];
  }
};

export const createOrUpdatePlanifActivites = async (planifActivitesData: any) => {
  console.log("Envoi de l'activité au serveur:", planifActivitesData);
  
  // Aucune conversion nécessaire, les données sont déjà au format attendu par le backend
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/CreateOrUpdatePlanifActivites`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(planifActivitesData),
    }
  );
  
  const responseText = await response.text();
  console.log("Réponse brute du serveur:", responseText);
  
  if (!responseText || responseText.trim() === '') {
    return null;
  }
  
  try {
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Erreur lors du parsing de la réponse dans createOrUpdatePlanifActivites:", error);
    return null;
  }
};

export const deletePlanifActivites = async (id: number) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/DeletePlanifActivites/${id}`,
    {
      method: "DELETE",
    }
  );
  if (!response.ok) {
    throw new Error("Failed to delete planif activites");
  }
  return await response.json();
};

export const getPlanifChantierByProjet = async (projetId: number, dateDebut?: Date) => {
  try {
    let url = `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/GetPlanifChantierByProjet/${projetId}`;
    
    if (dateDebut) {
      const formattedDate = dateDebut.toISOString().split('T')[0];
      url += `?dateDebut=${formattedDate}`;
    }

    const response = await fetch(url, { method: "GET" });
    
    if (!response.ok) {
      // Gérer explicitement les erreurs HTTP
      if (response.status === 404) {
        // Si aucune planification n'est trouvée, retourner un tableau vide
        return [];
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Vérifier si la réponse est vide
    const text = await response.text();
    if (!text || text.trim() === '') {
      return [];
    }
    
    try {
      // Tenter de parser le JSON
      const data = JSON.parse(text);
      console.log("Données brutes reçues de l'API:", data);
      
      // Retourner les données brutes sans transformation
      // Le composant PlanningForm s'occupera de la transformation
      return data;
    } catch (parseError) {
      console.error("Erreur de parsing JSON dans getPlanifChantierByProjet:", parseError);
      return [];
    }
  } catch (error) {
    console.error("Erreur dans getPlanifChantierByProjet:", error);
    // En cas d'erreur, retourner un tableau vide plutôt que de propager l'erreur
    return [];
  }
};

export const getAllUnites = async (): Promise<Unite[]> => {
  try {
    const response = await fetch(`${process.env.REACT_APP_BRUNEAU_API}/ProChantier/GetAllUnites`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des unités:', error);
    throw error;
  }
};

export const createJournalChantier = async (journalChantierDto: any) => {
  try {
    console.log('Données envoyées à l\'API createJournalChantier:', JSON.stringify(journalChantierDto, null, 2));
    
    const response = await fetch(
      `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/CreateJournalChantier`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(journalChantierDto),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error creating journal chantier: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error in createJournalChantier:", error);
    throw error;
  }
};

export const getAllJournalChantierByProject = async (projetId: number) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/GetAllJournalChantierByProject/${projetId}`,
      { method: "GET" }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Données recueillies à l\'API getAllJournalChantierByProject:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error fetching journals for project:', error);
    throw error;
  }
};

export const saveJournalPdf = async (pdfBlob: Blob, numeroProjet: string, fileName: string) => {
  try {
    const formData = new FormData();
    formData.append('file', pdfBlob, fileName);
    formData.append('numeroProjet', numeroProjet);

    console.log('Envoi du PDF à l\'API SaveJournalPdf:', { fileName, numeroProjet });
    
    const response = await fetch(
      `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/SaveJournalPdf`,
      {
        method: "POST",
        body: formData,
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur lors de la sauvegarde du PDF: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erreur dans saveJournalPdf:", error);
    throw error;
  }
};

// Fonction pour vérifier si l'API est accessible
export const checkApiStatus = async (): Promise<boolean> => {
  console.log("🔍 Vérification de l'accès à l'API...");
  
  try {
    // Vérifier si l'URL de l'API est définie
    const apiUrl = process.env.REACT_APP_BRUNEAU_API;
    if (!apiUrl) {
      console.error("❌ L'URL de l'API n'est pas définie. Vérifiez votre fichier .env");
      return false;
    }
    
    // Vérifier si l'API est accessible
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 secondes timeout
    
    console.log(`🔍 Tentative d'accès à ${apiUrl}/api/health`);
    const response = await fetch(`${apiUrl}/api/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log(`🔍 Statut de la réponse: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      console.log("✅ API accessible");
      return true;
    } else {
      console.error(`❌ Impossible d'accéder à l'API: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.error("❌ Erreur lors de la vérification de l'accès à l'API:", error);
    return false;
  }
};

// Fonction pour créer une planification et ses activités en une seule opération
export const createPlanifWithActivities = async (planifData: any, activitiesData: any[]) => {
  try {
    console.log("Création d'une planification avec activités");
    console.log("Données de planification:", planifData);
    console.log("Données d'activités:", activitiesData);
    
    // Étape 1: Créer la planification
    const planifResponse = await createOrUpdatePlanifChantier(planifData);
    
    if (!planifResponse || !planifResponse.id) {
      throw new Error("Échec de la création de la planification: ID non retourné");
    }
    
    console.log("Planification créée avec succès, ID:", planifResponse.id);
    
    // Étape 2: Créer les activités avec l'ID de la planification
    const createdActivities = [];
    
    for (const activityData of activitiesData) {
      // Créer une copie des données pour éviter de modifier l'objet original
      const activityToCreate: any = { ...activityData };
      
      // Assurer que l'ID de la planification est correctement assigné
      activityToCreate.planifId = planifResponse.id;
      
      // Supprimer isComplete car cette propriété n'est pas gérée par le backend
      if ('isComplete' in activityToCreate) {
        delete activityToCreate.isComplete;
      }
      
      // S'assurer que les noms de propriétés correspondent à ceux attendus par le backend
      if ('signalisation' in activityToCreate) {
        activityToCreate.signalisationId = activityToCreate.signalisation;
        delete activityToCreate.signalisation;
      }
      
      console.log("Création de l'activité:", activityToCreate);
      
      try {
        const activityResponse = await createOrUpdatePlanifActivites(activityToCreate);
        console.log("Activité créée:", activityResponse);
        
        if (activityResponse) {
          createdActivities.push(activityResponse);
        }
      } catch (activityError) {
        console.error("Erreur lors de la création d'une activité:", activityError);
        // Continuer avec les autres activités même si une échoue
      }
    }
    
    // Retourner la planification avec ses activités
    return {
      planification: planifResponse,
      activities: createdActivities
    };
    
  } catch (error) {
    console.error("Erreur lors de la création de la planification avec activités:", error);
    throw error;
  }
};
