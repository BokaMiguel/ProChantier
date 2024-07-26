import React, { useState } from "react";
import { FaToolbox, FaCubes, FaPlusCircle } from "react-icons/fa";

const mockMateriaux = ["Marteau", "Scie", "Clou", "Vis", "Perceuse"];

interface Materiel {
  id: number;
  type: string;
  quantite: number;
}

const initialMateriel: Materiel = {
  id: 1,
  type: "",
  quantite: 1,
};

const MateriauxInfo: React.FC = () => {
  const [materiaux, setMateriaux] = useState<Materiel[]>(
    Array.from({ length: 10 }, (_, i) => ({ ...initialMateriel, id: i + 1 }))
  );

  const [nextId, setNextId] = useState(11);

  const handleChange = (
    id: number,
    field: keyof Materiel,
    value: string | number
  ) => {
    const updatedMateriaux = materiaux.map((materiel) => {
      if (materiel.id === id) {
        return { ...materiel, [field]: value };
      }
      return materiel;
    });
    setMateriaux(updatedMateriaux);
  };

  const handleAddMateriel = () => {
    const newMateriel: Materiel = {
      id: nextId,
      type: "",
      quantite: 1,
    };
    setMateriaux((prevMateriaux) => [...prevMateriaux, newMateriel]);
    setNextId(nextId + 1);
  };

  const renderMateriaux = () => {
    return materiaux.map((materiel) => (
      <div
        key={materiel.id}
        className="border rounded p-4 mb-4 shadow-md flex flex-col space-y-4 relative"
      >
        <div className="grid grid-cols-12 gap-4 items-center">
          <label className="col-span-4 flex items-center">
            <FaToolbox className="mr-2" />
            Matériaux/Outillage:
          </label>
          <select
            value={materiel.type}
            onChange={(e) => handleChange(materiel.id, "type", e.target.value)}
            className="col-span-5 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">Sélectionner un matériau</option>
            {mockMateriaux.map((materiau, index) => (
              <option key={index} value={materiau}>
                {materiau}
              </option>
            ))}
          </select>
          <div className="col-span-3 flex items-center">
            <FaCubes className="mr-2" />
            <input
              type="number"
              placeholder="Quantité"
              value={materiel.quantite}
              onChange={(e) =>
                handleChange(
                  materiel.id,
                  "quantite",
                  parseFloat(e.target.value) || 0
                )
              }
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="p-4 w-full space-y-4">
      {renderMateriaux()}
      <button
        onClick={handleAddMateriel}
        className="w-full py-2 px-4 bg-blue-500 text-white rounded shadow flex items-center justify-center"
      >
        <FaPlusCircle className="mr-2" />
        Ajouter un matériau/outillage
      </button>
    </div>
  );
};

export default MateriauxInfo;
