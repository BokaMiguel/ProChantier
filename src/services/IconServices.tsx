import React from "react";
import {
  FaSun,
  FaCloud,
  FaCloudRain,
  FaSnowflake,
  FaTemperatureHigh,
  FaHourglassHalf,
  FaPlayCircle,
  FaCheckCircle,
} from "react-icons/fa";
import { Statut } from "../models/JournalFormModel";

export const getMeteoIcon = (meteoId?: number): JSX.Element | null => {
  // Déterminer le nom de la météo en fonction de l'ID
  let weatherName = getMeteoName(meteoId);

  switch (weatherName) {
    case "Soleil":
      return <FaSun className="text-yellow-500" />;
    case "Nuage":
      return <FaCloud className="text-gray-500" />;
    case "Pluie":
      return <FaCloudRain className="text-blue-500" />;
    case "Neige":
      return <FaSnowflake className="text-blue-200" />;
    case "Chaleur":
      return <FaTemperatureHigh className="text-red-500" />;
    default:
      return null;
  }
};

export const getMeteoName = (meteoId?: number): string => {
  switch (meteoId) {
    case 1:
      return "Soleil";
    case 2:
      return "Nuage";
    case 3:
      return "Pluie";
    case 4:
      return "Neige";
    case 5:
      return "Chaleur";
    default:
      return "Inconnu";
  }
};

export const getStatutIcon = (statutId: number): JSX.Element | null => {
  // Déterminer le nom du statut en fonction de l'ID
  let statutName = "";
  switch (statutId) {
    case 1:
      statutName = "En attente";
      break;
    case 2:
      statutName = "En cours";
      break;
    case 3:
      statutName = "Terminé";
      break;
    default:
      statutName = "Inconnu";
  }

  switch (statutName) {
    case "En attente":
      return <FaHourglassHalf className="text-yellow-500" />;
    case "En cours":
      return <FaPlayCircle className="text-blue-500" />;
    case "Terminé":
      return <FaCheckCircle className="text-green-500" />;
    default:
      return <FaHourglassHalf className="text-gray-500" />;
  }
};
