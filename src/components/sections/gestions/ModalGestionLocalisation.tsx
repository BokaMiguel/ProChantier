import React, { useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaTimes,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaRuler,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { Localisation } from "../../../models/JournalFormModel";
import {
  getDistancesForLieu,
  createOrUpdateDistance,
  deleteDistance,
} from "../../../services/JournalService";

interface ModalGestionLocalisationProps {
  onClose: () => void;
  lieuId: number | null;
  bases: Localisation[];
  lieux: any[];
  onLieuChange: (lieuId: number) => void;
}

const ModalGestionLocalisation: React.FC<ModalGestionLocalisationProps> = ({
  onClose,
  lieuId,
  bases,
  lieux,
  onLieuChange,
}) => {
  const [distances, setDistances] = useState<any[]>([]);
  const [editingDistance, setEditingDistance] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    if (lieuId !== null) {
      fetchDistances();
    }
  }, [lieuId, bases]);

  const fetchDistances = async () => {
    try {
      const data = await getDistancesForLieu(lieuId!);
      const mappedDistances = data.map((distance: any) => ({
        ...distance,
        baseAName:
          bases.find((base) => base.id === distance.baseA)?.base || "N/A",
        baseBName:
          bases.find((base) => base.id === distance.baseB)?.base || "N/A",
      }));
      setDistances(mappedDistances);
    } catch (error) {
      console.error("Failed to fetch distances:", error);
    }
  };

  const handleAddOrEditDistance = async (distance: any) => {
    try {
      await createOrUpdateDistance(
        distance.baseA,
        distance.baseB,
        distance.distanceInMeters,
        lieuId!,
        distance.id
      );
      setEditingDistance(null);
      fetchDistances();
    } catch (error) {
      console.error("Failed to add or edit distance:", error);
    }
  };

  const handleDeleteDistance = async (id: number) => {
    try {
      await deleteDistance(id);
      fetchDistances();
    } catch (error) {
      console.error("Failed to delete distance:", error);
    }
  };

  const handleLieuChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLieuId = parseInt(e.target.value, 10);
    onLieuChange(selectedLieuId);
  };

  const filteredDistances = distances.filter((distance) =>
    [distance.baseAName, distance.baseBName, distance.distanceInMeters]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (editingDistance) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
          <div className="flex justify-between items-center mb-4 bg-blue-800 p-3 rounded w-full">
            <FaArrowLeft
              className="cursor-pointer text-white"
              onClick={() => setEditingDistance(null)}
            />
            <h2 className="text-xl font-semibold text-white text-center w-full">
              {editingDistance.id ? "Modifier Distance" : "Ajouter Distance"}
            </h2>
            <div className="w-6"></div>{" "}
            {/* Placeholder to keep the text centered */}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddOrEditDistance(editingDistance);
            }}
          >
            <div className="mb-4">
              <label className="block mb-1 text-gray-700">Base A</label>
              <select
                value={editingDistance.baseA || ""}
                onChange={(e) =>
                  setEditingDistance((prev: any) => ({
                    ...prev,
                    baseA: parseInt(e.target.value, 10),
                  }))
                }
                className="w-full px-4 py-2 rounded-lg shadow-sm border-gray-300"
              >
                <option value="">Sélectionner une base</option>
                {bases
                  .filter((base) => base.id !== editingDistance.baseB) // Exclude selected Base B
                  .map((base) => (
                    <option key={base.id} value={base.id}>
                      {base.base}
                    </option>
                  ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-1 text-gray-700">Base B</label>
              <select
                value={editingDistance.baseB || ""}
                onChange={(e) =>
                  setEditingDistance((prev: any) => ({
                    ...prev,
                    baseB: parseInt(e.target.value, 10),
                  }))
                }
                className="w-full px-4 py-2 rounded-lg shadow-sm border-gray-300"
              >
                <option value="">Sélectionner une base</option>
                {bases
                  .filter((base) => base.id !== editingDistance.baseA) // Exclude selected Base A
                  .map((base) => (
                    <option key={base.id} value={base.id}>
                      {base.base}
                    </option>
                  ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-1 text-gray-700">
                Distance (Mètres)
              </label>
              <input
                type="number"
                value={editingDistance.distanceInMeters}
                onChange={(e) =>
                  setEditingDistance((prev: any) => ({
                    ...prev,
                    distanceInMeters: parseFloat(e.target.value),
                  }))
                }
                className="w-full px-4 py-2 rounded-lg shadow-sm border-gray-300 bg-gray-200"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"
              >
                <FaPlus className="mr-2" />
                {editingDistance.id ? "Modifier" : "Ajouter"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4 bg-blue-800 p-3 rounded w-full">
          <h2 className="text-xl font-semibold text-white text-center flex-grow">
            Gestion des Distances
          </h2>
          <FaTimes className="cursor-pointer text-white" onClick={onClose} />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-gray-700">
            Sélectionner un lieu
          </label>
          <select
            value={lieuId || ""}
            onChange={handleLieuChange}
            className="w-full px-4 py-2 rounded-lg shadow-sm border-gray-300"
          >
            {lieux.map((lieu) => (
              <option key={lieu.id} value={lieu.id}>
                {lieu.nom}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4 flex items-center">
          <FaSearch className="mr-2 text-gray-600" />
          <input
            type="text"
            placeholder="Rechercher une distance ou une base..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg shadow-sm border-gray-300"
          />
        </div>

        <button
          onClick={() =>
            setEditingDistance({
              baseA: null,
              baseB: null,
              distanceInMeters: 0,
            })
          }
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center mb-4"
        >
          <FaPlus className="mr-2" />
          Ajouter Distance
        </button>

        <table className="min-w-full bg-white border rounded-lg shadow-md mb-4">
          <thead className="bg-blue-800 text-white">
            <tr>
              <th className="px-4 py-2 border">
                <div className="flex items-center justify-center">
                  <FaMapMarkerAlt className="mr-1" />
                  Base A
                </div>
              </th>
              <th className="px-4 py-2 border">
                <div className="flex items-center justify-center">
                  <FaMapMarkerAlt className="mr-1" />
                  Base B
                </div>
              </th>
              <th className="px-4 py-2 border">
                <div className="flex items-center justify-center">
                  <FaRuler className="mr-1" />
                  Distance (M)
                </div>
              </th>
              <th className="px-4 py-2 border">
                <div className="flex items-center justify-center">Actions</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredDistances.map((distance, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
              >
                <td className="px-4 py-2 border">{distance.baseAName}</td>
                <td className="px-4 py-2 border">{distance.baseBName}</td>
                <td className="px-4 py-2 border">
                  {distance.distanceInMeters}
                </td>
                <td className="px-4 py-2 border text-center">
                  <button
                    onClick={() => setEditingDistance(distance)}
                    className="text-blue-600 mr-2"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteDistance(distance.id)}
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
    </div>
  );
};

export default ModalGestionLocalisation;
