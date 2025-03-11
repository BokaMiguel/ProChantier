import React, { useState, useEffect, useMemo } from "react";
import { FaSearch, FaCalendarAlt, FaMapMarkerAlt, FaBuilding, FaCheck, FaTimes, FaInfoCircle } from "react-icons/fa";
import { format, parseISO, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import { Planif, PlanifActivite } from "../../models/JournalFormModel";
import { useAuth } from "../../context/AuthContext";

interface ImportPlanifModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (selectedPlanifications: Planif[]) => void;
  planifications: Planif[];
}

const ImportPlanifModal: React.FC<ImportPlanifModalProps> = ({
  isOpen,
  onClose,
  onImport,
  planifications,
}) => {
  const { activites, lieux, sousTraitants } = useAuth();
  
  // État pour les planifications sélectionnées
  const [selectedPlanifications, setSelectedPlanifications] = useState<Planif[]>([]);
  
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
    planifications.forEach(planif => {
      if (planif.lieuID) lieuxSet.add(planif.lieuID);
    });
    return Array.from(lieuxSet);
  }, [planifications]);
  
  // Entreprises uniques pour le filtre
  const uniqueEntreprises = useMemo(() => {
    const entreprisesSet = new Set<number>();
    planifications.forEach(planif => {
      if (planif.defaultEntreprise) entreprisesSet.add(planif.defaultEntreprise);
    });
    return Array.from(entreprisesSet);
  }, [planifications]);
  
  // Dates uniques pour le filtre
  const uniqueDates = useMemo(() => {
    const datesSet = new Set<string>();
    planifications.forEach(planif => {
      if (planif.date) {
        const date = planif.date.split('T')[0];
        datesSet.add(date);
      }
    });
    return Array.from(datesSet).sort();
  }, [planifications]);
  
  // Filtrer les planifications en fonction des critères de recherche
  const filteredPlanifications = useMemo(() => {
    return planifications.filter(planif => {
      // Filtre par recherche (nom d'activité)
      const activiteMatch = !searchTerm || 
        (planif.PlanifActivites && planif.PlanifActivites.some(pa => {
          const activite = activites?.find(a => a.id === pa.activiteId);
          return activite && activite.nom.toLowerCase().includes(searchTerm.toLowerCase());
        }));
      
      // Filtre par date
      const dateMatch = !dateFilter || planif.Date === dateFilter;
      
      // Filtre par lieu
      const lieuMatch = !lieuFilter || (planif.lieuID === lieuFilter);
      
      // Filtre par entreprise
      const entrepriseMatch = !entrepriseFilter || planif.defaultEntreprise === entrepriseFilter;
      
      return activiteMatch && dateMatch && lieuMatch && entrepriseMatch;
    });
  }, [planifications, searchTerm, dateFilter, lieuFilter, entrepriseFilter, activites]);
  
  // Gérer la sélection d'une planification
  const handleSelectPlanification = (planif: Planif) => {
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
  
  // Importer les planifications sélectionnées
  const handleImport = () => {
    if (selectedPlanifications.length === 0) {
      alert("Veuillez sélectionner au moins une planification à importer.");
      return;
    }
    
    onImport(selectedPlanifications);
    onClose();
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
  const renderActivities = (planif: Planif) => {
    if (!planif.PlanifActivites || planif.PlanifActivites.length === 0) {
      return <span className="text-gray-500">Aucune activité</span>;
    }
    
    if (planif.PlanifActivites.length === 1) {
      return getActivityName(planif.PlanifActivites[0].activiteId);
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
                    {planif.PlanifActivites.map(pa => (
                      <li key={pa.activiteId} className="py-1">
                        {getActivityName(pa.activiteId)}
                      </li>
                    ))}
                  </ul>
                </>
              )
            });
          }}
          onMouseLeave={() => setTooltipPosition(null)}
        >
          {getActivityName(planif.PlanifActivites[0].activiteId)}
          <span className="ml-1 text-blue-500">
            +{planif.PlanifActivites.length - 1}
          </span>
          <FaInfoCircle className="ml-1 text-gray-400" />
        </div>
      </div>
    );
  };
  
  // Afficher le tooltip
  const renderTooltip = () => {
    if (!tooltipPosition) return null;
    
    return (
      <div
        className="absolute z-50 bg-white border border-gray-300 rounded-md shadow-lg p-3 max-w-xs"
        style={{
          left: `${tooltipPosition.x}px`,
          top: `${tooltipPosition.y}px`,
        }}
      >
        {tooltipPosition.content}
      </div>
    );
  };
  
  // Si le modal n'est pas ouvert, ne rien afficher
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Importer des planifications
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher une activité..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt className="text-gray-400" />
              </div>
              <select
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="">Toutes les dates</option>
                {uniqueDates.map(date => (
                  <option key={date} value={date}>
                    {formatDate(date)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaMapMarkerAlt className="text-gray-400" />
              </div>
              <select
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={lieuFilter || ""}
                onChange={(e) => setLieuFilter(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Tous les lieux</option>
                {uniqueLieux.map(id => (
                  <option key={id} value={id}>
                    {getLieuName(id)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaBuilding className="text-gray-400" />
              </div>
              <select
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={entrepriseFilter || ""}
                onChange={(e) => setEntrepriseFilter(e.target.value ? Number(e.target.value) : null)}
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
        </div>
        
        <div className="flex-1 overflow-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-600">
                {filteredPlanifications.length} planification(s) trouvée(s)
              </div>
              <button
                onClick={handleSelectAll}
                className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 focus:outline-none"
              >
                {selectedPlanifications.length === filteredPlanifications.length
                  ? "Désélectionner tout"
                  : "Sélectionner tout"}
              </button>
            </div>
            
            {filteredPlanifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Aucune planification disponible pour l'importation.
                {planifications.length > 0 && (
                  <p className="mt-2 text-sm">
                    Essayez de modifier vos filtres pour voir plus de résultats.
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredPlanifications.map((planif) => (
                  <div
                    key={planif.id}
                    className={`border rounded-md p-3 ${
                      isPlanificationSelected(planif.id)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-blue-300"
                    }`}
                    onClick={() => handleSelectPlanification(planif)}
                  >
                    <div className="flex items-start">
                      <div
                        className={`w-5 h-5 rounded-full mr-3 flex-shrink-0 flex items-center justify-center ${
                          isPlanificationSelected(planif.id)
                            ? "bg-blue-500 text-white"
                            : "border border-gray-400"
                        }`}
                      >
                        {isPlanificationSelected(planif.id) && <FaCheck size={12} />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex flex-wrap justify-between">
                          <div className="font-medium mb-1 mr-2">
                            {renderActivities(planif)}
                          </div>
                          <div className="text-sm text-gray-600 mb-1">
                            {planif.date && formatDate(planif.date)}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          <div className="flex items-center">
                            <FaMapMarkerAlt className="text-gray-400 mr-1" />
                            <span>{getLieuName(planif.lieuID)}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <FaBuilding className="text-gray-400 mr-1" />
                            <span>{getEntrepriseName(planif.defaultEntreprise)}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <span className="text-gray-600">
                              {planif.hrsDebut} - {planif.hrsFin}
                            </span>
                          </div>
                        </div>
                        
                        {planif.note && (
                          <div className="mt-2 text-sm text-gray-600 flex items-start">
                            <FaInfoCircle className="text-gray-400 mr-1 mt-0.5" />
                            <span className="line-clamp-2">{planif.note}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {selectedPlanifications.length} planification(s) sélectionnée(s)
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none"
            >
              Annuler
            </button>
            
            <button
              onClick={handleImport}
              disabled={selectedPlanifications.length === 0}
              className={`px-4 py-2 rounded-md focus:outline-none ${
                selectedPlanifications.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Importer ({selectedPlanifications.length})
            </button>
          </div>
        </div>
      </div>
      
      {renderTooltip()}
    </div>
  );
};

export default ImportPlanifModal;
