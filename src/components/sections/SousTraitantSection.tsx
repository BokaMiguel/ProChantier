import React, { useState } from "react";
import { FaCubes, FaTimes, FaPlusCircle, FaBuilding } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext"; // Importez votre contexte

interface Materiau {
  id: number;
  nom: string;
  quantite: number;
}

const initialMateriau: Materiau = {
  id: 1,
  nom: "",
  quantite: 0,
};

const SousTraitantSection: React.FC = () => {
  const { sousTraitants: contextSousTraitants } = useAuth(); // Récupérez les sous-traitants du contexte
  const [materiaux, setMateriaux] = useState<Materiau[]>([initialMateriau]);
  const [nextId, setNextId] = useState(2);
  const [showConfirm, setShowConfirm] = useState(false);
  const [materiauToDelete, setMateriauToDelete] = useState<number | null>(null);

  const handleAddMateriau = () => {
    const newMateriau: Materiau = {
      id: nextId,
      nom: "",
      quantite: 0,
    };
    setMateriaux((prevMateriaux) => [...prevMateriaux, newMateriau]);
    setNextId(nextId + 1);
  };

  const handleChange = (
    id: number,
    field: keyof Materiau,
    value: string | number
  ) => {
    const updatedMateriaux = materiaux.map((materiau) => {
      if (materiau.id === id) {
        return { ...materiau, [field]: value };
      }
      return materiau;
    });
    setMateriaux(updatedMateriaux);
  };

  const confirmDeleteMateriau = (id: number) => {
    setMateriauToDelete(id);
    setShowConfirm(true);
  };

  const handleDeleteMateriau = () => {
    if (materiauToDelete !== null) {
      setMateriaux((prevMateriaux) =>
        prevMateriaux.filter((materiau) => materiau.id !== materiauToDelete)
      );
      setShowConfirm(false);
      setMateriauToDelete(null);
    }
  };

  const renderMateriaux = () => {
    return materiaux.map((materiau, index) => (
      <div
        key={materiau.id}
        className="border rounded p-4 mb-4 shadow-md flex flex-col space-y-4 relative"
      >
        <div className="grid grid-cols-12 gap-4 items-center">
          <label className="col-span-3 flex items-center">
            <FaBuilding className="mr-2" />
            Sous-traitant:
          </label>
          <select
            value={materiau.nom}
            onChange={(e) => handleChange(materiau.id, "nom", e.target.value)}
            className="col-span-6 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">Sélectionner un sous-traitant</option>
            {contextSousTraitants?.map((nom, index) => (
              <option key={index} value={nom.nom}>
                {nom.nom}
              </option>
            ))}
          </select>
          <div className="col-span-2 flex items-center">
            <FaCubes className="mr-2" />
            <input
              type="number"
              placeholder="Quantité"
              value={materiau.quantite}
              onChange={(e) =>
                handleChange(
                  materiau.id,
                  "quantite",
                  parseFloat(e.target.value) || 0
                )
              }
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          {index > 0 && (
            <button
              onClick={() => confirmDeleteMateriau(materiau.id)}
              className="absolute top-2 right-2 text-zinc-500 hover:text-red-700"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>
    ));
  };

  return (
    <div className="p-4 w-full space-y-4">
      {renderMateriaux()}
      <button
        onClick={handleAddMateriau}
        className="w-full py-2 px-4 bg-blue-500 text-white rounded shadow flex items-center justify-center"
      >
        <FaPlusCircle className="mr-2" />
        Ajouter un sous-traitant
      </button>

      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Confirmer la Suppression</h3>
            <p>Êtes-vous sûr de vouloir supprimer ce sous-traitant?</p>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="py-2 px-4 bg-gray-500 text-white rounded shadow"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteMateriau}
                className="py-2 px-4 bg-red-500 text-white rounded shadow"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SousTraitantSection;
