import React, { useState, useEffect } from "react";
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
  defaultEntrepriseId?: number;
}

const SousTraitantSection: React.FC<SousTraitantSectionProps> = ({
  sousTraitants,
  setSousTraitants,
  defaultEntrepriseId,
}) => {
  const { sousTraitants: contextSousTraitants } = useAuth();
  const [nextId, setNextId] = useState(sousTraitants.length + 1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sousTraitantToDelete, setSousTraitantToDelete] = useState<number | null>(null);

  // Assurer qu'il y a toujours au moins un sous-traitant
  useEffect(() => {
    if (sousTraitants.length === 0) {
      handleAddSousTraitant();
    }
  }, []);

  // Sélectionner le sous-traitant par défaut
  useEffect(() => {
    if (defaultEntrepriseId && contextSousTraitants && sousTraitants.length > 0) {
      const defaultSousTraitant = contextSousTraitants.find(st => st.id === defaultEntrepriseId);
      
      if (defaultSousTraitant && sousTraitants[0].nom === "") {
        const updatedSousTraitants = sousTraitants.map((st, index) => 
          index === 0 ? { ...st, nom: defaultSousTraitant.nom } : st
        );
        setSousTraitants(updatedSousTraitants);
      }
    }
  }, [defaultEntrepriseId, contextSousTraitants]);

  const handleAddSousTraitant = () => {
    const newSousTraitant: SousTraitant = {
      id: nextId,
      nom: "",
      quantite: 0,
    };
    setSousTraitants([...sousTraitants, newSousTraitant]);
    setNextId(nextId + 1);
  };

  const handleChange = (id: number, field: keyof SousTraitant, value: any) => {
    setSousTraitants(prevSousTraitants => 
      prevSousTraitants.map(st =>
        st.id === id ? { ...st, [field]: value } : st
      )
    );
  };

  const requestDeleteSousTraitant = (id: number) => {
    setSousTraitantToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteSousTraitant = () => {
    if (sousTraitantToDelete !== null && sousTraitants.length > 1) {
      setSousTraitants(sousTraitants.filter((st) => st.id !== sousTraitantToDelete));
    }
    setShowDeleteConfirm(false);
    setSousTraitantToDelete(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="space-y-6">
        {sousTraitants.map((sousTraitant) => (
          <div
            key={sousTraitant.id}
            className="bg-white rounded-lg border border-gray-200 p-6 relative transition-all duration-200 hover:shadow-md"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8">
                <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
                  <span className="bg-blue-100 p-2 rounded-full mr-2">
                    <FaBuilding className="text-blue-600" />
                  </span>
                  Sous-traitant
                </label>
                <select
                  value={sousTraitant.nom || ""}
                  onChange={(e) => handleChange(sousTraitant.id, "nom", e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Sélectionner un sous-traitant</option>
                  {contextSousTraitants?.map((st) => (
                    <option key={st.id} value={st.nom}>
                      {st.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
                  <span className="bg-blue-100 p-2 rounded-full mr-2">
                    <FaCubes className="text-blue-600" />
                  </span>
                  Quantité
                </label>
                <input
                  type="number"
                  value={sousTraitant.quantite || 0}
                  onChange={(e) =>
                    handleChange(sousTraitant.id, "quantite", parseInt(e.target.value))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  min="0"
                  step="1"
                />
              </div>
            </div>

            {sousTraitants.length > 1 && (
              <button
                onClick={() => requestDeleteSousTraitant(sousTraitant.id)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors duration-200"
                title="Supprimer le sous-traitant"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}

        <button
          onClick={handleAddSousTraitant}
          className="w-full mt-4 py-3 px-4 bg-blue-50 text-blue-600 rounded-lg border-2 border-blue-100 hover:bg-blue-100 transition-all duration-200 flex items-center justify-center font-medium"
        >
          <FaPlusCircle className="mr-2" />
          Ajouter un sous-traitant
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirmation</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer ce sous-traitant ?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Annuler
              </button>
              <button
                onClick={confirmDeleteSousTraitant}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
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
