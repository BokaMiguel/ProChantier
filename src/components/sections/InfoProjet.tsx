import React, { useState } from "react";
import {
  FaSun,
  FaCloud,
  FaCloudRain,
  FaSnowflake,
  FaThermometerThreeQuarters,
  FaCalendarAlt,
  FaClock,
  FaFileAlt,
  FaTasks,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const InfoProjet: React.FC = () => {
  const [type, setType] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [arrivee, setArrivee] = useState("06:30");
  const [depart, setDepart] = useState("16:30");
  const [weather, setWeather] = useState("");

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setDate(date);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Type de rapport:
        </label>
        <div className="flex space-x-2 justify-center">
          <button
            type="button"
            className={`flex-1 py-3 px-4 rounded-l flex items-center justify-center ${
              type === "Journal de Chantier"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setType("Journal de Chantier")}
          >
            Journal de Chantier
            <FaFileAlt className="ml-2" />
          </button>
          <button
            type="button"
            className={`flex-1 py-3 px-4 rounded-r flex items-center justify-center ${
              type === "Bon de Travail"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setType("Bon de Travail")}
          >
            Bon de Travail
            <FaTasks className="ml-2" />
          </button>
        </div>
      </div>
      <div className="mb-4 grid grid-cols-2 gap-2">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-1">
            Projet #
          </label>
          <input
            type="text"
            value="2024-1232"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-1">
            <span className="inline-block mr-1">
              <FaCalendarAlt />
            </span>{" "}
            Date
          </label>
          <DatePicker
            calendarStartDay={0}
            selected={date}
            onChange={handleDateChange}
            dateFormat="dd/MM/yyyy"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            locale={fr}
          />
          {date && (
            <div className="mt-1 text-gray-700 text-sm">
              {format(date, "EEEE d MMMM yyyy", { locale: fr })}
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-1">
            <span className="inline-block mr-1">
              <FaClock />
            </span>{" "}
            Hrs Arrivée
          </label>
          <input
            type="time"
            value={arrivee}
            onChange={(e) => setArrivee(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-1">
            <span className="inline-block mr-1">
              <FaClock />
            </span>{" "}
            Hrs Départ
          </label>
          <input
            type="time"
            value={depart}
            onChange={(e) => setDepart(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Types de Journée
        </label>
        <div className="flex space-x-2 justify-center">
          <button
            type="button"
            className={`flex items-center space-x-1 py-2 px-4 rounded ${
              weather === "Soleil"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setWeather("Soleil")}
          >
            <span>Soleil</span>
            <FaSun className="ml-1" />
          </button>
          <button
            type="button"
            className={`flex items-center space-x-1 py-2 px-4 rounded ${
              weather === "Nuage"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setWeather("Nuage")}
          >
            <span>Nuage</span>
            <FaCloud className="ml-1" />
          </button>
          <button
            type="button"
            className={`flex items-center space-x-1 py-2 px-4 rounded ${
              weather === "Pluie"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setWeather("Pluie")}
          >
            <span>Pluie</span>
            <FaCloudRain className="ml-1" />
          </button>
          <button
            type="button"
            className={`flex items-center space-x-1 py-2 px-4 rounded ${
              weather === "Neige"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setWeather("Neige")}
          >
            <span>Neige</span>
            <FaSnowflake className="ml-1" />
          </button>
          <button
            type="button"
            className={`flex items-center space-x-1 py-2 px-4 rounded ${
              weather === "Chaleur+"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setWeather("Chaleur+")}
          >
            <span>Chaleur+</span>
            <FaThermometerThreeQuarters className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoProjet;
