import React, { useState, useEffect, useCallback } from "react";
import {
  FaBoxes,
  FaMapMarkerAlt,
  FaPeopleCarry,
  FaTools,
  FaBriefcase,
  FaUser,
} from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import ModalGestion from "./ModalGestion";
import ResourceTable from "./RessourceTable";
import {
  deleteBase,
  deleteLieu,
  deleteFonction,
  deleteEquipement,
  createOrUpdateBase,
  createOrUpdateLieu,
  createOrUpdateFonction,
  createOrUpdateEquipement,
  createOrUpdateSousTraitantProjet,
  createOrUpdateMateriauxOutils,
  deleteMateriauxOutils,
  updateEmployeeDetails,
  deleteSousTraitantProjet,
  createOrUpdateDistance,
} from "../../../services/JournalService";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import ModalGestionLocalisation from "./ModalGestionLocalisation";
import { Materiau } from "../../../models/JournalFormModel";

const Gestion: React.FC = () => {
  const {
    selectedProject,
    fetchEmployes,
    fetchBases,
    fetchLieux,
    fetchFonctions,
    fetchEquipements,
    fetchSousTraitants,
    fetchMateriaux,
    employees,
    fonctions,
    lieux,
    equipements,
    sousTraitants,
    materiaux,
    bases,
  } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDistanceModalOpen, setIsDistanceModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [selectedLieu, setSelectedLieu] = useState<number | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: number;
    name: string;
    category: string;
  } | null>(null);

  const handleCloseDistanceModal = () => {
    setIsDistanceModalOpen(false);
  };

  const loadProjectData = useCallback(() => {
    if (selectedProject) {
      fetchLieux(selectedProject.ID);
      fetchFonctions();
      fetchEquipements(selectedProject.ID);
      fetchSousTraitants();
      fetchMateriaux();
      fetchEmployes(selectedProject.ID);
    }
  }, [
    selectedProject,
    fetchLieux,
    fetchFonctions,
    fetchEquipements,
    fetchSousTraitants,
    fetchMateriaux,
    fetchEmployes,
  ]);

  useEffect(() => {
    loadProjectData();
  }, [loadProjectData]);

  if (!selectedProject) {
    return <div>Veuillez sélectionner un projet.</div>;
  }

  const handleAdd = (category: string, lieuId?: number) => {
    setCurrentCategory(category);
    setCurrentItem(lieuId ? { lieuId } : null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: string, item: any) => {
    if (category === "employes") {
      const matchedFonction = fonctions?.find(
        (f) => f.nom.trim() === item.fonction.trim()
      );
      const matchedEquipement = equipements?.find(
        (e) => e.nom.trim() === item.equipement.trim()
      );

      const updatedItem = {
        ...item,
        fonction: matchedFonction
          ? { id: matchedFonction.id, nom: matchedFonction.nom }
          : { id: null, nom: "Non spécifié" },
        equipement: matchedEquipement
          ? { id: matchedEquipement.id, nom: matchedEquipement.nom }
          : { id: null, nom: "Non spécifié" },
      };

      setCurrentItem(updatedItem);
      setCurrentCategory(category);
      setIsModalOpen(true);
    } else {
      setCurrentItem(item);
      setCurrentCategory(category);
      setIsModalOpen(true);
    }
  };

  const handleDelete = (category: string, id: number, itemName: string) => {
    openConfirmModal(category, id, itemName);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCurrentCategory(null);
    setCurrentItem(null);
  };

  const handleModalSubmit = async (item: any) => {
    try {
      await performAction(currentCategory!, "save", item);
      handleModalClose();
    } catch (error) {
      console.error("Failed to submit item", error);
    }
  };

  const openConfirmModal = (category: string, id: number, itemName: string) => {
    setItemToDelete({ category, id, name: itemName });
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await performAction(itemToDelete.category, "delete", {
          id: itemToDelete.id,
        });
        setIsConfirmModalOpen(false);
        setItemToDelete(null);
      } catch (error) {
        console.error("Failed to delete item", error);
      }
    }
  };
  const handleImportExcel = async (data: any) => {
    console.log("Données importées:", data);

    if (!data.rows || !Array.isArray(data.rows)) {
      console.error(
        "Les données importées ne contiennent pas de lignes valides:",
        data
      );
      return;
    }

    const rows = data.rows;

    const lieuxSet = new Set<string>();
    const baseAssociations: {
      [lieu: string]: { base_a: string; base_b: string; distance: number }[];
    } = {};

    // Parcours de toutes les lignes pour extraire les lieux et bases distincts
    rows.forEach((row: any) => {
      const { lieu, base_a, base_b, distance_arrondie } = row.values;

      lieuxSet.add(lieu);

      if (!baseAssociations[lieu]) {
        baseAssociations[lieu] = [];
      }

      // Vérification que les bases ne sont ni nulles ni égales à "N/A"
      if (base_a && base_a !== "N/A" && base_b && base_b !== "N/A") {
        const baseAString = String(base_a);
        const baseBString = String(base_b);

        baseAssociations[lieu].push({
          base_a: baseAString,
          base_b: baseBString,
          distance: distance_arrondie,
        });
      } else {
        console.warn(
          `Lignes ignorées à cause de noms de base invalides: ${base_a}, ${base_b}`
        );
      }
    });

    // Création des lieux distincts
    const lieuIdMap: { [lieu: string]: number } = {};
    for (const lieu of lieuxSet) {
      try {
        const lieuId = await createOrUpdateLieu(lieu, selectedProject.ID);
        lieuIdMap[lieu] = lieuId;
        console.log(`Lieu ${lieu} créé avec ID ${lieuId}`);
      } catch (error) {
        console.error(`Erreur lors de la création du lieu ${lieu}:`, error);
      }
    }

    // Création des bases associées et des distances
    for (const [lieu, associations] of Object.entries(baseAssociations)) {
      const lieuId = lieuIdMap[lieu];
      const baseIdMap: { [base: string]: number } = {};

      for (const { base_a, base_b, distance } of associations) {
        try {
          // Création ou récupération des IDs pour base_a et base_b
          const baseAId =
            baseIdMap[base_a] || (await createOrUpdateBase(base_a, lieuId));
          baseIdMap[base_a] = baseAId;

          const baseBId =
            baseIdMap[base_b] || (await createOrUpdateBase(base_b, lieuId));
          baseIdMap[base_b] = baseBId;

          console.log(
            `Base A: ${base_a} avec ID: ${baseAId}, Base B: ${base_b} avec ID: ${baseBId}`
          );

          // Création de la distance entre base_a et base_b
          await createOrUpdateDistance(lieuId, baseAId, baseBId, distance);
        } catch (error) {
          console.error(
            `Erreur lors de la création des bases ou de la distance pour le lieu ${lieu}:`,
            error
          );
        }
      }
    }
  };

  const performAction = async (
    category: string,
    action: "save" | "delete",
    item: any
  ) => {
    switch (category) {
      case "materiaux":
        if (action === "save") {
          await createOrUpdateMateriauxOutils(item.nom, item.id);
        } else {
          await deleteMateriauxOutils(item.id);
        }
        await fetchMateriaux();
        break;
      case "lieux":
        if (action === "save") {
          await createOrUpdateLieu(item.nom, selectedProject.ID, item.id);
        } else {
          await deleteLieu(item.id);
        }
        await fetchLieux(selectedProject.ID);
        break;
      case "fonctions":
        if (action === "save") {
          await createOrUpdateFonction(item.nom, item.id);
        } else {
          await deleteFonction(item.id);
        }
        await fetchFonctions();
        await fetchEmployes(selectedProject.ID);
        break;
      case "equipements":
        if (action === "save") {
          await createOrUpdateEquipement(item.nom, selectedProject.ID, item.id);
        } else {
          await deleteEquipement(item.id);
        }
        await fetchEquipements(selectedProject.ID);
        await fetchEmployes(selectedProject.ID);
        break;
      case "sousTraitants":
        if (action === "save") {
          await createOrUpdateSousTraitantProjet(item.nom, item.id);
        } else {
          await deleteSousTraitantProjet(item.id);
        }
        await fetchSousTraitants();
        break;
      case "localisations":
        if (action === "save") {
          await createOrUpdateBase(item.nom, item.lieuId, item.id);
          fetchBases(item.lieuId);
        } else {
          await deleteBase(item.id);
        }
        await fetchLieux(selectedProject.ID);
        break;
      case "employes":
        if (action === "save") {
          await updateEmployeeDetails(
            item.id,
            item.fonction.id,
            item.equipement.id
          );
        }
        await fetchEmployes(selectedProject.ID);
        break;
      default:
        throw new Error("Unknown category");
    }
  };

  const formattedEmployeeList = employees?.map((employee) => ({
    ...employee,
    employe: `${employee.prenom} ${employee.nom}`,
    fonction: employee.fonction?.nom || "Non spécifié",
    equipement: employee.equipement?.nom || "Non spécifié",
  }));

  const formattedFonctions = fonctions?.map((f) => ({
    id: f.id,
    nom: f.nom,
  }));

  const formattedEquipements = equipements?.map((e) => ({
    id: e.id,
    nom: e.nom,
  }));

  const renderLocalisations = (lieu: any) => {
    const localisations = bases?.filter((base) => base.lieuId === lieu.id);
    return (
      <ResourceTable
        title={`Localisations pour ${lieu.nom}`}
        icon={<FaMapMarkerAlt />}
        items={localisations || []}
        columns={["base"]}
        onAdd={() => handleAdd("localisations", lieu.id)}
        onEdit={(item) => handleEdit("localisations", item)}
        onDelete={(id: number, item: any) =>
          handleDelete("localisations", id, item.base)
        }
      />
    );
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-center bg-blue-800 text-white p-4 rounded">
        Gestion des Ressources
      </h1>

      <ResourceTable
        title="Lieux"
        icon={<FaMapMarkerAlt />}
        items={lieux || []}
        columns={["nom"]}
        onAdd={() => handleAdd("lieux")}
        onEdit={(item) => handleEdit("lieux", item)}
        onDelete={(id: number, item: any) => {
          handleDelete("lieux", id, item.nom);
        }}
        renderSubItems={renderLocalisations}
        onDistances={() => {
          setSelectedLieu(lieux?.[0]?.id || null); // Set default selectedLieu to the first one
          setIsDistanceModalOpen(true);
        }}
        onImportExcel={handleImportExcel}
      />

      <div className="grid grid-cols-1 gap-4">
        <ResourceTable
          title="Matériaux"
          icon={<FaBoxes />}
          items={materiaux || []}
          columns={["nom"]}
          onAdd={() => handleAdd("materiaux")}
          onEdit={(item) => handleEdit("materiaux", item)}
          onDelete={(id: number, item: Materiau) => {
            handleDelete("materiaux", id, item.nom);
          }}
        />
        <ResourceTable
          title="Sous-traitants"
          icon={<FaPeopleCarry />}
          items={sousTraitants || []}
          columns={["nom"]}
          onAdd={() => handleAdd("sousTraitants")}
          onEdit={(item) => handleEdit("sousTraitants", item)}
          onDelete={(id: number, item: any) => {
            handleDelete("sousTraitants", id, item.nom);
          }}
        />
        <ResourceTable
          title="Équipements"
          icon={<FaTools />}
          items={equipements || []}
          columns={["nom"]}
          onAdd={() => handleAdd("equipements")}
          onEdit={(item) => handleEdit("equipements", item)}
          onDelete={(id: number, item: any) => {
            handleDelete("equipements", id, item.nom);
          }}
        />
        <ResourceTable
          title="Fonctions"
          icon={<FaBriefcase />}
          items={fonctions || []}
          columns={["nom"]}
          onAdd={() => handleAdd("fonctions")}
          onEdit={(item) => handleEdit("fonctions", item)}
          onDelete={(id: number, item: any) => {
            handleDelete("fonctions", id, item.nom);
          }}
        />
        <ResourceTable
          title="Employés"
          icon={<FaUser />}
          items={formattedEmployeeList || []}
          columns={["employe", "fonction", "equipement"]}
          onEdit={(item) => handleEdit("employes", item)}
          onDelete={function (id: number): void {
            throw new Error("Function not implemented.");
          }} // No delete functionality for employees
        />
      </div>

      {isConfirmModalOpen && itemToDelete && (
        <ConfirmDeleteModal
          onConfirm={confirmDelete}
          onCancel={() => setIsConfirmModalOpen(false)}
          itemName={itemToDelete.name}
        />
      )}

      {isModalOpen && (
        <ModalGestion
          category={currentCategory}
          item={currentItem}
          fonctions={formattedFonctions || []}
          equipements={formattedEquipements || []}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
        />
      )}

      {isDistanceModalOpen && selectedLieu !== null && (
        <ModalGestionLocalisation
          onClose={handleCloseDistanceModal}
          lieuId={selectedLieu}
          bases={bases?.filter((base) => base.lieuId === selectedLieu) || []}
          lieux={lieux || []} // Pass the lieux array to the modal
          onLieuChange={setSelectedLieu} // Function to change the selected lieu
        />
      )}
    </div>
  );
};

export default Gestion;
