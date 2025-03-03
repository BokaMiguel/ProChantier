import React, { useState, useEffect, useMemo } from "react";
import { FaSearch, FaCalendarAlt, FaMapMarkerAlt, FaBuilding, FaCheck, FaTimes, FaInfoCircle } from "react-icons/fa";
import { format, parseISO, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import { ActivitePlanif } from "../../models/JournalFormModel";
import { useAuth } from "../../context/AuthContext";

interface ImportPlanifModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (selectedPlanifications: ActivitePlanif[]) => void;
  currentWeekDates: Date[];
  existingPlanifications: ActivitePlanif[];
}

const ImportPlanifModal: React.FC<ImportPlanifModalProps> = ({
  isOpen,
  onClose,
  onImport,
  currentWeekDates,
  existingPlanifications,
}) => {
  const { activites, lieux, sousTraitants } = useAuth();
  
  // État pour les planifications sélectionnées
  const [selectedPlanifications, setSelectedPlanifications] = useState<ActivitePlanif[]>([]);
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [lieuFilter, setLieuFilter] = useState<number | null>(null);
  const [entrepriseFilter, setEntrepriseFilter] = useState<number | null>(null);
  
  // État pour gérer les tooltips
  const [tooltipPosition, setTooltipPosition] = useState<{
    id: string;
    x: number;
    y: number;
    content: React.ReactNode;
  } | null>(null);
  
  // Réinitialiser les sélections à chaque ouverture du modal
  useEffect(() => {
    if (isOpen) {
      setSelectedPlanifications([]);
      setSearchTerm("");
      setDateFilter("");
      setLieuFilter(null);
      setEntrepriseFilter(null);
    }
  }, [isOpen]);
  
  // Lieux uniques pour le filtre
  const uniqueLieux = useMemo(() => {
    const lieuxSet = new Set<number>();
    existingPlanifications.forEach(planif => {
      if (planif.lieuID) lieuxSet.add(planif.lieuID);
    });
    return Array.from(lieuxSet);
  }, [existingPlanifications]);
  
  // Entreprises uniques pour le filtre
  const uniqueEntreprises = useMemo(() => {
    const entreprisesSet = new Set<number>();
    existingPlanifications.forEach(planif => {
      if (planif.defaultEntrepriseId) entreprisesSet.add(planif.defaultEntrepriseId);
    });
    return Array.from(entreprisesSet);
  }, [existingPlanifications]);
  
  // Dates uniques pour le filtre
  const uniqueDates = useMemo(() => {
    const datesSet = new Set<string>();
    existingPlanifications.forEach(planif => {
      if (planif.date) {
        const date = planif.date.split('T')[0];
        datesSet.add(date);
      }
    });
    return Array.from(datesSet).sort();
  }, [existingPlanifications]);
  
  // Filtrer les planifications selon les critères
  const filteredPlanifications = useMemo(() => {
    return existingPlanifications.filter(planif => {
      // Filtre par recherche (nom d'activité)
      const activiteMatch = !searchTerm || 
        (planif.activiteIDs && planif.activiteIDs.some(id => {
          const activite = activites?.find(a => a.id === id);
          return activite && activite.nom.toLowerCase().includes(searchTerm.toLowerCase());
        }));
      
      // Filtre par date
      const dateMatch = !dateFilter || 
        (planif.date && planif.date.startsWith(dateFilter));
      
      // Filtre par lieu
      const lieuMatch = lieuFilter === null || 
        planif.lieuID === lieuFilter;
      
      // Filtre par entreprise
      const entrepriseMatch = entrepriseFilter === null || 
        planif.defaultEntrepriseId === entrepriseFilter;
      
      return activiteMatch && dateMatch && lieuMatch && entrepriseMatch;
    });
  }, [existingPlanifications, searchTerm, dateFilter, lieuFilter, entrepriseFilter, activites]);
  
  // Gérer la sélection d'une planification
  const handleSelectPlanification = (planif: ActivitePlanif) => {
    setSelectedPlanifications(prev => {
      const isSelected = prev.some(p => p.id === planif.id);
      if (isSelected) {
        return prev.filter(p => p.id !== planif.id);
      } else {
        return [...prev, planif];
      }
    });
  };
  
  // Sélectionner ou désélectionner toutes les planifications
  const handleSelectAll = () => {
    if (selectedPlanifications.length === filteredPlanifications.length) {
      setSelectedPlanifications([]);
    } else {
      setSelectedPlanifications([...filteredPlanifications]);
    }
  };
  
  // Obtenir le nom d'une activité
  const getActivityName = (id: number) => {
    const activity = activites?.find(a => a.id === id);
    return activity ? activity.nom : "Activité inconnue";
  };
  
  // Obtenir le nom d'un lieu
  const getLieuName = (id: number | null) => {
    if (!id) return "Non spécifié";
    const lieu = lieux?.find(l => l.id === id);
    return lieu ? lieu.nom : "Lieu inconnu";
  };
  
  // Obtenir le nom d'une entreprise
  const getEntrepriseName = (id: number | null) => {
    if (!id) return "Non spécifié";
    const entreprise = sousTraitants?.find(e => e.id === id);
    return entreprise ? entreprise.nom : "Entreprise inconnue";
  };
  
  // Formater la date
  const formatDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      if (!isValid(date)) return "Date invalide";
      return format(date, "dd/MM/yyyy", { locale: fr });
    } catch (error) {
      return "Date invalide";
    }
  };
  
  // Vérifier si une planification est sélectionnée
  const isPlanificationSelected = (id: number) => {
    return selectedPlanifications.some(p => p.id === id);
  };
  
  // Afficher les activités d'une planification
  const renderActivities = (planif: ActivitePlanif) => {
    if (!planif.activiteIDs || planif.activiteIDs.length === 0) {
      return <span className="text-gray-500">Aucune activité</span>;
    }
    
    if (planif.activiteIDs.length === 1) {
      return getActivityName(planif.activiteIDs[0]);
    }
    
    // Afficher la première activité et un tooltip pour les autres
    return (
      <div className="relative">
        <div 
          className="flex items-center cursor-pointer" 
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setTooltipPosition({ 
              id: `activities-${planif.id}`, 
              x: rect.right + 10, 
              y: rect.top - 20,
              content: (
                <>
                  <div className="text-sm font-medium mb-1">Toutes les activités:</div>
                  <ul className="text-sm">
                    {planif.activiteIDs.map(id => (
                      <li key={id} className="py-1">
                        {getActivityName(id)}
                      </li>
                    ))}
                  </ul>
                </>
              )
            });
          }}
          onMouseLeave={() => setTooltipPosition(null)}
        >
          {getActivityName(planif.activiteIDs[0])}
          <span className="ml-1 text-blue-500">
            +{planif.activiteIDs.length - 1}
          </span>
          <FaInfoCircle className="ml-1 text-gray-400" />
        </div>
      </div>
    );
  };
  
  // Importer les planifications sélectionnées
  const handleImport = () => {
    if (selectedPlanifications.length === 0) {
      alert("Veuillez sélectionner au moins une planification à importer.");
      return;
    }
    
    onImport(selectedPlanifications);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] flex flex-col">
        {/* En-tête */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Importer des planifications existantes</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        {/* Filtres */}
        <div className="p-4 border-b grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Recherche par activité */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par activité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Filtre par date */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaCalendarAlt className="text-gray-400" />
            </div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Toutes les dates</option>
              {uniqueDates.map(date => (
                <option key={date} value={date}>
                  {formatDate(date)}
                </option>
              ))}
            </select>
          </div>
          
          {/* Filtre par lieu */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaMapMarkerAlt className="text-gray-400" />
            </div>
            <select
              value={lieuFilter === null ? "" : lieuFilter}
              onChange={(e) => setLieuFilter(e.target.value ? Number(e.target.value) : null)}
              className="pl-10 pr-4 py-2 border rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les lieux</option>
              {uniqueLieux.map(id => (
                <option key={id} value={id}>
                  {getLieuName(id)}
                </option>
              ))}
            </select>
          </div>
          
          {/* Filtre par entreprise */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaBuilding className="text-gray-400" />
            </div>
            <select
              value={entrepriseFilter === null ? "" : entrepriseFilter}
              onChange={(e) => setEntrepriseFilter(e.target.value ? Number(e.target.value) : null)}
              className="pl-10 pr-4 py-2 border rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Toutes les entreprises</option>
              {uniqueEntreprises.map(id => (
                <option key={id} value={id}>
                  {getEntrepriseName(id)}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Liste des planifications */}
        <div className="overflow-y-auto flex-grow">
          {filteredPlanifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Aucune planification disponible pour l'importation.
              {existingPlanifications.length > 0 && (
                <p className="mt-2 text-sm">
                  Essayez de modifier vos filtres pour voir plus de résultats.
                </p>
              )}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedPlanifications.length === filteredPlanifications.length && filteredPlanifications.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2">Sélectionner</span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activités
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lieu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entreprise
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Heure
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPlanifications.map((planif) => (
                  <tr
                    key={planif.id}
                    onClick={() => handleSelectPlanification(planif)}
                    className={`cursor-pointer hover:bg-gray-50 ${
                      isPlanificationSelected(planif.id) ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={isPlanificationSelected(planif.id)}
                        onChange={() => handleSelectPlanification(planif)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(planif.date)}
                    </td>
                    <td className="px-6 py-4">
                      {renderActivities(planif)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getLieuName(planif.lieuID)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getEntrepriseName(planif.defaultEntrepriseId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {planif.hrsDebut && planif.hrsFin 
                        ? `${planif.hrsDebut} - ${planif.hrsFin}` 
                        : "Non spécifié"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pied de page avec actions */}
        <div className="p-4 border-t flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {selectedPlanifications.length} planification(s) sélectionnée(s) sur {filteredPlanifications.length}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleImport}
              disabled={selectedPlanifications.length === 0}
              className={`px-4 py-2 rounded-md text-white ${
                selectedPlanifications.length === 0
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Importer ({selectedPlanifications.length})
            </button>
          </div>
        </div>
      </div>
      
      {/* Tooltip global */}
      {tooltipPosition && (
        <div 
          className="fixed bg-white border border-gray-200 shadow-lg rounded-md p-3 min-w-[200px] max-w-[300px]" 
          style={{ 
            zIndex: 9999, 
            left: `${tooltipPosition.x}px`, 
            top: `${tooltipPosition.y}px`,
          }}
        >
          {tooltipPosition.content}
        </div>
      )}
    </div>
  );
};

export default ImportPlanifModal;
