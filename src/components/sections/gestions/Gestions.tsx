import React, { useState, useEffect, useCallback } from "react";
import {
  FaBoxes,
  FaMapMarkerAlt,
  FaPeopleCarry,
  FaTools,
  FaBriefcase,
  FaUser,
  FaClipboardList,
  FaUsers,
  FaPlus,
  FaEdit,
  FaTrash,
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
  createOrUpdateActivite,
  deleteActivite,
  createOrUpdateEquipeChantier,
  deleteEquipeChantier,
  removeEmployeFromEquipe,
  addEmployeToEquipe,
  getEquipeChantierByProjet,
} from "../../../services/JournalService";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import ModalGestionLocalisation from "./ModalGestionLocalisation";
import { 
  Materiau, 
  TabEquipeChantier,
  Lieu,
  Fonction,
  Equipement,
  SousTraitant,
  Activite,
  Employe,
} from "../../../models/JournalFormModel";


interface CategoryItem {
  name: string;
  icon: React.ReactNode;
  items: Array<Lieu | Activite | Materiau | SousTraitant | Equipement | Fonction | Employe | TabEquipeChantier>;
  columns: string[];
  onAdd: () => void;
  onEdit: (item: any) => void;
  onDelete: (id: number, item: any) => void;
  renderSubItems?: (item: any) => React.ReactNode;
  onDistances?: () => void;
  onImportExcel?: (data: any) => void;
}

interface ItemToDelete {
  id: number;
  name: string;
  category: string;
}

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
    fetchActivites,
    fetchEquipes,
    employees,
    fonctions,
    lieux,
    equipements,
    sousTraitants,
    materiaux,
    bases,
    activites,
    equipes,
  } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDistanceModalOpen, setIsDistanceModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [selectedLieu, setSelectedLieu] = useState<number | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ItemToDelete | null>(null);

  const renderLocalisations = (lieu: any) => {
    if (!bases || !Array.isArray(bases)) {
      console.log('Bases non disponibles ou format incorrect:', bases);
      return null;
    }
    
    const localisations = bases
      .filter((base) => base && base.lieuId === lieu.id)
      .map(base => ({
        id: base.id,
        nom: base.base, // Uniformisation de la structure
        lieuId: base.lieuId
      }));
    
    return (
      <ResourceTable
        title={`Localisations pour ${lieu.nom}`}
        icon={<FaMapMarkerAlt />}
        items={localisations}
        columns={["nom"]} // Utilisation de "nom" au lieu de "base"
        onAdd={() => handleAdd("localisations", lieu.id)}
        onEdit={(item) => handleEdit("localisations", item)}
        onDelete={(id: number, item: any) =>
          handleDelete("localisations", id, item.nom)
        }
      />
    );
  };

  const renderEmployesEquipe = (equipe: TabEquipeChantier) => {
    console.log("Équipe reçue:", equipe);
    console.log("Employés de l'équipe:", equipe.employes);
    console.log("Liste complète des employés:", employees);

    if (!equipe.employes || !Array.isArray(equipe.employes)) {
      console.log("Pas d'employés dans l'équipe ou format incorrect");
      return (
        <div className="mt-2 px-4 py-3 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-sm italic">Aucun employé dans cette équipe</p>
        </div>
      );
    }

    // Récupérer les IDs des employés de l'équipe
    const employesIds = equipe.employes.map(e => e.bottinID);
    console.log("IDs des employés de l'équipe:", employesIds);
    
    // Filtrer et formater les employés comme dans la table Employés
    const employesEquipe = employees
      ?.filter(employe => employesIds.includes(employe.id))
      .map(employe => ({
        ...employe,
        employe: `${employe.prenom} ${employe.nom}`,
        fonction: employe.fonction?.nom || "Non spécifié",
        equipement: employe.equipement?.nom || "Non spécifié"
      })) || [];

    console.log("Employés filtrés et formatés:", employesEquipe);

    return (
      <div className="mt-2">
        <div className="flex items-center justify-between mb-2 px-4">
          <button
            onClick={() => handleAdd("employesEquipe", equipe.id)}
            className="inline-flex items-center px-3 py-1.5 text-sm border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            <FaPlus className="mr-1.5 h-3.5 w-3.5" />
            Ajouter
          </button>
        </div>

        <div className="min-w-full divide-y divide-gray-200">
          <div className="bg-gray-100">
            <div className="grid grid-cols-12 gap-2 px-4 py-2 text-sm font-medium text-gray-700">
              <div className="col-span-4">Employé</div>
              <div className="col-span-4">Fonction</div>
              <div className="col-span-3">Équipement</div>
              <div className="col-span-1">Actions</div>
            </div>
          </div>
          <div className="bg-white divide-y divide-gray-200">
            {employesEquipe.map((employe) => (
              <div key={employe.id} className="grid grid-cols-12 gap-2 px-4 py-2 text-sm text-gray-900 hover:bg-gray-50">
                <div className="col-span-4">
                  {employe.employe}
                </div>
                <div className="col-span-4 text-gray-700">
                  {employe.fonction}
                </div>
                <div className="col-span-3 text-gray-700">
                  {employe.equipement}
                </div>
                <div className="col-span-1 flex justify-end">
                  <button
                    onClick={() => handleRemoveEmployeFromEquipe(equipe.id, employe.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Retirer de l'équipe"
                  >
                    <FaTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderEquipes = () => {
    if (!equipes || equipes.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <FaUsers className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune équipe</h3>
          <p className="mt-1 text-sm text-gray-500">Commencez par créer une nouvelle équipe.</p>
          <div className="mt-6">
            <button
              onClick={() => handleAdd("equipes")}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaPlus className="mr-2 h-5 w-5" />
              Nouvelle équipe
            </button>
          </div>
        </div>
      );
    }
  };

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
      fetchActivites(selectedProject.ID);
      fetchEquipes(selectedProject.ID);
    }
  }, [
    selectedProject,
    fetchActivites,
    fetchLieux,
    fetchFonctions,
    fetchEquipements,
    fetchSousTraitants,
    fetchMateriaux,
    fetchEmployes,
    fetchEquipes,
  ]);

  useEffect(() => {
    loadProjectData();
  }, [loadProjectData]);

  useEffect(() => {
    if (selectedProject && lieux && lieux.length > 0) {
      // Charger les bases pour chaque lieu
      lieux.forEach((lieu) => {
        fetchBases(lieu.id);
      });
    }
  }, [selectedProject, lieux, fetchBases]);

  if (!selectedProject) {
    return <div>Veuillez sélectionner un projet.</div>;
  }

  const handleAdd = (category: string, lieuId?: number) => {
    setCurrentCategory(category);
    setCurrentItem(lieuId ? { lieuId } : null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: string, item: Lieu | Activite | Materiau | SousTraitant | Equipement | Fonction | Employe | TabEquipeChantier) => {
    if (category === "employes") {
      const employeeItem = item as Employe;
      const matchedFonction = fonctions?.find(
        (f) => f.nom.trim() === employeeItem.fonction?.nom.trim()
      );
      const matchedEquipement = equipements?.find(
        (e) => e.nom.trim() === employeeItem.equipement?.nom.trim()
      );

      const updatedItem = {
        ...employeeItem,
        fonction: matchedFonction || { id: null, nom: "Non spécifié" },
        equipement: matchedEquipement || { id: null, nom: "Non spécifié" },
      };

      setCurrentItem(updatedItem);
    } else {
      setCurrentItem(item);
    }
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
    if (!selectedProject) return;

    try {
      if (currentCategory === "employesEquipe") {
        // Ajouter des employés à une équipe existante
        const equipeId = currentItem;
        if (item.selectedEmployes && Array.isArray(item.selectedEmployes)) {
          for (const employe of item.selectedEmployes) {
            await addEmployeToEquipe(equipeId, employe.id);
          }
        }
        await fetchEquipes(selectedProject.ID);
      } else if (currentCategory === "equipes") {
        console.log("Création/Modification d'équipe - Données envoyées:", {
          nom: item.nom,
          projetId: selectedProject.ID,
          id: item.id || undefined
        });

        const equipeResponse = await createOrUpdateEquipeChantier({
          nom: item.nom,
          projetId: selectedProject.ID,
          id: item.id
        });

        console.log("Réponse création/modification équipe:", equipeResponse);

        // Si des employés sont sélectionnés, les ajouter à l'équipe
        if (item.selectedEmployes && item.selectedEmployes.length > 0) {
          console.log("Ajout des employés à l'équipe:", item.selectedEmployes);
          const equipeId = equipeResponse.id || item.id;
          
          for (const employe of item.selectedEmployes) {
            console.log("Ajout de l'employé à l'équipe:", {
              equipeId: equipeId,
              employeId: employe.id
            });
            await addEmployeToEquipe(equipeId, employe.id);
          }
        }

        await fetchEquipes(selectedProject.ID);
      } else {
        await performAction(currentCategory!, "save", item);
      }
      
      setIsModalOpen(false);
      setCurrentItem(null);
    } catch (error) {
      console.error("Failed to submit form:", error);
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
    if (!selectedProject) return;

    try {
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

        case "activites":
          if (action === "save") {
            console.log("item", item);
            await createOrUpdateActivite(item.nom, selectedProject.ID, item.id);
          } else {
            await deleteActivite(item.id);
          }
          await fetchActivites(selectedProject.ID);
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
            await fetchBases(item.lieuId);
          } else {
            await deleteBase(item.id);
            if (item.lieuId) {
              await fetchBases(item.lieuId);
            }
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

        case "equipes":
          if (action === "save") {
            await createOrUpdateEquipeChantier({
              nom: item.nom,
              projetId: selectedProject.ID,
              id: item.id ?? 0,
            });
          } else {
            await deleteEquipeChantier(item.id);
          }
          await fetchEquipes(selectedProject.ID);
          break;

        default:
          throw new Error("Unknown category");
      }
    } catch (error) {
      console.error(`Error performing ${action} on ${category}:`, error);
      throw error;
    }
  };

  const handleRemoveEmployeFromEquipe = async (equipeId: number, employeId: number) => {
    try {
      await removeEmployeFromEquipe(equipeId, employeId);
      // Rafraîchir la liste des équipes après la suppression
      if (selectedProject) {
        await fetchEquipes(selectedProject.ID);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'employé de l'équipe:", error);
    }
  };

  const formattedEmployeeList = employees?.map((employee) => ({
    ...employee,
    employe: `${employee.prenom} ${employee.nom}`,
    fonction: employee.fonction?.nom || "Non spécifié",
    equipement: employee.equipement?.nom || "Non spécifié",
  }));

  const formattedFonctions = fonctions
    ?.filter((f) => f.id !== null) // Filter out null values
    .map((f) => ({
      id: f.id as number, // Assert the type to number
      nom: f.nom,
    }));

  const formattedEquipements = equipements
    ?.filter((e) => e.id !== null) // Filter out items with null id
    .map((e) => ({
      id: e.id as number, // Assert the type to number
      nom: e.nom,
    }));

  const categories: CategoryItem[] = [
    {
      name: "Lieux",
      icon: <FaMapMarkerAlt />,
      items: lieux || [],
      columns: ["nom"],
      onAdd: () => handleAdd("lieux"),
      onEdit: (item: Lieu) => handleEdit("lieux", item),
      onDelete: (id: number, item: Lieu) => {
        handleDelete("lieux", id, item.nom);
      },
      renderSubItems: renderLocalisations,
      onDistances: () => {
        setSelectedLieu(lieux?.[0]?.id || null);
        setIsDistanceModalOpen(true);
      },
      onImportExcel: handleImportExcel,
    },
    {
      name: "Activités",
      icon: <FaClipboardList />,
      items: activites || [],
      columns: ["nom"],
      onAdd: () => handleAdd("activites"),
      onEdit: (item: Activite) => handleEdit("activites", item),
      onDelete: (id: number, item: Activite) => {
        handleDelete("activites", id, item.nom);
      },
    },
    {
      name: "Matériaux",
      icon: <FaBoxes />,
      items: materiaux || [],
      columns: ["nom"],
      onAdd: () => handleAdd("materiaux"),
      onEdit: (item: Materiau) => handleEdit("materiaux", item),
      onDelete: (id: number, item: Materiau) => {
        handleDelete("materiaux", id, item.nom);
      },
    },
    {
      name: "Sous-traitants",
      icon: <FaPeopleCarry />,
      items: sousTraitants || [],
      columns: ["nom"],
      onAdd: () => handleAdd("sousTraitants"),
      onEdit: (item: SousTraitant) => handleEdit("sousTraitants", item),
      onDelete: (id: number, item: SousTraitant) => {
        handleDelete("sousTraitants", id, item.nom);
      },
    },
    {
      name: "Équipements",
      icon: <FaTools />,
      items: formattedEquipements || [],
      columns: ["nom"],
      onAdd: () => handleAdd("equipements"),
      onEdit: (item: Equipement) => handleEdit("equipements", item),
      onDelete: (id: number, item: Equipement) => {
        handleDelete("equipements", id, item.nom);
      },
    },
    {
      name: "Fonctions",
      icon: <FaBriefcase />,
      items: formattedFonctions || [],
      columns: ["nom"],
      onAdd: () => handleAdd("fonctions"),
      onEdit: (item: Fonction) => handleEdit("fonctions", item),
      onDelete: (id: number, item: Fonction) => {
        handleDelete("fonctions", id, item.nom);
      },
    },
    {
      name: "Employés",
      icon: <FaUser />,
      items: formattedEmployeeList || [],
      columns: ["employe", "fonction", "equipement"],
      onEdit: (item: Employe) => handleEdit("employes", item),
      onDelete: (_id: number) => {
        throw new Error("Function not implemented.");
      },
      onAdd: function (): void {
        throw new Error("Function not implemented.");
      }
    },
    {
      name: "Équipes",
      icon: <FaUsers />,
      items: equipes?.map(equipe => ({
        ...equipe,
        nom: `${equipe.nom} (${equipe.employes?.length || 0})`
      })) || [],
      columns: ["nom"],
      onAdd: () => handleAdd("equipes"),
      onEdit: (item: TabEquipeChantier) => handleEdit("equipes", item),
      onDelete: (id: number, item: TabEquipeChantier) => {
        handleDelete("equipes", id, item.nom);
      },
      renderSubItems: renderEmployesEquipe
    },
  ];

  const handleCategoryClick = (categoryName: string) => {
    const category = categories.find((c) => c.name === categoryName);
    if (category) {
      setCurrentCategory(categoryName);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-center bg-blue-800 text-white p-4 rounded">
        Gestion des Ressources
      </h1>

      {categories.map((category) => (
        <div key={category.name} className="mt-6">
          <ResourceTable
            title={category.name}
            icon={category.icon}
            items={category.items}
            columns={category.columns}
            onAdd={category.onAdd}
            onEdit={category.onEdit}
            onDelete={category.onDelete}
            renderSubItems={category.renderSubItems}
            onDistances={category.onDistances}
            onImportExcel={category.onImportExcel}
          />
        </div>
      ))}

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
          employees={employees || []}
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
      {renderEquipes()}
    </div>
  );
};

export default Gestion;
