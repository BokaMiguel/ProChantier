import React from "react";
import { FaPlus, FaMinus } from "react-icons/fa";

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
      className="flex justify-between items-center bg-blue-800 text-white p-4 rounded cursor-pointer"
      onClick={() => onToggle(sectionKey)}
    >
      <h2 className="text-2xl font-bold">{title}</h2>
      <span>{isOpen ? <FaMinus /> : <FaPlus />}</span>
    </header>
  );
};

export default SectionHeader;
