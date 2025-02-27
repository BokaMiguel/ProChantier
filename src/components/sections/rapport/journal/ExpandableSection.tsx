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
  <div className="mb-4 overflow-hidden rounded-lg shadow-sm border border-gray-200 bg-white">
    <button 
      className={`w-full flex items-center justify-between px-4 py-3 transition-colors duration-200 ${
        isOpen ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"
      }`} 
      onClick={toggleSection}
    >
      <div className="flex items-center space-x-3">
        <span className={`text-lg ${isOpen ? "text-white" : "text-blue-600"}`}>
          {icon}
        </span>
        <span className="font-semibold text-base text-gray-900">{title}</span>
      </div>
      <span className="text-sm">
        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
      </span>
    </button>
    {isOpen && (
      <div className="p-4 bg-white border-t border-gray-200 transition-all duration-300 ease-in-out">
        {children}
      </div>
    )}
  </div>
);

export default ExpandableSection;
