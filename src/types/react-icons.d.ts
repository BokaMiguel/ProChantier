import * as React from 'react';

declare module 'react-icons' {
  export interface IconBaseProps extends React.SVGAttributes<SVGElement> {
    size?: string | number;
    color?: string;
    title?: string;
    className?: string;
  }
  
  export type IconType = React.ComponentType<IconBaseProps>;
}

declare module 'react-icons/fa' {
  import { IconType } from 'react-icons';
  export const FaTimes: IconType;
  export const FaUser: IconType;
  export const FaBriefcase: IconType;
  export const FaToolbox: IconType;
  export const FaPlusCircle: IconType;
  export const FaCubes: IconType;
  export const FaBuilding: IconType;
  export const FaTools: IconType;
  export const FaRuler: IconType;
  export const FaUndo: IconType;
  export const FaSave: IconType;
  export const FaCheck: IconType;
  export const FaSearch: IconType;
  export const FaFilter: IconType;
  export const FaSun: IconType;
  export const FaMoon: IconType;
  export const FaTrash: IconType;
  export const FaMapMarkerAlt: IconType;
  export const FaLink: IconType;
  export const FaCalendarAlt: IconType;
  export const FaInfoCircle: IconType;
  export const FaCloud: IconType;
  export const FaCloudRain: IconType;
  export const FaSnowflake: IconType;
  export const FaTemperatureHigh: IconType;
  export const FaHourglassHalf: IconType;
  export const FaPlayCircle: IconType;
  export const FaCheckCircle: IconType;
  // Vous pouvez ajouter d'autres icônes au besoin
  export * from 'react-icons/fa6';
}
