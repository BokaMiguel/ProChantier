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
import Modal from "./Modal";
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
} from "../../../services/JournalService";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
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
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: number;
    name: string;
    category: string;
  } | null>(null);

  const loadProjectData = useCallback(() => {
    if (selectedProject) {
      fetchBases(selectedProject.ID);
      fetchLieux(selectedProject.ID);
      fetchFonctions();
      fetchEquipements(selectedProject.ID);
      fetchSousTraitants();
      fetchMateriaux();
      fetchEmployes(selectedProject.ID);
    }
  }, [
    selectedProject,
    fetchBases,
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

  const handleAdd = (category: string) => {
    setCurrentCategory(category);
    setCurrentItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: string, item: any) => {
    // Recherche de l'ID de la fonction et de l'équipement en fonction du nom
    const matchedFonction = fonctions?.find(
      (f) => f.nom.trim() === item.fonction.trim()
    );
    const matchedEquipement = equipements?.find(
      (e) => e.nom.trim() === item.equipement.trim()
    );

    // Mise à jour de l'élément avec les IDs correspondants
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
      case "localisations":
        if (action === "save") {
          await createOrUpdateBase(item.nom, selectedProject.ID, item.id);
        } else {
          await deleteBase(item.id);
        }
        await fetchBases(selectedProject.ID);
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
        break;
      case "equipements":
        if (action === "save") {
          await createOrUpdateEquipement(item.nom, selectedProject.ID, item.id);
        } else {
          await deleteEquipement(item.id);
        }
        await fetchEquipements(selectedProject.ID);
        break;
      case "sousTraitants":
        if (action === "save") {
          await createOrUpdateSousTraitantProjet(item.nom, item.id);
        }
        await fetchSousTraitants();
        break;
      case "employes":
        if (action === "save") {
          await updateEmployeeDetails(
            item.id,
            item.fonction.id,
            item.equipement.id
          );
          // Mettre à jour directement la liste des employés pour refléter le changement
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

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-center bg-blue-800 text-white p-4 rounded">
        Gestion des Ressources
      </h1>

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
          title="Localisations"
          icon={<FaMapMarkerAlt />}
          items={bases || []}
          columns={["base"]}
          onAdd={() => handleAdd("localisations")}
          onEdit={(item) => handleEdit("localisations", item)}
          onDelete={(id: number, item: any) => {
            handleDelete("localisations", id, item.base);
          }}
        />
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
        <Modal
          category={currentCategory}
          item={currentItem}
          fonctions={formattedFonctions || []}
          equipements={formattedEquipements || []}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
        />
      )}
    </div>
  );
};

export default Gestion;
