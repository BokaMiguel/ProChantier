import React, { useState } from "react";
import { FaArrowRight, FaFilePdf } from "react-icons/fa";
import InfoProjet from "./sections/InfoProjet";
import InfoEmployes from "./sections/InfoEmployes";
import ActiviteProjet from "./sections/ActiviteProjet/ActiviteProjet";
import MateriauxInfo from "./sections/MeteriauxInfo";
import SectionHeader from "./sections/sectionHeader/SectionHeader";
import { User } from "../models/JournalFormModel";

const Form: React.FC = () => {
    const [users, setUsers] = useState<User[]>([
        { id: 1, nom: "", fonction: "", equipement: "" },
    ]);

    const [sections, setSections] = useState({
        infoProjet: true,
        infoEmployes: true,
        grilleActivites: true,
        materiaux: true,
    });

    const toggleSection = (section: keyof typeof sections) => {
        setSections((prevSections) => ({
            ...prevSections,
            [section]: !prevSections[section],
        }));
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-4">
            <div className="w-full max-w-4xl bg-white rounded shadow-md p-6 space-y-6">
                <section>
                    <SectionHeader
                        title="1. INFORMATIONS DU PROJET"
                        sectionKey="infoProjet"
                        isOpen={sections.infoProjet}
                        onToggle={toggleSection}
                    />
                    {sections.infoProjet && <InfoProjet />}
                </section>

                <section>
                    <SectionHeader
                        title="2. INFORMATIONS DES EMPLOYÉS"
                        sectionKey="infoEmployes"
                        isOpen={sections.infoEmployes}
                        onToggle={toggleSection}
                    />
                    {sections.infoEmployes && (
                        <InfoEmployes users={users} setUsers={setUsers} />
                    )}
                </section>

                <section>
                    <SectionHeader
                        title="3. GRILLE DES ACTIVITÉS"
                        sectionKey="grilleActivites"
                        isOpen={sections.grilleActivites}
                        onToggle={toggleSection}
                    />
                    {sections.grilleActivites && (
                        <ActiviteProjet users={users} />
                    )}
                </section>

                <section>
                    <SectionHeader
                        title="4. SOUS-TRAITANTS"
                        sectionKey="materiaux"
                        isOpen={sections.materiaux}
                        onToggle={toggleSection}
                    />
                    {sections.materiaux && <MateriauxInfo />}
                </section>

                <div className="text-right mt-6 space-x-4">
                    <button className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition-colors duration-300">
                        Envoyer le formulaire
                        <FaArrowRight className="ml-2" />
                    </button>
                    <button className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition-colors duration-300">
                        Générer PDF
                        <FaFilePdf className="ml-2" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Form;
