import React, { useState } from "react";
import { FaCubes, FaTimes, FaPlusCircle } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

interface Materiau {
  id: number;
  nom: string;
  quantite: number;
}

interface MateriauxInfoProps {
  materiaux: Materiau[];
  setMateriaux: React.Dispatch<React.SetStateAction<Materiau[]>>;
}

const MateriauxInfo: React.FC<MateriauxInfoProps> = ({
  materiaux,
  setMateriaux,
}) => {
  const { materiaux: contextMateriaux } = useAuth();
  const [nextId, setNextId] = useState(materiaux.length + 1);
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

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="space-y-6">
        {materiaux.map((materiau, index) => (
          <div
            key={materiau.id}
            className="bg-white rounded-lg border border-gray-200 p-6 relative transition-all duration-200 hover:shadow-md"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8">
                <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
                  <span className="bg-blue-100 p-2 rounded-full mr-2">
                    <FaCubes className="text-blue-600" />
                  </span>
                  Matériaux/Outillage
                </label>
                <select
                  value={materiau.nom}
                  onChange={(e) => handleChange(materiau.id, "nom", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Sélectionner un matériau</option>
                  {contextMateriaux?.map((item, idx) => (
                    <option key={idx} value={item.nom}>
                      {item.nom}
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
                  value={materiau.quantite}
                  onChange={(e) =>
                    handleChange(materiau.id, "quantite", parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  min="0"
                  step="1"
                />
              </div>
            </div>

            <button
              onClick={() => confirmDeleteMateriau(materiau.id)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors duration-200"
              title="Supprimer le matériau"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        ))}

        <button
          onClick={handleAddMateriau}
          className="w-full mt-4 py-3 px-4 bg-blue-50 text-blue-600 rounded-lg border-2 border-blue-100 hover:bg-blue-100 transition-all duration-200 flex items-center justify-center font-medium"
        >
          <FaPlusCircle className="mr-2" />
          Ajouter un matériau
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirmation</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer ce matériau ?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteMateriau}
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

export default MateriauxInfo;
