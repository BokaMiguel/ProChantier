import React, { useState, useEffect } from "react";
import { statuts, meteo } from "../../../../models/JournalFormModel";
import { getMeteoIcon, getStatutIcon } from "../../../../services/IconServices";
import { FaTimes } from "react-icons/fa";
import { initialJournals } from "./initalJournalsMock";

interface FilterMenuProps {
  onApplyFilters: (filters: any) => void;
  onClose: () => void;
  currentFilters: any;
}

const FilterMenu: React.FC<FilterMenuProps> = ({
  onApplyFilters,
  onClose,
  currentFilters,
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

  const distinctProjects = Array.from(
    new Set(initialJournals.map((journal) => journal.projetInfo.nomProjet))
  );
  const distinctEmployees = Array.from(
    new Set(
      initialJournals.flatMap((journal) =>
        journal.employes.map((emp) => emp.prenom + " " + emp.nom)
      )
    )
  );
  const distinctActivities = Array.from(
    new Set(
      initialJournals.flatMap((journal) =>
        journal.activites.map((act) => act.nom)
      )
    )
  ).filter((activity) =>
    activity.toLowerCase().includes(activitySearch.toLowerCase())
  );
  const distinctLocations = Array.from(
    new Set(
      initialJournals.flatMap(
        (journal) =>
          journal.activites
            .flatMap((act) => act.lieu)
            .filter(Boolean) as string[]
      )
    )
  );

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
    setSelectedType("");
    setSelectedPlageHoraire("");
    setActivitySearch("");
    onApplyFilters({
      statut: [],
      meteo: [],
      startDate: "",
      endDate: new Date().toISOString().split("T")[0],
      projects: [],
      employees: [],
      activity: "",
      locations: [],
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
                  value={statut.name}
                  onChange={() => handleStatutChange(statut.name)}
                  checked={selectedStatut.includes(statut.name)}
                  className="mr-2"
                />
                {getStatutIcon(statut)}
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
                  value={m.name}
                  onChange={() => handleMeteoChange(m.name)}
                  checked={selectedMeteo.includes(m.name)}
                  className="mr-2"
                />
                {getMeteoIcon(m.name)}
              </label>
            ))}
          </div>
        </div>
        <div className="mb-4 w-full">
          <h3 className="font-semibold bg-blue-600 text-white px-2 py-1 rounded mb-2">
            Période
          </h3>
          <div className="flex flex-col gap-2">
            <label className="flex items-center">
              <span className="mr-2 font-semibold">Début Période</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border p-2 rounded"
              />
            </label>
            <label className="flex items-center">
              <span className="mr-2 font-semibold">Fin Période</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border p-2 rounded"
              />
            </label>
          </div>
        </div>
        <div className="mb-4 w-full">
          <h3 className="font-semibold bg-blue-600 text-white px-2 py-1 rounded mb-2">
            Projets
          </h3>
          <div className="flex flex-wrap gap-2">
            {distinctProjects.map((project) => (
              <label key={project} className="flex items-center">
                <input
                  type="checkbox"
                  value={project}
                  onChange={() => handleProjectChange(project)}
                  checked={selectedProjects.includes(project)}
                  className="mr-2"
                />
                <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded-full mb-2">
                  {project}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className="mb-4 w-full">
          <h3 className="font-semibold bg-blue-600 text-white px-2 py-1 rounded mb-2">
            Employés
          </h3>
          <div className="flex flex-wrap gap-2">
            {distinctEmployees.map((employee) => (
              <label key={employee} className="flex items-center">
                <input
                  type="checkbox"
                  value={employee}
                  onChange={() => handleEmployeeChange(employee)}
                  checked={selectedEmployees.includes(employee)}
                  className="mr-2"
                />
                <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded-full mb-2">
                  {employee}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className="mb-4 w-full">
          <h3 className="font-semibold bg-blue-600 text-white px-2 py-1 rounded mb-2">
            Activités
          </h3>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Rechercher activité..."
              value={activitySearch}
              onChange={(e) => setActivitySearch(e.target.value)}
              className="border p-2 rounded mb-2"
            />
            <select
              value={selectedActivity}
              onChange={(e) => handleActivityChange(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">Sélectionner une activité</option>
              {distinctActivities.map((activity) => (
                <option key={activity} value={activity}>
                  {activity}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mb-4 w-full">
          <h3 className="font-semibold bg-blue-600 text-white px-2 py-1 rounded mb-2">
            Lieux
          </h3>
          <div className="flex flex-wrap gap-2">
            {distinctLocations.map((location) => (
              <label key={location} className="flex items-center">
                <input
                  type="checkbox"
                  value={location}
                  onChange={() => handleLocationChange(location)}
                  checked={selectedLocations.includes(location)}
                  className="mr-2"
                />
                <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded-full mb-2">
                  {location}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className="mb-4 w-full">
          <h3 className="font-semibold bg-blue-600 text-white px-2 py-1 rounded mb-2">
            Type
          </h3>
          <div className="flex flex-wrap gap-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="Bon de Travail"
                onChange={() => handleTypeChange("Bon de Travail")}
                checked={selectedType === "Bon de Travail"}
                className="mr-2"
              />
              Bon de Travail
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="Journal de Chantier"
                onChange={() => handleTypeChange("Journal de Chantier")}
                checked={selectedType === "Journal de Chantier"}
                className="mr-2"
              />
              Journal de Chantier
            </label>
          </div>
        </div>
        <div className="mb-4 w-full">
          <h3 className="font-semibold bg-blue-600 text-white px-2 py-1 rounded mb-2">
            Plage Horaire
          </h3>
          <div className="flex flex-wrap gap-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="Jour"
                onChange={() => handlePlageHoraireChange("Jour")}
                checked={selectedPlageHoraire === "Jour"}
                className="mr-2"
              />
              Jour (5h-19h)
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="Nuit"
                onChange={() => handlePlageHoraireChange("Nuit")}
                checked={selectedPlageHoraire === "Nuit"}
                className="mr-2"
              />
              Nuit (19h-5h)
            </label>
          </div>
        </div>
        <div className="w-full flex justify-end">
          <button
            onClick={resetFilters}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            Réinitialiser
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterMenu;
