import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaTasks,
  FaClipboardList,
  FaCog,
  FaChartBar,
  FaChevronRight,
  FaChevronLeft,
  FaUser,
  FaProjectDiagram,
  FaChevronDown,
  FaChevronUp,
  FaFileInvoice, // Icone pour Bordereau
  FaClock, // Icone pour Feuille de temps
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext"; // Importer useAuth pour accéder au contexte utilisateur

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, selectedProject, login } = useAuth(); // Utiliser le contexte utilisateur
  const location = useLocation();

  const NavItem = ({
    to,
    icon,
    label,
  }: {
    to: string;
    icon: React.ReactNode;
    label: string;
  }) => {
    const isActive = location.pathname === to;
    return (
      <li className={`relative ${isActive ? "bg-blue-700" : ""}`}>
        <Link
          to={to}
          className={`flex items-center p-4 text-gray-300 hover:bg-gray-700 hover:text-white ${
            isActive ? "text-white" : ""
          }`}
        >
          {icon}
          {isOpen && <span className="ml-3">{label}</span>}
        </Link>
        {isActive && (
          <div className="absolute top-0 right-0 w-1 h-full bg-white shadow-[0_0_10px_#ffffff] rounded-l" />
        )}
      </li>
    );
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div
      className={`flex flex-col h-screen ${
        isOpen ? "w-64" : "w-16"
      } bg-blue-800 text-white transition-width duration-300 sticky top-0`}
    >
      <div className="flex flex-col flex-grow">
        <div className="flex flex-col items-center p-4">
          <div className="flex items-center flex-shrink-0">
            <img
              src={`${process.env.PUBLIC_URL}/images/bruneau.png`}
              alt="Logo"
              className={`transition-all duration-300 ${
                isOpen ? "w-24 h-24" : "w-10 h-10"
              }`}
            />
          </div>
        </div>
        {selectedProject && isOpen && (
          <li className="flex flex-col p-4 text-gray-300">
            <div className="flex items-center mb-2">
              <FaProjectDiagram className="mr-2" />
              <span className="text-sm">
                Projet : {selectedProject.NumeroProjet}
              </span>
              <button
                onClick={toggleDropdown}
                className="ml-2 text-gray-300 focus:outline-none"
              >
                {isDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
              </button>
            </div>
            {isDropdownOpen && isOpen && (
              <div className="flex items-start mt-2">
                <span className="text-sm font-italic">
                  {selectedProject.NomProjet}
                </span>
              </div>
            )}
          </li>
        )}

        <nav className="flex-1">
          <ul className="flex flex-col mt-2">
            <NavItem
              to="/"
              icon={<FaHome className="mr-3" />}
              label="Accueil"
            />
            <NavItem
              to="/journal-chantier"
              icon={<FaTasks className="mr-3" />}
              label="Journal de chantier"
            />
            <NavItem
              to="/planning"
              icon={<FaClipboardList className="mr-3" />}
              label="Planification"
            />
            <NavItem
              to="/gestions"
              icon={<FaCog className="mr-3" />}
              label="Gestions"
            />
            <NavItem
              to="/rapport"
              icon={<FaChartBar className="mr-3" />}
              label="Rapport"
            />
            {/* Sections désactivées temporairement
            <NavItem
              to="/bordereau"
              icon={<FaFileInvoice className="mr-3" />}
              label="Bordereau"
            />
            <NavItem
              to="/feuille-de-temps"
              icon={<FaClock className="mr-3" />}
              label="Feuille de temps"
            />
            */}
          </ul>
        </nav>
      </div>
      <div className="flex flex-col items-center p-4">
        {user ? (
          <>
            <div className="flex items-center mb-4">
              {/* {isOpen && <span className="ml-2">{user.name}</span>} */}
            </div>
          </>
        ) : (
          <button
            onClick={login}
            className="flex items-center p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            <FaUser className="mr-2" />
            {isOpen && "Connexion"}
          </button>
        )}
      </div>
      <div className="flex justify-center p-4">
        <button
          onClick={toggleSidebar}
          className="text-white focus:outline-none"
        >
          {isOpen ? (
            <FaChevronLeft className="text-2xl" />
          ) : (
            <FaChevronRight className="text-2xl" />
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
