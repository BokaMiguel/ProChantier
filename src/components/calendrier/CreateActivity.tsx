import React, { useState } from "react";
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaRoad,
  FaClock,
  FaSign,
  FaPencilAlt,
} from "react-icons/fa";

const CreateActivity: React.FC = () => {
  const [activityName, setActivityName] = useState<string>("");
  const [entreprise, setEntreprise] = useState<string>("");
  const [localisation, setLocalisation] = useState<string>("");
  const [axe, setAxe] = useState<string>("");
  const [plageHoraire, setPlageHoraire] = useState<string>("");
  const [sign, setSign] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newActivity = {
      id: Date.now(),
      nom: activityName,
      entreprise,
      localisation,
      axe,
      plageHoraire,
      sign,
      notes,
    };
    console.log("Activity Created:", newActivity);
    // Reset form fields
    setActivityName("");
    setEntreprise("");
    setLocalisation("");
    setAxe("");
    setPlageHoraire("");
    setSign("");
    setNotes("");
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-center bg-blue-500 text-white p-4 rounded">
        Créer une Activité
      </h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-6">
          <label className="block mb-2 font-bold">
            <FaBuilding className="inline mr-2" />
            Nom de l'Activité
          </label>
          <input
            type="text"
            value={activityName}
            onChange={(e) => setActivityName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg shadow-sm border-gray-300"
          />
        </div>
        <div className="col-span-12 md:col-span-6">
          <label className="block mb-2 font-bold">
            <FaBuilding className="inline mr-2" />
            Entreprise
          </label>
          <input
            type="text"
            value={entreprise}
            onChange={(e) => setEntreprise(e.target.value)}
            className="w-full px-4 py-2 rounded-lg shadow-sm border-gray-300"
          />
        </div>
        <div className="col-span-12 md:col-span-6">
          <label className="block mb-2 font-bold">
            <FaMapMarkerAlt className="inline mr-2" />
            Localisation
          </label>
          <input
            type="text"
            value={localisation}
            onChange={(e) => setLocalisation(e.target.value)}
            className="w-full px-4 py-2 rounded-lg shadow-sm border-gray-300"
          />
        </div>
        <div className="col-span-12 md:col-span-6">
          <label className="block mb-2 font-bold">
            <FaRoad className="inline mr-2" />
            Axe
          </label>
          <input
            type="text"
            value={axe}
            onChange={(e) => setAxe(e.target.value)}
            className="w-full px-4 py-2 rounded-lg shadow-sm border-gray-300"
          />
        </div>
        <div className="col-span-12 md:col-span-6">
          <label className="block mb-2 font-bold">
            <FaClock className="inline mr-2" />
            Plage Horaire
          </label>
          <input
            type="text"
            value={plageHoraire}
            onChange={(e) => setPlageHoraire(e.target.value)}
            className="w-full px-4 py-2 rounded-lg shadow-sm border-gray-300"
          />
        </div>
        <div className="col-span-12 md:col-span-6">
          <label className="block mb-2 font-bold">
            <FaSign className="inline mr-2" />
            Signalisation
          </label>
          <input
            type="text"
            value={sign}
            onChange={(e) => setSign(e.target.value)}
            className="w-full px-4 py-2 rounded-lg shadow-sm border-gray-300"
          />
        </div>
        <div className="col-span-12">
          <label className="block mb-2 font-bold">
            <FaPencilAlt className="inline mr-2" />
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2 rounded-lg shadow-sm border-gray-300"
            rows={4}
          />
        </div>
        <div className="col-span-12">
          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg shadow-sm"
          >
            Créer l'Activité
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateActivity;
