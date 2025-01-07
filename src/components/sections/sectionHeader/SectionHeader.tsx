import React from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

interface SectionHeaderProps {
  title: string;
  sectionKey:
    | "infoProjet"
    | "grilleActivites"
    | "infoEmployes"
    | "materiaux"
    | "sousTraitants"
    | "notes";
  isOpen: boolean;
  onToggle: (
    key:
      | "infoProjet"
      | "grilleActivites"
      | "infoEmployes"
      | "materiaux"
      | "sousTraitants"
      | "notes"
  ) => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  sectionKey,
  isOpen,
  onToggle,
}) => {
  return (
    <header
      onClick={() => onToggle(sectionKey)}
      className={`
        flex justify-between items-center 
        bg-gradient-to-r from-blue-600 to-blue-700
        text-white p-4 rounded-lg cursor-pointer
        shadow-md hover:shadow-lg
        transform transition-all duration-300 ease-in-out
        ${isOpen ? 'mb-6' : 'mb-2 hover:-translate-y-1'}
      `}
    >
      <h2 className="text-xl font-semibold flex items-center">
        <span className="mr-3">{title}</span>
        {!isOpen && (
          <span className="text-sm bg-blue-500 px-3 py-1 rounded-full">
            Cliquez pour ouvrir
          </span>
        )}
      </h2>
      <div className={`
        transform transition-transform duration-300
        ${isOpen ? 'rotate-180' : 'rotate-0'}
      `}>
        <FaChevronDown className="w-5 h-5" />
      </div>
    </header>
  );
};

export default SectionHeader;
