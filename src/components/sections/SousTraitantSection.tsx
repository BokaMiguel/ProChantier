import React, { useState } from "react";
import { FaCubes, FaTimes, FaPlusCircle, FaBuilding } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

interface SousTraitant {
  id: number;
  nom: string;
  quantite: number;
}

interface SousTraitantSectionProps {
  sousTraitants: SousTraitant[];
  setSousTraitants: React.Dispatch<React.SetStateAction<SousTraitant[]>>;
}

const SousTraitantSection: React.FC<SousTraitantSectionProps> = ({
  sousTraitants,
  setSousTraitants,
}) => {
  const { sousTraitants: contextSousTraitants } = useAuth();
  const [nextId, setNextId] = useState(sousTraitants.length + 1);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sousTraitantToDelete, setSousTraitantToDelete] = useState<
    number | null
  >(null);

  const handleAddSousTraitant = () => {
    const newSousTraitant: SousTraitant = {
      id: nextId,
      nom: "",
      quantite: 0,
    };
    setSousTraitants((prevSousTraitants) => [
      ...prevSousTraitants,
      newSousTraitant,
    ]);
    setNextId(nextId + 1);
  };

  const handleChange = (
    id: number,
    field: keyof SousTraitant,
    value: string | number
  ) => {
    const updatedSousTraitants = sousTraitants.map((sousTraitant) => {
      if (sousTraitant.id === id) {
        return { ...sousTraitant, [field]: value };
      }
      return sousTraitant;
    });
    setSousTraitants(updatedSousTraitants);
  };

  const confirmDeleteSousTraitant = (id: number) => {
    setSousTraitantToDelete(id);
    setShowConfirm(true);
  };

  const handleDeleteSousTraitant = () => {
    if (sousTraitantToDelete !== null) {
      setSousTraitants((prevSousTraitants) =>
        prevSousTraitants.filter(
          (sousTraitant) => sousTraitant.id !== sousTraitantToDelete
        )
      );
      setShowConfirm(false);
      setSousTraitantToDelete(null);
    }
  };

  const renderSousTraitants = () => {
    return sousTraitants.map((sousTraitant, index) => (
      <div
        key={sousTraitant.id}
        className="border rounded p-4 mb-4 shadow-md flex flex-col space-y-4 relative"
      >
        <div className="grid grid-cols-12 gap-4 items-center">
          <label className="col-span-3 flex items-center">
            <FaBuilding className="mr-2" />
            Sous-traitant:
          </label>
          <select
            value={sousTraitant.nom}
            onChange={(e) =>
              handleChange(sousTraitant.id, "nom", e.target.value)
            }
            className="col-span-6 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">Sélectionner un sous-traitant</option>
            {contextSousTraitants?.map((st, index) => (
              <option key={index} value={st.nom}>
                {st.nom}
              </option>
            ))}
          </select>
          <div className="col-span-2 flex items-center">
            <FaCubes className="mr-2" />
            <input
              type="number"
              placeholder="Quantité"
              value={sousTraitant.quantite}
              onChange={(e) =>
                handleChange(
                  sousTraitant.id,
                  "quantite",
                  parseFloat(e.target.value) || 0
                )
              }
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          {index > 0 && (
            <button
              onClick={() => confirmDeleteSousTraitant(sousTraitant.id)}
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
      {renderSousTraitants()}
      <button
        onClick={handleAddSousTraitant}
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
                onClick={handleDeleteSousTraitant}
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
