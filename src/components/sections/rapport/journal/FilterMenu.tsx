import React, { useState, useEffect } from "react";
import { statuts, meteo } from "../../../../models/JournalFormModel";
import { getMeteoIcon, getStatutIcon } from "../../../../services/IconServices";
import { FaTimes, FaSearch, FaFilter, FaUndo, FaCheck, FaSun, FaMoon } from "react-icons/fa";

interface FilterMenuProps {
  onApplyFilters: (filters: any) => void;
  onClose: () => void;
  currentFilters: any;
  sousTraitants: any[];
  lieux: any[];
}

const FilterMenu: React.FC<FilterMenuProps> = ({
  onApplyFilters,
  onClose,
  currentFilters,
  sousTraitants,
  lieux,
}) => {
  const [selectedStatut, setSelectedStatut] = useState<string[]>(
    currentFilters.statut || []
  );
  const [selectedMeteo, setSelectedMeteo] = useState<string[]>(
    currentFilters.meteo || []
  );
  const [startDate, setStartDate] = useState<string>(
    currentFilters.startDate || ""
  );
  const [endDate, setEndDate] = useState<string>(
    currentFilters.endDate || new Date().toISOString().split("T")[0]
  );
  const [selectedProjects, setSelectedProjects] = useState<string[]>(
    currentFilters.projects || []
  );
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>(
    currentFilters.employees || []
  );
  const [selectedActivity, setSelectedActivity] = useState<string>(
    currentFilters.activity || ""
  );
  const [selectedLocations, setSelectedLocations] = useState<string[]>(
    currentFilters.locations || []
  );
  const [activitySearch, setActivitySearch] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>(
    currentFilters.type || ""
  );
  const [selectedPlageHoraire, setSelectedPlageHoraire] = useState<string>(
    currentFilters.plageHoraire || ""
  );
  const [selectedSousTraitants, setSelectedSousTraitants] = useState<string[]>(
    currentFilters.sousTraitants || []
  );
  const [locationSearch, setLocationSearch] = useState<string>("");
  const [sousTraitantSearch, setSousTraitantSearch] = useState<string>("");

  const handleStatutChange = (statut: string) => {
    setSelectedStatut((prev) =>
      prev.includes(statut)
        ? prev.filter((s) => s !== statut)
        : [...prev, statut]
    );
  };

  const handleMeteoChange = (meteo: string) => {
    setSelectedMeteo((prev) =>
      prev.includes(meteo) ? prev.filter((m) => m !== meteo) : [...prev, meteo]
    );
  };

  const handleProjectChange = (project: string) => {
    setSelectedProjects((prev) =>
      prev.includes(project)
        ? prev.filter((p) => p !== project)
        : [...prev, project]
    );
  };

  const handleEmployeeChange = (employee: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(employee)
        ? prev.filter((e) => e !== employee)
        : [...prev, employee]
    );
  };

  const handleActivityChange = (activity: string) => {
    setSelectedActivity(activity);
  };

  const handleLocationChange = (location: string) => {
    setSelectedLocations((prev) =>
      prev.includes(location)
        ? prev.filter((l) => l !== location)
        : [...prev, location]
    );
  };

  const handleSousTraitantChange = (sousTraitant: string) => {
    setSelectedSousTraitants((prev) =>
      prev.includes(sousTraitant)
        ? prev.filter((st) => st !== sousTraitant)
        : [...prev, sousTraitant]
    );
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
  };

  const handlePlageHoraireChange = (plageHoraire: string) => {
    setSelectedPlageHoraire(plageHoraire);
  };

  const resetFilters = () => {
    setSelectedStatut([]);
    setSelectedMeteo([]);
    setStartDate("");
    setEndDate(new Date().toISOString().split("T")[0]);
    setSelectedProjects([]);
    setSelectedEmployees([]);
    setSelectedActivity("");
    setSelectedLocations([]);
    setSelectedSousTraitants([]);
    setSelectedType("");
    setSelectedPlageHoraire("");
    setActivitySearch("");
    setLocationSearch("");
    setSousTraitantSearch("");
    onApplyFilters({
      statut: [],
      meteo: [],
      startDate: "",
      endDate: new Date().toISOString().split("T")[0],
      projects: [],
      employees: [],
      activity: "",
      locations: [],
      sousTraitants: [],
      type: "",
      plageHoraire: "",
    });
  };

  useEffect(() => {
    onApplyFilters({
      statut: selectedStatut,
      meteo: selectedMeteo,
      startDate,
      endDate,
      projects: selectedProjects,
      employees: selectedEmployees,
      activity: selectedActivity,
      locations: selectedLocations,
      sousTraitants: selectedSousTraitants,
      type: selectedType,
      plageHoraire: selectedPlageHoraire,
    });
  }, [
    selectedStatut,
    selectedMeteo,
    startDate,
    endDate,
    selectedProjects,
    selectedEmployees,
    selectedActivity,
    selectedLocations,
    selectedSousTraitants,
    selectedType,
    selectedPlageHoraire,
  ]);

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 overflow-y-auto border-l border-gray-200">
      {/* Header */}
      <div className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <FaFilter className="text-white" />
          <h2 className="text-xl font-semibold">Filtres</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-blue-800 rounded-full transition-colors duration-200"
        >
          <FaTimes className="text-white" />
        </button>
      </div>

      {/* Actions Bar */}
      <div className="sticky top-16 z-10 bg-white px-6 py-3 border-b border-gray-200 flex justify-between items-center">
        <button
          onClick={resetFilters}
          className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
        >
          <FaUndo size={14} />
          <span className="text-sm font-medium">Réinitialiser</span>
        </button>
        <button
          onClick={onClose}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <FaCheck size={14} />
          <span className="text-sm font-medium">Appliquer</span>
        </button>
      </div>

      {/* Filter Content */}
      <div className="p-6 space-y-6">
        {/* Statut */}
        <div className="filter-section">
          <h3 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-3">Statut</h3>
          <div className="grid grid-cols-2 gap-2">
            {statuts.map((statut) => (
              <label 
                key={statut.id} 
                className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                  selectedStatut.includes(String(statut.id)) 
                    ? "bg-blue-50 border border-blue-200" 
                    : "hover:bg-gray-50 border border-gray-100"
                }`}
              >
                <input
                  type="checkbox"
                  value={statut.id}
                  onChange={() => handleStatutChange(String(statut.id))}
                  checked={selectedStatut.includes(String(statut.id))}
                  className="sr-only"
                />
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    selectedStatut.includes(String(statut.id)) ? "bg-blue-600" : "bg-gray-200"
                  }`}>
                    {selectedStatut.includes(String(statut.id)) && (
                      <FaCheck className="text-white text-xs" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatutIcon(statut.id)}
                    <span className="text-sm font-medium">{statut.name}</span>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Météo */}
        <div className="filter-section">
          <h3 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-3">Météo</h3>
          <div className="grid grid-cols-3 gap-2">
            {meteo.map((m) => (
              <label 
                key={m.id} 
                className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                  selectedMeteo.includes(String(m.id)) 
                    ? "bg-blue-50 border border-blue-200" 
                    : "hover:bg-gray-50 border border-gray-100"
                }`}
              >
                <input
                  type="checkbox"
                  value={m.id}
                  onChange={() => handleMeteoChange(String(m.id))}
                  checked={selectedMeteo.includes(String(m.id))}
                  className="sr-only"
                />
                <div className="flex flex-col items-center space-y-2">
                  <div className="text-2xl">{getMeteoIcon(m.id)}</div>
                  <span className="text-xs font-medium text-center">{m.name}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Période */}
        <div className="filter-section">
          <h3 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-3">Période</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Du</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Au</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Plage horaire */}
        <div className="filter-section">
          <h3 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-3">Plage horaire</h3>
          <div className="grid grid-cols-2 gap-2">
            <label 
              className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                selectedPlageHoraire === "Jour" 
                  ? "bg-blue-50 border border-blue-200" 
                  : "hover:bg-gray-50 border border-gray-100"
              }`}
            >
              <input
                type="radio"
                name="plageHoraire"
                value="Jour"
                onChange={() => handlePlageHoraireChange("Jour")}
                checked={selectedPlageHoraire === "Jour"}
                className="sr-only"
              />
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  selectedPlageHoraire === "Jour" ? "bg-blue-600" : "bg-gray-200"
                }`}>
                  {selectedPlageHoraire === "Jour" && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <FaSun className="text-yellow-500" />
                  <span className="text-sm font-medium">Jour</span>
                </div>
              </div>
            </label>
            <label 
              className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                selectedPlageHoraire === "Nuit" 
                  ? "bg-blue-50 border border-blue-200" 
                  : "hover:bg-gray-50 border border-gray-100"
              }`}
            >
              <input
                type="radio"
                name="plageHoraire"
                value="Nuit"
                onChange={() => handlePlageHoraireChange("Nuit")}
                checked={selectedPlageHoraire === "Nuit"}
                className="sr-only"
              />
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  selectedPlageHoraire === "Nuit" ? "bg-blue-600" : "bg-gray-200"
                }`}>
                  {selectedPlageHoraire === "Nuit" && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <FaMoon className="text-blue-900" />
                  <span className="text-sm font-medium">Nuit</span>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Lieux */}
        <div className="filter-section">
          <h3 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-3">Lieux</h3>
          <div className="mb-3 relative">
            <input
              type="text"
              placeholder="Rechercher un lieu..."
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
            {locationSearch && (
              <button
                onClick={() => setLocationSearch("")}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            )}
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1 pr-2">
            {lieux
              .filter((lieu) =>
                lieu.nom.toLowerCase().includes(locationSearch.toLowerCase())
              )
              .map((lieu) => (
                <label
                  key={lieu.id}
                  className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                    selectedLocations.includes(String(lieu.id))
                      ? "bg-blue-50 border border-blue-200"
                      : "hover:bg-gray-50 border border-gray-100"
                  }`}
                >
                  <input
                    type="checkbox"
                    value={lieu.id}
                    onChange={() => handleLocationChange(String(lieu.id))}
                    checked={selectedLocations.includes(String(lieu.id))}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      selectedLocations.includes(String(lieu.id)) ? "bg-blue-600" : "bg-gray-200"
                    }`}>
                      {selectedLocations.includes(String(lieu.id)) && (
                        <FaCheck className="text-white text-xs" />
                      )}
                    </div>
                    <span className="text-sm">{lieu.nom}</span>
                  </div>
                </label>
              ))}
          </div>
        </div>

        {/* Sous-traitants */}
        <div className="filter-section">
          <h3 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-3">Sous-traitants</h3>
          <div className="mb-3 relative">
            <input
              type="text"
              placeholder="Rechercher un sous-traitant..."
              value={sousTraitantSearch}
              onChange={(e) => setSousTraitantSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
            {sousTraitantSearch && (
              <button
                onClick={() => setSousTraitantSearch("")}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            )}
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1 pr-2">
            {sousTraitants
              .filter((st) =>
                st.nom.toLowerCase().includes(sousTraitantSearch.toLowerCase())
              )
              .map((st) => (
                <label
                  key={st.id}
                  className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                    selectedSousTraitants.includes(String(st.id))
                      ? "bg-blue-50 border border-blue-200"
                      : "hover:bg-gray-50 border border-gray-100"
                  }`}
                >
                  <input
                    type="checkbox"
                    value={st.id}
                    onChange={() => handleSousTraitantChange(String(st.id))}
                    checked={selectedSousTraitants.includes(String(st.id))}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      selectedSousTraitants.includes(String(st.id)) ? "bg-blue-600" : "bg-gray-200"
                    }`}>
                      {selectedSousTraitants.includes(String(st.id)) && (
                        <FaCheck className="text-white text-xs" />
                      )}
                    </div>
                    <span className="text-sm">{st.nom}</span>
                  </div>
                </label>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterMenu;
