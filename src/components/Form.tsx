import React, { useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import InfoProjet from "./sections/InfoProjet";
import InfoEmployes from "./sections/InfoEmployes";
import StatsGrid from "./sections/StatsGrid";
import ActiviteProjet from "./sections/ActiviteProjet/ActiviteProjet";
import MateriauxInfo from "./sections/MeteriauxInfo";

interface User {
  id: number;
  nom: string;
  fonction: string;
  equipement: string;
}

const Form: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [users, setUsers] = useState<User[]>([
    { id: 1, nom: "", fonction: "", equipement: "" },
  ]);

  const totalSteps = 4;

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const renderSectionTitle = () => {
    switch (currentStep) {
      case 1:
        return "INFORMATIONS DU PROJET";
      case 2:
        return "GRILLE DES ACTIVITÉS";
      case 3:
        return "INFORMATIONS DES EMPLOYÉS";
      case 4:
        return "SOUS-TRAITANTS";
      default:
        return "";
    }
  };

  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-4">
      <div className="w-full max-w-4xl bg-white rounded shadow-md p-6">
        <header className="mb-4">
          <h2
            className="text-2xl font-bold bg-blue-700 text-white p-4 rounded"
            style={{ backgroundColor: "rgb(47, 67, 121)" }}
          >
            {renderSectionTitle()}
          </h2>
          <div className="w-full bg-gray-300 rounded-full h-4 mt-4">
            <div
              className="bg-blue-600 h-4 rounded-full transition-width duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="text-right text-gray-700 mt-2">
            Étape {currentStep} / {totalSteps}
          </div>
        </header>
        {currentStep === 1 && <InfoProjet />}
        {currentStep === 2 && (
          <InfoEmployes users={users} setUsers={setUsers} />
        )}
        {currentStep === 3 && <ActiviteProjet users={users} />}
        {currentStep === 4 && <MateriauxInfo />}

        <div className="flex justify-between mt-6">
          {currentStep > 1 && (
            <button
              onClick={prevStep}
              className="inline-flex items-center px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-500 hover:text-white transition-colors duration-300"
            >
              <FaArrowLeft className="mr-2" />
              Précédent
            </button>
          )}
          {currentStep < 4 && (
            <button
              onClick={nextStep}
              className="ml-auto inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition-colors duration-300"
            >
              Suivant
              <FaArrowRight className="ml-2" />
            </button>
          )}
          {currentStep === 4 && (
            <button
              onClick={nextStep}
              className="ml-auto inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition-colors duration-300"
            >
              Envoyer le formulaire
              <FaArrowRight className="ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Form;
