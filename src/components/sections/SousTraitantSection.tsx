import React, { useState, useEffect } from "react";
import { FaCubes, FaTimes, FaPlusCircle, FaBuilding, FaTools, FaRuler } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { JournalActivite, Unite, SousTraitantFormData } from "../../models/JournalFormModel";

interface SousTraitantSectionProps {
  sousTraitants: SousTraitantFormData[];
  setSousTraitants: React.Dispatch<React.SetStateAction<SousTraitantFormData[]>>;
  defaultEntrepriseId?: number;
  planifActivites?: any[]; // Utiliser any[] pour accepter n'importe quel format d'activités
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

  // Déboguer les données reçues
  useEffect(() => {
    console.log("SousTraitantSection - planifActivites reçues:", planifActivites);
    console.log("SousTraitantSection - sousTraitants actuels:", sousTraitants);
    console.log("SousTraitantSection - contextSousTraitants:", contextSousTraitants);
  }, [planifActivites, sousTraitants, contextSousTraitants]);

  // Initialiser les sous-traitants en fonction des activités planifiées
  useEffect(() => {
    if (planifActivites && planifActivites.length > 0) {
      // Filtrer les activités qui ont un sous-traitant associé
      const activitesWithSousTraitants = planifActivites.filter(act => 
        act.sousTraitantID !== null && act.sousTraitantID !== undefined && act.sousTraitantID > 0
      );
      
      console.log("Activités avec sous-traitants:", activitesWithSousTraitants);
      
      if (activitesWithSousTraitants.length > 0) {
        // Créer des sous-traitants basés sur les activités planifiées
        const newSousTraitants = activitesWithSousTraitants.map(act => {
          const sousTraitant = contextSousTraitants?.find(st => st.id === act.sousTraitantID);
          const activite = activites?.find(a => a.id === act.activiteID);
          
          return {
            id: act.sousTraitantID,
            nom: sousTraitant?.nom || "",
            quantite: act.quantite || 0,
            activiteID: act.activiteID,
            activiteNom: activite?.nom || "",
            idUnite: 1 // Unité par défaut
          } as SousTraitantFormData;
        });
        
        console.log("Nouveaux sous-traitants créés:", newSousTraitants);
        
        // Mettre à jour l'état des sous-traitants seulement si nous avons de nouvelles données
        if (newSousTraitants.length > 0) {
          // Si nous n'avons pas de sous-traitants ou seulement des sous-traitants vides
          if (sousTraitants.length === 0 || 
              (sousTraitants.length === 1 && (!sousTraitants[0].nom || sousTraitants[0].nom === ""))) {
            setSousTraitants(newSousTraitants);
          } 
          // Sinon, ajouter seulement les nouveaux sous-traitants qui ne sont pas déjà présents
          else {
            const existingSousTraitantIds = sousTraitants.map(st => st.id);
            const sousTraitantsToAdd = newSousTraitants.filter(
              st => !existingSousTraitantIds.includes(st.id)
            );
            
            if (sousTraitantsToAdd.length > 0) {
              setSousTraitants([...sousTraitants, ...sousTraitantsToAdd]);
            }
          }
        }
      } else if (sousTraitants.length === 0) {
        // Si aucun sous-traitant n'est défini dans les activités, en ajouter un vide
        handleAddSousTraitant();
      }
    } else if (sousTraitants.length === 0) {
      // Si aucune activité planifiée n'est définie, ajouter un sous-traitant vide
      handleAddSousTraitant();
    }
  }, [planifActivites, contextSousTraitants, activites]);

  const handleAddSousTraitant = () => {
    const newSousTraitant: SousTraitantFormData = {
      id: nextId,
      nom: "",
      quantite: 0,
      activiteID: null,
      idUnite: 1, // Définir l'unité par défaut à 1
    };
    setSousTraitants([...sousTraitants, newSousTraitant]);
    setNextId(nextId - 1); // Décrémenter pour le prochain ID temporaire
  };

  const handleChange = (index: number, field: keyof SousTraitantFormData, value: any) => {
    setSousTraitants(prevSousTraitants => {
      const updatedSousTraitants = [...prevSousTraitants];
      
      // Si on change le nom du sous-traitant, on doit aussi mettre à jour l'ID
      if (field === 'nom' && value) {
        const selectedSousTraitant = contextSousTraitants?.find(cst => cst.nom === value);
        if (selectedSousTraitant) {
          updatedSousTraitants[index] = { 
            ...updatedSousTraitants[index], 
            nom: value,
            id: selectedSousTraitant.id // Mettre à jour l'ID avec celui du sous-traitant sélectionné
          };
          console.log(`Sous-traitant sélectionné: Nom=${value}, ID=${selectedSousTraitant.id}`);
          return updatedSousTraitants;
        }
      }
      
      // Si on change l'activité, vérifier si cette activité a un sous-traitant associé
      if (field === 'activiteID' && value) {
        const activityId = Number(value);
        const planifActivity = planifActivites.find(act => act.activiteID === activityId);
        
        // Si l'activité a un sous-traitant associé et que le sous-traitant actuel n'est pas défini
        if (planifActivity && planifActivity.sousTraitantID && 
            (!updatedSousTraitants[index].id || updatedSousTraitants[index].id < 0 || !updatedSousTraitants[index].nom)) {
          
          const associatedSousTraitant = contextSousTraitants?.find(st => st.id === planifActivity.sousTraitantID);
          
          if (associatedSousTraitant) {
            updatedSousTraitants[index] = { 
              ...updatedSousTraitants[index], 
              activiteID: activityId,
              id: associatedSousTraitant.id,
              nom: associatedSousTraitant.nom
            };
            console.log(`Sous-traitant associé à l'activité: ID=${associatedSousTraitant.id}, Nom=${associatedSousTraitant.nom}`);
            return updatedSousTraitants;
          }
        }
      }
      
      // Pour les autres champs
      updatedSousTraitants[index] = { 
        ...updatedSousTraitants[index], 
        [field]: value 
      };
      
      // Si l'unité est définie à null, la remplacer par 1 (valeur par défaut)
      if (field === 'idUnite' && value === null) {
        updatedSousTraitants[index].idUnite = 1;
      }
      
      return updatedSousTraitants;
    });
  };

  const requestDeleteSousTraitant = (index: number) => {
    setSousTraitantToDelete(index);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteSousTraitant = () => {
    if (sousTraitantToDelete !== null && sousTraitants.length > 1) {
      const updatedSousTraitants = sousTraitants.filter((_, index) => index !== sousTraitantToDelete);
      setSousTraitants(updatedSousTraitants);
    }
    setShowDeleteConfirm(false);
    setSousTraitantToDelete(null);
  };

  // Filtrer les activités disponibles en fonction des activités planifiées
  const filteredActivites = activites?.filter(activite => 
    planifActivites.some(planifAct => planifAct.activiteID === activite.id)
  ) || [];

  // Obtenir le sous-traitant associé à une activité spécifique
  const getSousTraitantForActivity = (activiteId: number | null) => {
    if (!activiteId) return null;
    
    const planifActivity = planifActivites.find(act => act.activiteID === activiteId);
    if (planifActivity && planifActivity.sousTraitantID) {
      return contextSousTraitants?.find(st => st.id === planifActivity.sousTraitantID) || null;
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="space-y-6">
        {sousTraitants.map((sousTraitant, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-6 relative transition-all duration-200 hover:shadow-md"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Sous-traitant */}
              <div className="md:col-span-4">
                <label className="text-gray-700 text-sm font-semibold mb-2 flex items-center">
                  <span className="bg-blue-100 p-2 rounded-full mr-2">
                    <FaBuilding className="text-blue-600" />
                  </span>
                  Sous-traitant
                </label>
                <select
                  value={sousTraitant.nom || ""}
                  onChange={(e) => {
                    const selectedNom = e.target.value;
                    const selectedSousTraitant = contextSousTraitants?.find(st => st.nom === selectedNom);
                    if (selectedSousTraitant) {
                      handleChange(index, "nom", selectedSousTraitant.nom);
                      handleChange(index, "id", selectedSousTraitant.id);
                    } else {
                      handleChange(index, "nom", "");
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
                <label className="text-gray-700 text-sm font-semibold mb-2 flex items-center">
                  <span className="bg-blue-100 p-2 rounded-full mr-2">
                    <FaTools className="text-blue-600" />
                  </span>
                  Activité
                </label>
                <select
                  value={sousTraitant.activiteID || ""}
                  onChange={(e) => {
                    const activityId = e.target.value ? Number(e.target.value) : null;
                    handleChange(index, "activiteID", activityId);
                    
                    // Vérifier si l'activité a un sous-traitant associé
                    if (activityId) {
                      const associatedSousTraitant = getSousTraitantForActivity(activityId);
                      if (associatedSousTraitant && (!sousTraitant.nom || sousTraitant.id < 0)) {
                        handleChange(index, "nom", associatedSousTraitant.nom);
                        handleChange(index, "id", associatedSousTraitant.id);
                      }
                    }
                  }}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Sélectionner une activité</option>
                  {filteredActivites.map((activite) => {
                    const associatedSousTraitant = getSousTraitantForActivity(activite.id);
                    return (
                      <option key={activite.id} value={activite.id}>
                        {activite.nom}{associatedSousTraitant ? ` (${associatedSousTraitant.nom})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Quantité et Unité */}
              <div className="md:col-span-4">
                <label className="text-gray-700 text-sm font-semibold mb-2 flex items-center">
                  <span className="bg-blue-100 p-2 rounded-full mr-2">
                    <FaRuler className="text-blue-600" />
                  </span>
                  Quantité
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={sousTraitant.quantite}
                    onChange={(e) => handleChange(index, "quantite", parseFloat(e.target.value) || 0)}
                    className="mt-1 block w-2/3 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    min="0"
                    step="0.01"
                  />
                  <select
                    value={sousTraitant.idUnite || ""}
                    onChange={(e) => handleChange(index, "idUnite", e.target.value ? Number(e.target.value) : null)}
                    className="mt-1 block w-1/3 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
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
                onClick={() => requestDeleteSousTraitant(index)}
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
