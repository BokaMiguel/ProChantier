import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { FaArrowRight, FaFilePdf } from "react-icons/fa";
import { usePDF } from "react-to-pdf";
import InfoProjet from "../sections/InfoProjet";
import InfoEmployes from "../sections/InfoEmployes";
import ActiviteProjet from "../sections/activiteProjet/ActiviteProjet";
import SousTraitantSection from "../sections/SousTraitantSection";
import { Employe } from "../../models/JournalFormModel";
import SectionHeader from "../sections/sectionHeader/SectionHeader";
import MateriauxInfo from "../sections/MeteriauxInfo";
import { useAuth } from "../../context/AuthContext";

const Form: React.FC = () => {
  const {
    selectedProject,
    fetchEmployes,
    fetchBases,
    fetchLieux,
    fetchFonctions,
    fetchEquipements,
    fetchSousTraitants,
    fetchMateriaux,
    employees,
    fonctions,
    lieux,
    equipements,
    sousTraitants,
    materiaux,
    bases,
  } = useAuth();

  const { type } = useParams<{ type: string }>();
  const [users, setUsers] = useState<Employe[]>([
    {
      id: 1,
      nom: "",
      prenom: "",
      fonction: {
        id: null,
        nom: "",
      },
      equipement: {
        id: null,
        nom: "",
      },
    },
  ]);

  const [sections, setSections] = useState({
    infoProjet: { visible: true, open: true },
    infoEmployes: { visible: true, open: true },
    grilleActivites: { visible: true, open: true },
    materiaux: { visible: true, open: true },
    sousTraitants: { visible: true, open: true },
  });

  useEffect(() => {
    if (type === "entretien") {
      setSections((prevSections) => ({
        ...prevSections,
        sousTraitants: { ...prevSections.sousTraitants, visible: false },
      }));
    } else if (type === "civil") {
      setSections((prevSections) => ({
        ...prevSections,
        materiaux: { ...prevSections.materiaux, visible: false },
      }));
    }
  }, [type]);

  const toggleSection = (section: keyof typeof sections) => {
    setSections((prevSections) => ({
      ...prevSections,
      [section]: {
        ...prevSections[section],
        open: !prevSections[section].open,
      },
    }));
  };

  const getVisibleSections = () => {
    return Object.keys(sections).filter(
      (section) => sections[section as keyof typeof sections].visible
    );
  };

  const visibleSections = getVisibleSections();

  // Référence pour le contenu à convertir en PDF
  const { toPDF, targetRef } = usePDF({ filename: "formulaire.pdf" });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-4">
      <div
        ref={targetRef}
        className="w-full max-w-4xl bg-white rounded shadow-md p-6 space-y-6"
      >
        {sections.infoProjet.visible && (
          <section>
            <SectionHeader
              title={`${
                visibleSections.indexOf("infoProjet") + 1
              }. Informations du Projet`}
              sectionKey="infoProjet"
              isOpen={sections.infoProjet.open}
              onToggle={toggleSection}
            />
            {sections.infoProjet.open && <InfoProjet />}
          </section>
        )}

        {sections.infoEmployes.visible && (
          <section>
            <SectionHeader
              title={`${
                visibleSections.indexOf("infoEmployes") + 1
              }. Informations des Employés`}
              sectionKey="infoEmployes"
              isOpen={sections.infoEmployes.open}
              onToggle={toggleSection}
            />
            {sections.infoEmployes.open && (
              <InfoEmployes users={users} setUsers={setUsers} />
            )}
          </section>
        )}

        {sections.grilleActivites.visible && (
          <section>
            <SectionHeader
              title={`${
                visibleSections.indexOf("grilleActivites") + 1
              }. Grille des Activités`}
              sectionKey="grilleActivites"
              isOpen={sections.grilleActivites.open}
              onToggle={toggleSection}
            />
            {sections.grilleActivites.open && <ActiviteProjet users={users} />}
          </section>
        )}

        {sections.materiaux.visible && (
          <section>
            <SectionHeader
              title={`${
                visibleSections.indexOf("materiaux") + 1
              }. Matériaux/Outillage`}
              sectionKey="materiaux"
              isOpen={sections.materiaux.open}
              onToggle={toggleSection}
            />
            {sections.materiaux.open && <MateriauxInfo />}
          </section>
        )}

        {sections.sousTraitants.visible && (
          <section>
            <SectionHeader
              title={`${
                visibleSections.indexOf("sousTraitants") + 1
              }. Sous-Traitants`}
              sectionKey="sousTraitants"
              isOpen={sections.sousTraitants.open}
              onToggle={toggleSection}
            />
            {sections.sousTraitants.open && <SousTraitantSection />}
          </section>
        )}

        <div className="text-right mt-6 space-x-4">
          <button
            onClick={() => toPDF()}
            className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition-colors duration-300"
          >
            Générer PDF
            <FaFilePdf className="ml-2" />
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition-colors duration-300">
            Envoyer le formulaire
            <FaArrowRight className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Form;
