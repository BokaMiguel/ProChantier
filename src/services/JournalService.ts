// src/services/JournalService.ts

export const getAuthorizedProjects = async (userId: string) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/Horizon/projets/GetAuthorizedProjects/${userId}`
  );
  const dataText = await response.text();
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  if (!dataText) {
    throw new Error("Projects data is empty");
  }
  return JSON.parse(dataText);
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

export const getActivitePlanif = async (id: number) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/GetActivitePlanif/${id}`,
    { method: "GET" }
  );
  return response.json();
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

export const getBottinsEquipeChantier = async (equipeID: number) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/GetBottinsEquipeChantier/${equipeID}`,
    { method: "GET" }
  );
  return response.json();
};

export const createOrUpdateBottinsEquipeChantier = async (equipeData: any) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/CreateOrUpdateBottinsEquipeChantier`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(equipeData),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to create or update bottins equipe chantier");
  }
  return response.json();
};

export const deleteBottinsEquipeChantier = async (
  equipeID: number,
  bottinID: number
) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/DeleteBottinsEquipeChantier/${equipeID}/${bottinID}`,
    { method: "DELETE" }
  );
  if (!response.ok) {
    throw new Error("Failed to delete bottins equipe chantier");
  }
};

export const getEquipeChantier = async (id: number) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/GetEquipeChantier/${id}`,
    { method: "GET" }
  );
  return response.json();
};

export const createOrUpdateEquipeChantier = async (equipeData: any) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/CreateOrUpdateEquipeChantier`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(equipeData),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to create or update equipe chantier");
  }
  return response.json();
};

export const deleteEquipeChantier = async (id: number) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/DeleteEquipeChantier/${id}`,
    { method: "DELETE" }
  );
  if (!response.ok) {
    throw new Error("Failed to delete equipe chantier");
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

