import React from "react";
import {
  FaSun,
  FaCloud,
  FaCloudRain,
  FaSnowflake,
  FaThermometerThreeQuarters,
  FaCalendarAlt,
  FaClock,
  FaBuilding,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from "../../context/AuthContext";
import { useParams } from "react-router-dom";

interface InfoProjetProps {
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
  arrivee: string;
  setArrivee: React.Dispatch<React.SetStateAction<string>>;
  depart: string;
  setDepart: React.Dispatch<React.SetStateAction<string>>;
  weather: string;
  setWeather: React.Dispatch<React.SetStateAction<string>>;
}

const InfoProjet: React.FC<InfoProjetProps> = ({
  date,
  setDate,
  arrivee,
  setArrivee,
  depart,
  setDepart,
  weather,
  setWeather,
}) => {
  const { idPlanif } = useParams<{ idPlanif: string }>();
  const { selectedProject, activitesPlanif } = useAuth();

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setDate(date);
    }
  };

  const currentActivity = activitesPlanif?.find(
    (a) => a.id === Number(idPlanif)
  );

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
              <span className="bg-blue-100 p-2 rounded-full mr-2">
                <FaBuilding className="text-blue-600" />
              </span>
              Projet #
            </label>
            <input
              type="text"
              value={selectedProject?.NumeroProjet || ""}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
          <div className="relative">
            <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
              <span className="bg-blue-100 p-2 rounded-full mr-2">
                <FaCalendarAlt className="text-blue-600" />
              </span>
              Date
            </label>
            <div className="flex flex-col relative">
              <DatePicker
                calendarStartDay={0}
                selected={currentActivity?.date ? new Date(currentActivity.date) : date}
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                locale={fr}
                wrapperClassName="relative z-50"
                calendarClassName="absolute left-0 mt-2 bg-white shadow-lg rounded-lg border border-gray-200"
                shouldCloseOnSelect={true}
                showPopperArrow={false}
              />
              {date && (
                <div className="mt-2 text-gray-600 text-sm text-center">
                  {format(currentActivity?.date ? new Date(currentActivity.date) : date, "EEEE d MMMM yyyy", { locale: fr })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative">
            <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
              <span className="bg-blue-100 p-2 rounded-full mr-2">
                <FaClock className="text-blue-600" />
              </span>
              Hrs Arrivée
            </label>
            <input
              type="time"
              value={currentActivity?.hrsDebut || arrivee}
              onChange={(e) => setArrivee(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
          <div className="relative">
            <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
              <span className="bg-blue-100 p-2 rounded-full mr-2">
                <FaClock className="text-blue-600" />
              </span>
              Hrs Départ
            </label>
            <input
              type="time"
              value={currentActivity?.hrsFin || depart}
              onChange={(e) => setDepart(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
          <div className="relative">
            <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
              <span className="bg-blue-100 p-2 rounded-full mr-2">
                <FaThermometerThreeQuarters className="text-blue-600" />
              </span>
              Météo
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setWeather("Ensoleillé")}
                className={`p-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  weather === "Ensoleillé"
                    ? "bg-yellow-100 text-yellow-600 ring-2 ring-yellow-500"
                    : "bg-gray-100 text-gray-600 hover:bg-yellow-50"
                }`}
              >
                <FaSun />
              </button>
              <button
                type="button"
                onClick={() => setWeather("Nuageux")}
                className={`p-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  weather === "Nuageux"
                    ? "bg-gray-200 text-gray-600 ring-2 ring-gray-500"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <FaCloud />
              </button>
              <button
                type="button"
                onClick={() => setWeather("Pluvieux")}
                className={`p-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  weather === "Pluvieux"
                    ? "bg-blue-100 text-blue-600 ring-2 ring-blue-500"
                    : "bg-gray-100 text-gray-600 hover:bg-blue-50"
                }`}
              >
                <FaCloudRain />
              </button>
              <button
                type="button"
                onClick={() => setWeather("Neigeux")}
                className={`p-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  weather === "Neigeux"
                    ? "bg-blue-50 text-blue-600 ring-2 ring-blue-500"
                    : "bg-gray-100 text-gray-600 hover:bg-blue-50"
                }`}
              >
                <FaSnowflake />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoProjet;
