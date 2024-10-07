import React from "react";
import {
  FaSun,
  FaCloud,
  FaCloudRain,
  FaSnowflake,
  FaThermometerThreeQuarters,
  FaCalendarAlt,
  FaClock,
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
    <div className="bg-white rounded-lg overflow-hidden">
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Projet #
            </label>
            <input
              type="text"
              value={selectedProject?.NumeroProjet || ""}
              readOnly
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              <FaCalendarAlt className="inline-block mr-2" />
              Date
            </label>
            <DatePicker
              calendarStartDay={0}
              selected={
                currentActivity?.date ? new Date(currentActivity.date) : date
              }
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              locale={fr}
            />
            {date && (
              <div className="mt-1 text-gray-600 text-sm">
                {format(
                  currentActivity?.date ? new Date(currentActivity.date) : date,
                  "EEEE d MMMM yyyy",
                  { locale: fr }
                )}
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              <FaClock className="inline-block mr-2" />
              Hrs Arrivée
            </label>
            <input
              type="time"
              value={currentActivity?.hrsDebut || arrivee}
              onChange={(e) => setArrivee(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              <FaClock className="inline-block mr-2" />
              Hrs Départ
            </label>
            <input
              type="time"
              value={currentActivity?.hrsFin || depart}
              onChange={(e) => setDepart(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2 text-center">
            Types de Journée
          </label>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { name: "Soleil", icon: FaSun },
              { name: "Nuage", icon: FaCloud },
              { name: "Pluie", icon: FaCloudRain },
              { name: "Neige", icon: FaSnowflake },
              { name: "Chaleur+", icon: FaThermometerThreeQuarters },
            ].map((type) => (
              <button
                key={type.name}
                type="button"
                className={`flex items-center space-x-2 py-2 px-4 rounded ${
                  weather === type.name
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setWeather(type.name)}
              >
                <type.icon />
                <span>{type.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoProjet;
