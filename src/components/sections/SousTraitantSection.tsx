import React, { useState, useEffect } from "react";
import { FaCubes, FaTimes, FaPlusCircle, FaBuilding, FaTools, FaRuler } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { JournalActivite, ListUnite, SousTraitantFormData } from "../../models/JournalFormModel";

interface SousTraitantSectionProps {
  sousTraitants: SousTraitantFormData[];
  setSousTraitants: React.Dispatch<React.SetStateAction<SousTraitantFormData[]>>;
  defaultEntrepriseId?: number;
  planifActivites?: JournalActivite[];
}

const SousTraitantSection: React.FC<SousTraitantSectionProps> = ({
  sousTraitants,
  setSousTraitants,
  defaultEntrepriseId,
  planifActivites = [],
}) => {
  const { sousTraitants: contextSousTraitants, activites, unites } = useAuth();
  const [nextId, setNextId] = useState(-1); // Commencer avec des IDs négatifs pour les distinguer des vrais IDs
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sousTraitantToDelete, setSousTraitantToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (sousTraitants.length === 0) {
      handleAddSousTraitant();
    }
  }, []);

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
    const newSousTraitant: SousTraitantFormData = {
      id: nextId,
      nom: "",
      quantite: 0,
      activiteID: null,
      idUnite: null,
    };
    setSousTraitants([...sousTraitants, newSousTraitant]);
    setNextId(nextId - 1); // Décrémenter pour le prochain ID temporaire
  };

  const handleChange = (id: number, field: keyof SousTraitantFormData, value: any) => {
    setSousTraitants(prevSousTraitants => {
      return prevSousTraitants.map(st => {
        if (st.id === id) {
          // Si on change le nom du sous-traitant, on doit aussi mettre à jour l'ID
          if (field === 'nom' && value) {
            const selectedSousTraitant = contextSousTraitants?.find(cst => cst.nom === value);
            if (selectedSousTraitant) {
              return { 
                ...st, 
                [field]: value,
                id: selectedSousTraitant.id // Mettre à jour l'ID avec celui du sous-traitant sélectionné
              };
            }
          }
          return { ...st, [field]: value };
        }
        return st;
      });
    });
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

  const filteredActivites = activites?.filter(activite => 
    planifActivites.some(planifAct => planifAct.activiteID === activite.id)
  ) || [];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="space-y-6">
        {sousTraitants.map((sousTraitant) => (
          <div
            key={sousTraitant.id}
            className="bg-white rounded-lg border border-gray-200 p-6 relative transition-all duration-200 hover:shadow-md"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Sous-traitant */}
              <div className="md:col-span-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
                  <span className="bg-blue-100 p-2 rounded-full mr-2">
                    <FaBuilding className="text-blue-600" />
                  </span>
                  Sous-traitant
                </label>
                <select
                  value={contextSousTraitants?.find(st => st.id === sousTraitant.id)?.nom || ""}
                  onChange={(e) => {
                    const selectedNom = e.target.value;
                    const selectedSousTraitant = contextSousTraitants?.find(st => st.nom === selectedNom);
                    if (selectedSousTraitant) {
                      handleChange(sousTraitant.id, "id", selectedSousTraitant.id);
                      handleChange(sousTraitant.id, "nom", selectedSousTraitant.nom);
                    } else {
                      handleChange(sousTraitant.id, "nom", "");
                    }
                  }}
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

              {/* Activité */}
              <div className="md:col-span-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
                  <span className="bg-blue-100 p-2 rounded-full mr-2">
                    <FaTools className="text-blue-600" />
                  </span>
                  Activité
                </label>
                <select
                  value={sousTraitant.activiteID || ""}
                  onChange={(e) => handleChange(sousTraitant.id, "activiteID", e.target.value ? Number(e.target.value) : null)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Sélectionner une activité</option>
                  {filteredActivites.map((activite) => (
                    <option key={activite.id} value={activite.id}>
                      {activite.nom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantité et Unité */}
              <div className="md:col-span-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
                  <span className="bg-blue-100 p-2 rounded-full mr-2">
                    <FaRuler className="text-blue-600" />
                  </span>
                  Quantité
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={sousTraitant.quantite}
                    onChange={(e) => handleChange(sousTraitant.id, "quantite", parseFloat(e.target.value) || 0)}
                    className="mt-1 block w-2/3 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    min="0"
                    step="0.01"
                  />
                  <select
                    value={sousTraitant.idUnite || ""}
                    onChange={(e) => handleChange(sousTraitant.id, "idUnite", e.target.value ? Number(e.target.value) : null)}
                    className="mt-1 block w-1/3 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="">Unité</option>
                    {unites?.map((unite) => (
                      <option key={unite.idUnite} value={unite.idUnite}>
                        {unite.descriptionCourt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Bouton de suppression */}
            {sousTraitants.length > 1 && (
              <button
                onClick={() => requestDeleteSousTraitant(sousTraitant.id)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors duration-200"
              >
                <FaTimes />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Bouton d'ajout */}
      <div className="mt-4">
        <button
          onClick={handleAddSousTraitant}
          className="flex items-center justify-center w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FaPlusCircle className="mr-2" />
          Ajouter un sous-traitant
        </button>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Confirmer la suppression</h2>
            <p className="mb-6">Êtes-vous sûr de vouloir supprimer ce sous-traitant ?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
              <button
                onClick={confirmDeleteSousTraitant}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
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
