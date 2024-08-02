import React, { useState } from "react";
import {
  FaBoxes,
  FaMapMarkerAlt,
  FaPeopleCarry,
  FaTools,
  FaBriefcase,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaTimes,
  FaUserTie,
} from "react-icons/fa";
import { Materiau, SousTraitant, User } from "../../../models/JournalFormModel";

const mockMateriaux: Materiau[] = [
  { id: 1, nom: "Béton", quantite: 100 },
  { id: 2, nom: "Acier", quantite: 50 },
  { id: 3, nom: "Bois", quantite: 200 },
];

const mockSousTraitants: SousTraitant[] = [
  { id: 1, nom: "Entreprise A", quantite: 5 },
  { id: 2, nom: "Entreprise B", quantite: 3 },
  { id: 3, nom: "Entreprise C", quantite: 4 },
];

const mockEmployes: User[] = [
  {
    id: 1,
    nom: "Dupont",
    prenom: "Jean",
    fonction: "Ingénieur",
    equipement: "Casque",
  },
  {
    id: 2,
    nom: "Martin",
    prenom: "Paul",
    fonction: "Ouvrier",
    equipement: "Gants",
  },
  {
    id: 3,
    nom: "Boka",
    prenom: "Miguel",
    fonction: "Ouvrier",
    equipement: "Gants",
  },
];

const mockLocalisations: string[] = ["Site A", "Site B", "Site C"];
const mockLieux: string[] = ["Lieu A", "Lieu B", "Lieu C"];
const mockFonctions: string[] = ["Ingénieur", "Ouvrier", "Chef de projet"];
const mockEquipements: string[] = ["Casque", "Gants", "Veste de sécurité"];
const mockAxes: string[] = ["Axe A", "Axe B", "Axe C"];

const Gestion: React.FC = () => {
  const [materiaux, setMateriaux] = useState<Materiau[]>(mockMateriaux);
  const [sousTraitants, setSousTraitants] =
    useState<SousTraitant[]>(mockSousTraitants);
  const [employes, setEmployes] = useState<User[]>(mockEmployes);
  const [localisations, setLocalisations] =
    useState<string[]>(mockLocalisations);
  const [lieux, setLieux] = useState<string[]>(mockLieux);
  const [fonctions, setFonctions] = useState<string[]>(mockFonctions);
  const [equipements, setEquipements] = useState<string[]>(mockEquipements);
  const [axes, setAxes] = useState<string[]>(mockAxes);

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

  const handleDelete = (category: string, id: number) => {
    // Logic to handle deleting an item
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCurrentCategory(null);
    setCurrentItem(null);
  };

  const handleModalSubmit = (item: any) => {
    // Logic to handle form submission
    handleModalClose();
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-center bg-blue-800 text-white p-4 rounded">
        Gestion des Ressources
      </h1>

      <div className="grid grid-cols-1 gap-4">
        <ResourceTable
          title="Matériaux"
          icon={<FaBoxes />}
          items={materiaux}
          columns={["Nom", "Quantité"]}
          onAdd={() => handleAdd("materiaux")}
          onEdit={(item) => handleEdit("materiaux", item)}
          onDelete={(id) => handleDelete("materiaux", id)}
        />
        <ResourceTable
          title="Localisations"
          icon={<FaMapMarkerAlt />}
          items={localisations.map((loc, id) => ({ id, nom: loc }))}
          columns={["Nom"]}
          onAdd={() => handleAdd("localisations")}
          onEdit={(item) => handleEdit("localisations", item)}
          onDelete={(id) => handleDelete("localisations", id)}
        />
        <ResourceTable
          title="Lieux"
          icon={<FaMapMarkerAlt />}
          items={lieux.map((lieu, id) => ({ id, nom: lieu }))}
          columns={["Nom"]}
          onAdd={() => handleAdd("lieux")}
          onEdit={(item) => handleEdit("lieux", item)}
          onDelete={(id) => handleDelete("lieux", id)}
        />
        <ResourceTable
          title="Sous-traitants"
          icon={<FaPeopleCarry />}
          items={sousTraitants}
          columns={["Nom", "Quantité"]}
          onAdd={() => handleAdd("sousTraitants")}
          onEdit={(item) => handleEdit("sousTraitants", item)}
          onDelete={(id) => handleDelete("sousTraitants", id)}
        />
        <ResourceTable
          title="Équipements"
          icon={<FaTools />}
          items={equipements.map((equip, id) => ({ id, nom: equip }))}
          columns={["Nom"]}
          onAdd={() => handleAdd("equipements")}
          onEdit={(item) => handleEdit("equipements", item)}
          onDelete={(id) => handleDelete("equipements", id)}
        />
        <ResourceTable
          title="Fonctions"
          icon={<FaBriefcase />}
          items={fonctions.map((fonction, id) => ({ id, nom: fonction }))}
          columns={["Nom"]}
          onAdd={() => handleAdd("fonctions")}
          onEdit={(item) => handleEdit("fonctions", item)}
          onDelete={(id) => handleDelete("fonctions", id)}
        />
        <ResourceTable
          title="Axes"
          icon={<FaBriefcase />}
          items={axes.map((axe, id) => ({ id, nom: axe }))}
          columns={["Nom"]}
          onAdd={() => handleAdd("axes")}
          onEdit={(item) => handleEdit("axes", item)}
          onDelete={(id) => handleDelete("axes", id)}
        />
        <ResourceTable
          title="Employés"
          icon={<FaUserTie />}
          items={employes}
          columns={["Nom", "Fonction"]}
          onAdd={() => handleAdd("employes")}
          onEdit={(item) => handleEdit("employes", item)}
          onDelete={(id) => handleDelete("employes", id)}
        />
      </div>

      {isModalOpen && (
        <Modal
          category={currentCategory}
          item={currentItem}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
        />
      )}
    </div>
  );
};

interface ResourceTableProps {
  title: string;
  icon: React.ReactNode;
  items: any[];
  columns: string[];
  onAdd: () => void;
  onEdit: (item: any) => void;
  onDelete: (id: number) => void;
}

const ResourceTable: React.FC<ResourceTableProps> = ({
  title,
  icon,
  items,
  columns,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredItems = items.filter((item) =>
    columns.some((column) =>
      item[column.toLowerCase()]
        ?.toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center space-x-2">
          {icon}
          <span>{title}</span>
        </h2>
        <button
          onClick={onAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          <FaPlus />
        </button>
      </div>
      <div className="flex mb-4">
        <FaSearch className="mr-2" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded-lg shadow-sm border-gray-300"
        />
      </div>
      <table className="min-w-full bg-white border rounded-lg shadow-md">
        <thead className="bg-gray-300 text-black">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-2 border">
                {column}
              </th>
            ))}
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item) => (
            <tr key={item.id}>
              {columns.map((column) => (
                <td key={column} className="px-4 py-2 border">
                  {item[column.toLowerCase()]}
                </td>
              ))}
              <td className="px-4 py-2 border flex justify-around">
                <button onClick={() => onEdit(item)} className="text-blue-600">
                  <FaEdit />
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="text-red-600"
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface ModalProps {
  category: string | null;
  item: any;
  onClose: () => void;
  onSubmit: (item: any) => void;
}

const Modal: React.FC<ModalProps> = ({ category, item, onClose, onSubmit }) => {
  const [formState, setFormState] = useState<any>(item || {});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prevState: any) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formState);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {item ? "Modifier" : "Ajouter"} {category}
          </h2>
          <FaTimes className="cursor-pointer" onClick={onClose} />
        </div>
        <form onSubmit={handleSubmit}>
          {Object.keys(formState).map((key) => (
            <div className="mb-4" key={key}>
              <label className="block mb-1">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
              <input
                type="text"
                name={key}
                value={formState[key] || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg shadow-sm border-gray-300"
              />
            </div>
          ))}
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {item ? "Modifier" : "Ajouter"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Gestion;
