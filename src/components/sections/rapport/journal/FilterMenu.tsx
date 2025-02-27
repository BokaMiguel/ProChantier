import React, { useState, useEffect } from "react";
import { statuts, meteo } from "../../../../models/JournalFormModel";
import { getMeteoIcon, getStatutIcon } from "../../../../services/IconServices";
import { FaTimes, FaSearch } from "react-icons/fa";

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
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg z-50 overflow-y-auto">
      <div className="bg-blue-800 text-white px-4 py-2 flex justify-between items-center sticky top-0 z-10">
        <h2 className="text-lg font-bold">Filtrer par</h2>
        <FaTimes className="cursor-pointer" onClick={onClose} />
      </div>
      <div className="p-4 flex flex-wrap gap-4">
        <div className="mb-4 w-full">
          <h3 className="font-semibold bg-blue-600 text-white px-2 py-1 rounded mb-2">
            Statut
          </h3>
          <div className="flex flex-wrap gap-2">
            {statuts.map((statut) => (
              <label key={statut.id} className="flex items-center">
                <input
                  type="checkbox"
                  value={statut.id}
                  onChange={() => handleStatutChange(String(statut.id))}
                  checked={selectedStatut.includes(String(statut.id))}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex items-center">
                  {getStatutIcon(statut.id)}
                  <span className="ml-1">{statut.name}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-4 w-full">
          <h3 className="font-semibold bg-blue-600 text-white px-2 py-1 rounded mb-2">
            Météo
          </h3>
          <div className="flex flex-wrap gap-2">
            {meteo.map((m) => (
              <label key={m.id} className="flex items-center">
                <input
                  type="checkbox"
                  value={m.id}
                  onChange={() => handleMeteoChange(String(m.id))}
                  checked={selectedMeteo.includes(String(m.id))}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex items-center">
                  {getMeteoIcon(m.id)}
                  <span className="ml-1">{m.name}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-4 w-full">
          <h3 className="font-semibold bg-blue-600 text-white px-2 py-1 rounded mb-2">
            Période
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Du
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Au
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="mb-4 w-full">
          <h3 className="font-semibold bg-blue-600 text-white px-2 py-1 rounded mb-2">
            Sous-traitants
          </h3>
          <div className="relative">
            <div className="relative mb-2">
              <input
                type="text"
                placeholder="Rechercher un sous-traitant..."
                className="w-full p-2 pl-8 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={sousTraitantSearch}
                onChange={(e) => setSousTraitantSearch(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <div className="max-h-40 overflow-y-auto border border-blue-100 rounded-lg">
              {sousTraitants
                ?.filter((st) => st.nom.toLowerCase().includes(sousTraitantSearch.toLowerCase()))
                .map((st) => (
                  <label key={st.id} className="flex items-center p-2 hover:bg-blue-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      value={st.id}
                      onChange={() => handleSousTraitantChange(String(st.id))}
                      checked={selectedSousTraitants.includes(String(st.id))}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span>{st.nom}</span>
                  </label>
                ))}
              {sousTraitants?.filter((st) => 
                st.nom.toLowerCase().includes(sousTraitantSearch.toLowerCase())
              ).length === 0 && (
                <div className="p-2 text-gray-500 text-center">Aucun sous-traitant trouvé</div>
              )}
            </div>
            {selectedSousTraitants.length > 0 && (
              <div className="mt-2 text-sm text-blue-600">
                {selectedSousTraitants.length} sous-traitant(s) sélectionné(s)
              </div>
            )}
          </div>
        </div>

        <div className="mb-4 w-full">
          <h3 className="font-semibold bg-blue-600 text-white px-2 py-1 rounded mb-2">
            Lieux
          </h3>
          <div className="relative">
            <div className="relative mb-2">
              <input
                type="text"
                placeholder="Rechercher un lieu..."
                className="w-full p-2 pl-8 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <div className="max-h-40 overflow-y-auto border border-blue-100 rounded-lg">
              {lieux
                ?.filter((lieu) => lieu.nom.toLowerCase().includes(locationSearch.toLowerCase()))
                .map((lieu) => (
                  <label key={lieu.id} className="flex items-center p-2 hover:bg-blue-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      value={lieu.id}
                      onChange={() => handleLocationChange(String(lieu.id))}
                      checked={selectedLocations.includes(String(lieu.id))}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span>{lieu.nom}</span>
                  </label>
                ))}
              {lieux?.filter((lieu) => 
                lieu.nom.toLowerCase().includes(locationSearch.toLowerCase())
              ).length === 0 && (
                <div className="p-2 text-gray-500 text-center">Aucun lieu trouvé</div>
              )}
            </div>
            {selectedLocations.length > 0 && (
              <div className="mt-2 text-sm text-blue-600">
                {selectedLocations.length} lieu(x) sélectionné(s)
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between w-full mt-4">
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          >
            Réinitialiser
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterMenu;
