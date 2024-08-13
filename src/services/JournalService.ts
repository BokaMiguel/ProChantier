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

export const getEquipementsProjet = async (projectId: number) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/GetEquipementsProjet/${projectId}`,
    { method: "GET" }
  );
  return response.json();
};

export const getMateriauxOutillage = async (projectId: number) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/GetMateriauxOutillage/${projectId}`,
    { method: "GET" }
  );
  return response.json();
};

export const getBases = async (projectId: number) => {
  console.log('projectId', projectId)
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/GetBases/${projectId}`,
    { method: "GET" }
  );
  return response.json();
};

export const createOrUpdateBase = async (base: string, projectId: number, id?: number) => {
  const response = await fetch(`${process.env.REACT_APP_BRUNEAU_API}/ProChantier/CreateOrUpdateBase`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ base, idProjet: projectId, id }),
  });
  if (!response.ok) {
    throw new Error("Failed to create or update base");
  }
};

export const deleteBase = async (baseId: number) => {
  console.log('baseId', baseId)
  const response = await fetch(`${process.env.REACT_APP_BRUNEAU_API}/ProChantier/DeleteBase/${baseId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete base");
  }
};

// New methods for Lieu, Fonction, Equipement

export const createOrUpdateLieu = async (lieu: string, projectId: number, id?: number) => {
  const response = await fetch(`${process.env.REACT_APP_BRUNEAU_API}/ProChantier/CreateOrUpdateLieu`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ lieu, idProjet: projectId, id }),
  });
  if (!response.ok) {
    throw new Error("Failed to create or update lieu");
  }
};

export const deleteLieu = async (lieuId: number) => {
  const response = await fetch(`${process.env.REACT_APP_BRUNEAU_API}/ProChantier/DeleteLieu/${lieuId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete lieu");
  }
};

export const createOrUpdateFonction = async (fonction: string, id?: number) => {
  const response = await fetch(`${process.env.REACT_APP_BRUNEAU_API}/ProChantier/CreateOrUpdateFonction`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fonction, id }),
  });
  if (!response.ok) {
    throw new Error("Failed to create or update fonction");
  }
};

export const deleteFonction = async (fonctionId: number) => {
  const response = await fetch(`${process.env.REACT_APP_BRUNEAU_API}/ProChantier/DeleteFonction/${fonctionId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete fonction");
  }
};

export const createOrUpdateEquipement = async (equipement: string, projectId: number, id?: number) => {
  const response = await fetch(`${process.env.REACT_APP_BRUNEAU_API}/ProChantier/CreateOrUpdateEquipement`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ equipement, idProjet: projectId, id }),
  });
  if (!response.ok) {
    throw new Error("Failed to create or update equipement");
  }
};

export const deleteEquipement = async (equipementId: number) => {
  const response = await fetch(`${process.env.REACT_APP_BRUNEAU_API}/ProChantier/DeleteEquipement/${equipementId}`, {
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

export const getSousTraitantProjet = async (id: number) => {
  const response = await fetch(
    `${process.env.REACT_APP_BRUNEAU_API}/ProChantier/GetSousTraitantProjet/${id}`,
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
