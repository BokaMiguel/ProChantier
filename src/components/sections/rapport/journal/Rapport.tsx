import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaFilter,
  FaChevronDown,
  FaChevronUp,
  FaProjectDiagram,
  FaCalendarAlt,
  FaClock,
  FaCloudSun,
  FaTasks,
  FaSortUp,
  FaSortDown,
  FaTimes,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import FilterMenu from "./FilterMenu";
import JournalDetails from "./JournalDetails";
import { JournalChantier, JournalActivites, MateriauxJournal, SousTraitantJournal, BottinJournal, LocalisationJournal } from "../../../../models/JournalFormModel";
import { getMeteoIcon, getStatutIcon } from "../../../../services/IconServices";
import ActionButtons from "./ActionsButtons";
import { useAuth } from "../../../../context/AuthContext";
import { format } from "date-fns";

// Interface pour gérer l'état des sections développées
interface ExpandedSections {
  employes: boolean;
  activites: boolean;
  materiaux: boolean;
  sousTraitants: boolean;
}

interface Filters {
  statut: string[];
  meteo: string[];
  startDate: string;
  endDate: string;
  projects: string[];
  employees: string[];
  activity: string;
  locations: string[];
  sousTraitants: string[];
  type: string;
  plageHoraire: string;
}

const Rapport: React.FC = () => {
  const { selectedProject, fetchJournals, journals, activites, materiaux, sousTraitants, lieux, bases, employees } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredJournals, setFilteredJournals] = useState<JournalChantier[]>([]);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState<boolean>(false);
  const [expandedJournal, setExpandedJournal] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    activites: false,
    materiaux: false,
    sousTraitants: false,
    employes: false,
  });
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "ascending" | "descending";
  } | null>(null);
  const [currentFilters, setCurrentFilters] = useState<Filters>({
    statut: [],
    meteo: [],
    startDate: "",
    endDate: "",
    projects: [],
    employees: [],
    activity: "",
    locations: [],
    sousTraitants: [],
    type: "",
    plageHoraire: ""
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Récupérer les journaux de chantier lorsque le projet sélectionné change
  useEffect(() => {
    if (selectedProject) {
      setIsLoading(true);
      // Ne charge les journaux que s'ils ne sont pas déjà chargés
      if (!journals || journals.length === 0) {
        fetchJournals(selectedProject.ID);
      } else {
        setIsLoading(false);
      }
    }
  }, [selectedProject, fetchJournals, journals]);

  useEffect(() => {
    if (journals && journals.length > 0) {
      // Appliquer d'abord les filtres avancés
      let results = [...journals];
      
      // Appliquer les filtres avancés si présents
      if (Object.keys(currentFilters).length > 0) {
        if (currentFilters.statut && currentFilters.statut.length > 0) {
          results = results.filter((journal: JournalChantier) => 
            currentFilters.statut.includes(String(journal.statutId))
          );
        }
        
        if (currentFilters.meteo && currentFilters.meteo.length > 0) {
          results = results.filter((journal: JournalChantier) => 
            currentFilters.meteo.includes(String(journal.meteoId))
          );
        }
        
        if (currentFilters.startDate) {
          results = results.filter((journal: JournalChantier) => 
            new Date(journal.date) >= new Date(currentFilters.startDate)
          );
        }
        
        if (currentFilters.endDate) {
          results = results.filter((journal: JournalChantier) => 
            new Date(journal.date) <= new Date(currentFilters.endDate)
          );
        }
        
        if (currentFilters.activity) {
          results = results.filter((journal: JournalChantier) => 
            journal.journalActivites?.some((act: JournalActivites) => 
              String(act.activiteId) === currentFilters.activity
            )
          );
        }
        
        // Filtrer par sous-traitants
        if (currentFilters.sousTraitants && currentFilters.sousTraitants.length > 0) {
          results = results.filter((journal: JournalChantier) => 
            journal.journalActivites?.some((activite: JournalActivites) => 
              activite.sousTraitantJournals?.some((st: SousTraitantJournal) => 
                currentFilters.sousTraitants.includes(String(st.sousTraitantId))
              )
            )
          );
        }
        
        // Filtrer par lieux
        if (currentFilters.locations && currentFilters.locations.length > 0) {
          results = results.filter((journal: JournalChantier) => 
            journal.journalActivites?.some((activite: JournalActivites) => 
              activite.localisationJournals?.some((loc: LocalisationJournal) => {
                const localisation = bases?.find(b => b.id === loc.localisationId);
                return localisation && currentFilters.locations.includes(String(localisation.lieuId));
              })
            )
          );
        }
        
        // Filtrer par projet
        if (currentFilters.projects && currentFilters.projects.length > 0) {
          results = results.filter((journal: JournalChantier) => 
            currentFilters.projects.includes(String(journal.projetId))
          );
        }
        
        // Filtrer par employés
        if (currentFilters.employees && currentFilters.employees.length > 0) {
          results = results.filter((journal: JournalChantier) => 
            journal.bottinJournals?.some((emp: BottinJournal) => 
              currentFilters.employees.includes(String(emp.bottinId))
            )
          );
        }
        
        // Filtrer par type
        if (currentFilters.type) {
          results = results.filter((journal: JournalChantier) => 
            String(journal.typeId) === currentFilters.type
          );
        }
        
        // Filtrer par plage horaire
        if (currentFilters.plageHoraire) {
          results = results.filter((journal: JournalChantier) => 
            journal.plageHoraire === currentFilters.plageHoraire
          );
        }
      }
      
      // Ensuite appliquer la recherche textuelle si présente
      if (searchTerm.trim() !== '') {
        const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
        
        results = results.filter((journal: JournalChantier) => {
          // Recherche dans les activités
          const activitesMatch = journal.journalActivites?.some((activite: JournalActivites) => {
            // Vérifier le nom de l'activité
            const activiteName = activites?.find((a: any) => a.id === activite.activiteId)?.nom || '';
            if (activiteName.toLowerCase().includes(lowerCaseSearchTerm)) return true;
            
            // Vérifier les commentaires de l'activité
            if (activite.comment?.toLowerCase().includes(lowerCaseSearchTerm)) return true;
            
            // Vérifier les sous-traitants
            const sousTraitantsMatch = activite.sousTraitantJournals?.some((st: SousTraitantJournal) => {
              const stName = sousTraitants?.find((s: any) => s.id === st.sousTraitantId)?.nom || '';
              return stName.toLowerCase().includes(lowerCaseSearchTerm);
            });
            if (sousTraitantsMatch) return true;
            
            return false;
          });
          if (activitesMatch) return true;
          
          // Recherche dans les matériaux
          const materiauxMatch = journal.materiauxJournals?.some((mat: MateriauxJournal) => {
            const matName = materiaux?.find((m: any) => m.id === mat.materielId)?.nom || '';
            return matName.toLowerCase().includes(lowerCaseSearchTerm);
          });
          if (materiauxMatch) return true;
          
          // Recherche dans les employés
          const employesMatch = journal.bottinJournals?.some((emp: BottinJournal) => {
            const employee = employees?.find((e: any) => e.id === emp.bottinId);
            const fullName = `${employee?.prenom || ''} ${employee?.nom || ''}`.toLowerCase();
            return fullName.includes(lowerCaseSearchTerm);
          });
          if (employesMatch) return true;
          
          // Recherche dans la date
          if (formatDate(journal.date).toLowerCase().includes(lowerCaseSearchTerm)) return true;
          
          return false;
        });
      }
      
      setFilteredJournals(results);
    }
  }, [journals, searchTerm, currentFilters, activites, materiaux, sousTraitants, employees, bases, lieux]);

  const toggleJournalExpand = (journalId: number) => {
    setExpandedJournal(expandedJournal === journalId ? null : journalId);
  };

  const toggleSectionExpand = (section: keyof ExpandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === "ascending" ? (
      <FaSortUp className="ml-1" />
    ) : (
      <FaSortDown className="ml-1" />
    );
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return format(date, "dd/MM/yyyy");
  };

  const applyFilters = (filters: Filters) => {
    setCurrentFilters(filters);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="mb-8 text-left">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Journal de Chantier</h1>
        <p className="text-gray-500 text-lg">Suivi et gestion des activités quotidiennes sur le chantier</p>
        <div className="h-1 w-32 bg-blue-600 mt-2 rounded-full"></div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un journal..."
              className="w-full md:w-80 pl-10 pr-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3.5 text-blue-400" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-3.5 text-blue-400 hover:text-blue-600"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>
        <button
          onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
          className="flex items-center space-x-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
        >
          <FaFilter />
          <span>Filtres avancés</span>
          {isFilterMenuOpen ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>

      {isFilterMenuOpen && (
        <FilterMenu
          onApplyFilters={applyFilters}
          onClose={() => setIsFilterMenuOpen(false)}
          currentFilters={currentFilters}
          sousTraitants={sousTraitants || []}
          lieux={lieux || []}
        />
      )}

      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-blue-600 font-medium">Chargement des journaux...</p>
        </div>
      ) : filteredJournals.length === 0 ? (
        <div className="text-center py-16 bg-blue-50 rounded-lg border border-blue-100">
          <svg className="mx-auto h-16 w-16 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-4 text-blue-700 text-lg font-medium">
            Aucun journal de chantier trouvé
          </p>
          <p className="text-blue-500 mt-2">
            Veuillez créer un nouveau journal pour commencer le suivi de vos activités
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg border border-blue-100 shadow-sm">
          <table className="min-w-full">
            <thead>
              <tr className="bg-blue-50 text-blue-700">
                <th
                  className="px-6 py-4 border-b border-blue-100 cursor-pointer"
                  onClick={() => requestSort("date")}
                >
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-2 text-blue-500" />
                    <span>Date</span>
                    {getSortIcon("date")}
                  </div>
                </th>
                <th
                  className="px-6 py-4 border-b border-blue-100 cursor-pointer"
                  onClick={() => requestSort("projetId")}
                >
                  <div className="flex items-center">
                    <FaProjectDiagram className="mr-2 text-blue-500" />
                    <span>Projet</span>
                    {getSortIcon("projetId")}
                  </div>
                </th>
                <th className="px-6 py-4 border-b border-blue-100">
                  <div className="flex items-center">
                    <FaClock className="mr-2 text-blue-500" />
                    <span>Heures</span>
                  </div>
                </th>
                <th className="px-6 py-4 border-b border-blue-100">
                  <div className="flex items-center">
                    <FaCloudSun className="mr-2 text-blue-500" />
                    <span>Météo</span>
                  </div>
                </th>
                <th className="px-6 py-4 border-b border-blue-100">
                  <div className="flex items-center">
                    <FaTasks className="mr-2 text-blue-500" />
                    <span>Statut</span>
                  </div>
                </th>
                <th className="px-6 py-4 border-b border-blue-100">Actions</th>
                <th className="px-6 py-4 border-b border-blue-100">Détails</th>
              </tr>
            </thead>
            <tbody>
              {filteredJournals.map((journal: JournalChantier) => (
                <React.Fragment key={journal.id}>
                  <tr
                    className={`border-b hover:bg-blue-50 transition-colors duration-150 ${
                      expandedJournal === journal.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      {formatDate(journal.date)}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {selectedProject?.NumeroProjet || "Projet inconnu"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {journal.hrsDebut} - {journal.hrsFin}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-xl">
                        {getMeteoIcon(journal.meteoId)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getStatutIcon(Number(journal.statutId))}
                        <span className="ml-2">
                          {journal.statutId === 1 ? "En attente" : 
                           journal.statutId === 2 ? "En cours" : 
                           journal.statutId === 3 ? "Terminé" : "Inconnu"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <ActionButtons 
                        journalId={journal.id} 
                        handleEdit={() => console.log(`Éditer journal ${journal.id}`)} 
                        handleExport={() => console.log(`Exporter journal ${journal.id}`)} 
                        handleSend={() => console.log(`Envoyer journal ${journal.id}`)} 
                      />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleJournalExpand(journal.id)}
                        className={`p-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${
                          expandedJournal === journal.id 
                            ? "bg-blue-600 text-white hover:bg-blue-700" 
                            : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                        }`}
                      >
                        {expandedJournal === journal.id ? (
                          <FaChevronUp />
                        ) : (
                          <FaChevronDown />
                        )}
                      </button>
                    </td>
                  </tr>
                  {expandedJournal === journal.id && (
                    <JournalDetails
                      journal={journal}
                      expandedSections={expandedSections}
                      toggleSectionExpand={toggleSectionExpand}
                    />
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Rapport;
