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

export const getMeteoIcon = (weatherName: string): JSX.Element | null => {
  switch (weatherName) {
    case "Soleil":
      return (
        <div className="flex items-center space-x-2">
          <FaSun className="text-yellow-500" />
          <span>{weatherName}</span>
        </div>
      );
    case "Nuage":
      return (
        <div className="flex items-center space-x-2">
          <FaCloud className="text-gray-500" />
          <span>{weatherName}</span>
        </div>
      );
    case "Pluie":
      return (
        <div className="flex items-center space-x-2">
          <FaCloudRain className="text-blue-500" />
          <span>{weatherName}</span>
        </div>
      );
    case "Neige":
      return (
        <div className="flex items-center space-x-2">
          <FaSnowflake className="text-blue-200" />
          <span>{weatherName}</span>
        </div>
      );
    case "Chaleur":
      return (
        <div className="flex items-center space-x-2">
          <FaTemperatureHigh className="text-red-500" />
          <span>{weatherName}</span>
        </div>
      );
    default:
      return null;
  }
};

export const getStatutIcon = (statut: Statut): JSX.Element | null => {
  switch (statut.name) {
    case "En attente":
      return (
        <div className="flex items-center space-x-2">
          <FaHourglassHalf className="text-yellow-500" />
          <span>{statut.name}</span>
        </div>
      );
    case "En cours":
      return (
        <div className="flex items-center space-x-2">
          <FaPlayCircle className="text-blue-500" />
          <span>{statut.name}</span>
        </div>
      );
    case "Terminé":
      return (
        <div className="flex items-center space-x-2">
          <FaCheckCircle className="text-green-500" />
          <span>{statut.name}</span>
        </div>
      );
    default:
      return null;
  }
};
