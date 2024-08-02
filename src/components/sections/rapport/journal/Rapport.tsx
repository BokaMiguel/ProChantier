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
import { initialJournals } from "./initalJournalsMock";
import JournalDetails from "./JournalDetails";
import { Journal } from "../../../../models/JournalFormModel";
import { getMeteoIcon, getStatutIcon } from "../../../../services/IconServices";
import ActionButtons from "./ActionsButtons";

const Rapport: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredJournals, setFilteredJournals] =
    useState<Journal[]>(initialJournals);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState<boolean>(false);
  const [expandedJournal, setExpandedJournal] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] = useState<{
    activites: boolean;
    materiaux: boolean;
    sousTraitants: boolean;
    employes: boolean;
  }>({
    activites: false,
    materiaux: false,
    sousTraitants: false,
    employes: false,
  });
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "ascending" | "descending";
  } | null>(null);
  const [currentFilters, setCurrentFilters] = useState<any>({});

  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    const results = initialJournals.filter((journal) => {
      const checkIncludes = (value: any): boolean => {
        if (typeof value === "string") {
          return value.toLowerCase().includes(lowerCaseSearchTerm);
        }
        if (Array.isArray(value)) {
          return value.some((item) => checkIncludes(item));
        }
        if (typeof value === "object" && value !== null) {
          return Object.values(value).some((val) => checkIncludes(val));
        }
        return false;
      };

      return Object.values(journal).some((val) => checkIncludes(val));
    });

    setFilteredJournals(results);
  }, [searchTerm]);

  useEffect(() => {
    if (sortConfig !== null) {
      const sortedJournals = [...filteredJournals].sort((a, b) => {
        const aValue =
          a.projetInfo[sortConfig.key as keyof typeof a.projetInfo];
        const bValue =
          b.projetInfo[sortConfig.key as keyof typeof b.projetInfo];
        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
      setFilteredJournals(sortedJournals);
    }
  }, [sortConfig]);

  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    const results = initialJournals.filter((journal) => {
      const checkIncludes = (value: any): boolean => {
        if (typeof value === "string") {
          return value.toLowerCase().includes(lowerCaseSearchTerm);
        }
        if (Array.isArray(value)) {
          return value.some((item) => checkIncludes(item));
        }
        if (typeof value === "object" && value !== null) {
          return Object.values(value).some((val) => checkIncludes(val));
        }
        return false;
      };

      return Object.values(journal).some((val) => checkIncludes(val));
    });

    setFilteredJournals(results);
  }, [searchTerm, currentFilters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleFilterMenu = () => {
    setIsFilterMenuOpen(!isFilterMenuOpen);
  };

  const toggleExpand = (id: number) => {
    setExpandedJournal(expandedJournal === id ? null : id);
  };

  const toggleSectionExpand = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleEdit = (id: number) => {
    // Logic to handle edit
  };

  const handleExport = (id: number) => {
    // Logic to handle export
  };

  const handleSend = (id: number) => {
    // Logic to handle send
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
    if (!sortConfig) {
      return null;
    }
    if (sortConfig.key === key) {
      return sortConfig.direction === "ascending" ? (
        <FaSortUp />
      ) : (
        <FaSortDown />
      );
    }
    return null;
  };

  const applyFilters = (filters: any) => {
    setCurrentFilters(filters);

    const filtered = initialJournals.filter((journal) => {
      const checkIncludes = (value: any, searchValue: any): boolean => {
        if (typeof value === "string" && typeof searchValue === "string") {
          return value.toLowerCase().includes(searchValue.toLowerCase());
        }
        if (Array.isArray(value)) {
          return value.some((item) => checkIncludes(item, searchValue));
        }
        if (typeof value === "object" && value !== null) {
          return Object.values(value).some((val) =>
            checkIncludes(val, searchValue)
          );
        }
        return false;
      };

      return Object.keys(filters).every((key) => {
        const filterValue = filters[key];
        const journalValue = journal[key as keyof Journal];

        if (key === "plageHoraire") {
          const [startHour] = journal.projetInfo.arrivee.split(":").map(Number);
          const [endHour] = journal.projetInfo.depart.split(":").map(Number);
          const isJour =
            (startHour >= 5 && startHour < 19) ||
            (endHour >= 5 && endHour < 19);
          if (
            (filterValue === "Jour" && !isJour) ||
            (filterValue === "Nuit" && isJour)
          ) {
            return false;
          }
        } else if (Array.isArray(filterValue)) {
          if (filterValue.length === 0) {
            return true;
          }
          return checkIncludes(journalValue, filterValue);
        } else {
          return !filterValue || checkIncludes(journalValue, filterValue);
        }
      });
    });

    setFilteredJournals(filtered);
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen relative">
      <h1 className="text-2xl font-bold mb-6 text-center bg-blue-800 text-white p-4 rounded">
        Rapport de Journaux
      </h1>
      <div className="mb-4 flex items-center justify-center">
        <FaSearch className="mr-2" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full md:w-1/3 px-4 py-2 rounded-lg shadow-sm border-gray-300"
        />
        <FaFilter
          className="ml-4 cursor-pointer text-gray-600"
          onClick={toggleFilterMenu}
        />
        {isFilterMenuOpen && (
          <FilterMenu
            onApplyFilters={applyFilters}
            onClose={toggleFilterMenu}
            currentFilters={currentFilters}
          />
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg shadow-md">
          <thead className="bg-blue-800 text-white">
            <tr>
              <th className="px-4 py-2 border">ID</th>
              <th
                className="px-4 py-2 border cursor-pointer"
                onClick={() => requestSort("nomProjet")}
              >
                <div className="flex items-center space-x-2">
                  <FaProjectDiagram />
                  <span>Projet</span>
                  {getSortIcon("nomProjet")}
                </div>
              </th>
              <th className="px-4 py-2 border">Type</th>
              <th
                className="px-4 py-2 border cursor-pointer"
                onClick={() => requestSort("date")}
              >
                <div className="flex items-center space-x-2">
                  <FaCalendarAlt />
                  <span>Date</span>
                  {getSortIcon("date")}
                </div>
              </th>
              <th
                className="px-4 py-2 border cursor-pointer"
                onClick={() => requestSort("plageHoraire")}
              >
                <div className="flex items-center space-x-2">
                  <FaClock />
                  <span>Plage Horaire</span>
                  {getSortIcon("plageHoraire")}
                </div>
              </th>
              <th className="px-4 py-2 border">
                <div className="flex items-center space-x-2">
                  <FaCloudSun />
                  <span>Météo</span>
                </div>
              </th>
              <th className="px-4 py-2 border">
                <div className="flex items-center space-x-2">
                  <FaTasks />
                  <span>Statut</span>
                </div>
              </th>
              <th className="px-4 py-2 border text-center">
                <span>Actions</span>
              </th>
              <th className="px-4 py-2 border text-center">
                <span>Détails</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredJournals.map((journal, index) => (
              <React.Fragment key={journal.id}>
                <tr
                  className={`cursor-pointer hover:bg-gray-50 ${
                    index % 2 === 0 ? "bg-gray-100" : "bg-white"
                  }`}
                >
                  <td className="px-4 py-2 border">{journal.id}</td>
                  <td className="px-4 py-2 border">
                    {journal.projetInfo.nomProjet}
                  </td>
                  <td className="px-4 py-2 border">
                    {journal.projetInfo.type}
                  </td>
                  <td className="px-4 py-2 border">
                    {journal.projetInfo.date.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 border">
                    <div className="flex items-center space-x-2 justify-center">
                      {Number(journal.projetInfo.arrivee.split(":")[0]) < 5 ||
                      Number(journal.projetInfo.arrivee.split(":")[0]) >= 19 ||
                      Number(journal.projetInfo.depart.split(":")[0]) < 5 ||
                      Number(journal.projetInfo.depart.split(":")[0]) >= 19 ? (
                        <FaMoon className="text-gray-500" />
                      ) : (
                        <FaSun className="text-yellow-500" />
                      )}
                      <span>{`${journal.projetInfo.arrivee} - ${journal.projetInfo.depart}`}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 border">
                    {getMeteoIcon(journal.projetInfo.weather.name)}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {getStatutIcon(journal.statut)}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    <ActionButtons
                      journalId={journal.id}
                      handleEdit={handleEdit}
                      handleExport={handleExport}
                      handleSend={handleSend}
                    />
                  </td>
                  <td className="px-4 py-2 border">
                    <button onClick={() => toggleExpand(journal.id)}>
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
    </div>
  );
};

export default Rapport;
