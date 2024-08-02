import React from "react";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";

interface ExpandableSectionProps {
  isOpen: boolean;
  toggleSection: () => void;
  title: string;
  icon: JSX.Element;
  children: React.ReactNode;
}

const ExpandableSection: React.FC<ExpandableSectionProps> = ({
  isOpen,
  toggleSection,
  children,
  title,
  icon,
}) => (
  <div>
    <button className="flex items-center space-x-2" onClick={toggleSection}>
      {isOpen ? <FaChevronUp /> : <FaChevronDown />}
      {icon}
      <span className="font-bold">{title}</span>
    </button>
    {isOpen && <div className="grid grid-cols-1 gap-4 mt-2">{children}</div>}
  </div>
);

export default ExpandableSection;
