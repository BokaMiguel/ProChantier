import React, { useState } from "react";
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

const Gestion: React.FC = () => {
  const {
    selectedProject,
    bases,
    lieux,
    fonctions,
    equipements,
    materiaux,
    employeeList,
  } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [currentItem, setCurrentItem] = useState<any>(null);

  const handleAdd = (category: string) => {
    setCurrentCategory(category);
    setCurrentItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: string, item: any) => {
    setCurrentCategory(category);
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (category: string, id: number) => {
    // Implémentation de la suppression en fonction de la catégorie
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCurrentCategory(null);
    setCurrentItem(null);
  };

  const handleModalSubmit = async (item: any) => {
    // Implémentation de la soumission du formulaire en fonction de la catégorie
    handleModalClose();
  };

  // Reformater employeeList pour combiner le prénom et le nom
  const formattedEmployeeList = employeeList?.map((employee) => ({
    ...employee,
    employe: `${employee.prenom} ${employee.nom}`,
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
          onDelete={(id) => handleDelete("materiaux", id)}
        />
        <ResourceTable
          title="Localisations"
          icon={<FaMapMarkerAlt />}
          items={bases || []}
          columns={["base"]}
          onAdd={() => handleAdd("localisations")}
          onEdit={(item) => handleEdit("localisations", item)}
          onDelete={(id) => handleDelete("localisations", id)}
        />
        <ResourceTable
          title="Lieux"
          icon={<FaMapMarkerAlt />}
          items={lieux || []}
          columns={["nom"]}
          onAdd={() => handleAdd("lieux")}
          onEdit={(item) => handleEdit("lieux", item)}
          onDelete={(id) => handleDelete("lieux", id)}
        />
        <ResourceTable
          title="Sous-traitants"
          icon={<FaPeopleCarry />}
          items={employeeList || []}
          columns={["nom"]}
          onAdd={() => handleAdd("sousTraitants")}
          onEdit={(item) => handleEdit("sousTraitants", item)}
          onDelete={(id) => handleDelete("sousTraitants", id)}
        />
        <ResourceTable
          title="Équipements"
          icon={<FaTools />}
          items={equipements || []}
          columns={["nom"]}
          onAdd={() => handleAdd("equipements")}
          onEdit={(item) => handleEdit("equipements", item)}
          onDelete={(id) => handleDelete("equipements", id)}
        />
        <ResourceTable
          title="Fonctions"
          icon={<FaBriefcase />}
          items={fonctions || []}
          columns={["nom"]}
          onAdd={() => handleAdd("fonctions")}
          onEdit={(item) => handleEdit("fonctions", item)}
          onDelete={(id) => handleDelete("fonctions", id)}
        />
        <ResourceTable
          title="Employés"
          icon={<FaUser />}
          items={formattedEmployeeList || []}
          columns={["employe", "fonction", "equipement"]}
          onEdit={(item) => handleEdit("employes", item)}
          onDelete={function (id: number): void {
            throw new Error("Function not implemented.");
          }}
        />
      </div>

      {isModalOpen && (
        <Modal
          category={currentCategory}
          item={currentItem}
          fonctions={fonctions || []}
          equipements={equipements || []}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
        />
      )}
    </div>
  );
};

export default Gestion;
