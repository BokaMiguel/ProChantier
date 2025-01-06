import React from "react";
import ExpandableSection from "./ExpandableSection";
import {
  FaTasks,
  FaBoxes,
  FaPeopleCarry,
  FaUserTie,
  FaList,
  FaMapMarkerAlt,
  FaBalanceScale,
  FaStickyNote,
  FaClock,
  FaBox,
  FaUser,
  FaBriefcase,
  FaTools,
} from "react-icons/fa";
import { ExpandedSections, Journal } from "../../../../models/JournalFormModel";

interface JournalDetailsProps {
  journal: Journal;
  expandedSections: ExpandedSections;
  toggleSectionExpand: (section: keyof ExpandedSections) => void;
}

const JournalDetails: React.FC<JournalDetailsProps> = ({
  journal,
  expandedSections,
  toggleSectionExpand,
}) => (
  <tr>
    <td colSpan={7} className="p-4 bg-gray-50">
      <div className="grid grid-cols-1 gap-4">
        <ExpandableSection
          isOpen={expandedSections.employes}
          toggleSection={() => toggleSectionExpand("employes")}
          title="Employés"
          icon={<FaUserTie />}
        >
          <table className="w-full bg-white border rounded-lg shadow-md">
            <thead className="bg-gray-300 text-black">
              <tr>
                <th className="px-4 py-2 border">
                  <div className="flex items-center space-x-2">
                    <FaUser />
                    <span>Nom</span>
                  </div>
                </th>
                <th className="px-4 py-2 border">
                  <div className="flex items-center space-x-2">
                    <FaBriefcase />
                    <span>Fonction</span>
                  </div>
                </th>
                <th className="px-4 py-2 border">
                  <div className="flex items-center space-x-2">
                    <FaTools />
                    <span>Équipement</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {journal.employes.map((employe) => (
                <tr key={employe.id}>
                  <td className="px-4 py-2 border">
                    {employe.prenom + " " + employe.nom}
                  </td>
                  <td className="px-4 py-2 border">{employe.fonction?.nom || 'N/A'}</td>
                  <td className="px-4 py-2 border">{employe.equipement?.nom || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ExpandableSection>
        <ExpandableSection
          isOpen={expandedSections.activites}
          toggleSection={() => toggleSectionExpand("activites")}
          title="Activités"
          icon={<FaTasks />}
        >
          <table className="w-full bg-white border rounded-lg shadow-md">
            <thead className="bg-gray-300 text-black">
              <tr>
                <th className="px-4 py-2 border">
                  <div className="flex items-center space-x-2">
                    <FaList />
                    <span>Nom</span>
                  </div>
                </th>
                <th className="px-4 py-2 border">
                  <div className="flex items-center space-x-2">
                    <FaMapMarkerAlt />
                    <span>Lieu</span>
                  </div>
                </th>

                <th className="px-4 py-2 border">
                  <div className="flex items-center space-x-2">
                    <FaMapMarkerAlt />
                    <span>Localisation</span>
                  </div>
                </th>
                <th className="px-4 py-2 border">
                  <div className="flex items-center space-x-2">
                    <FaClock />
                    <span>Période</span>
                  </div>
                </th>
                <th className="px-4 py-2 border">
                  <div className="flex items-center space-x-2">
                    <FaBalanceScale />
                    <span>Quantité</span>
                  </div>
                </th>
                <th className="px-4 py-2 border">
                  <div className="flex items-center space-x-2">
                    <FaStickyNote />
                    <span>Notes</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {journal.activites.map((activite) => (
                <tr key={activite.id}>
                  {/* <td className="px-4 py-2 border">{activite.nom}</td> */}
                  <td className="px-4 py-2 border">
                    {/* {activite.lieu?.nom ?? ""} */}
                  </td>

                  {/* <td className="px-4 py-2 border">{activite.localisation}</td> */}
                  <td className="px-4 py-2 border">
                    {activite.hrsDebut + " " + activite.hrsFin}
                  </td>
                  <td className="px-4 py-2 border">{activite.quantite}</td>

                  {/* <td className="px-4 py-2 border">{activite.notes}</td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </ExpandableSection>

        <ExpandableSection
          isOpen={expandedSections.materiaux}
          toggleSection={() => toggleSectionExpand("materiaux")}
          title="Matériaux"
          icon={<FaBoxes />}
        >
          <table className="w-full bg-white border rounded-lg shadow-md">
            <thead className="bg-gray-300 text-black">
              <tr>
                <th className="px-4 py-2 border">
                  <div className="flex items-center space-x-2">
                    <FaBox />
                    <span>Nom</span>
                  </div>
                </th>
                <th className="px-4 py-2 border">
                  <div className="flex items-center space-x-2">
                    <FaBalanceScale />
                    <span>Quantité</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {journal.materiaux?.map((materiau) => (
                <tr key={materiau.id}>
                  <td className="px-4 py-2 border">{materiau.nom}</td>
                  <td className="px-4 py-2 border">{materiau.quantite}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ExpandableSection>

        <ExpandableSection
          isOpen={expandedSections.sousTraitants}
          toggleSection={() => toggleSectionExpand("sousTraitants")}
          title="Sous-traitants"
          icon={<FaPeopleCarry />}
        >
          <table className="w-full bg-white border rounded-lg shadow-md">
            <thead className="bg-gray-300 text-black">
              <tr>
                <th className="px-4 py-2 border">
                  <div className="flex items-center space-x-2">
                    <FaUserTie />
                    <span>Nom</span>
                  </div>
                </th>
                <th className="px-4 py-2 border">
                  <div className="flex items-center space-x-2">
                    <FaBalanceScale />
                    <span>Quantité</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {journal.sousTraitants?.map((sousTraitant) => (
                <tr key={sousTraitant.id}>
                  <td className="px-4 py-2 border">{sousTraitant.nom}</td>
                  <td className="px-4 py-2 border">{sousTraitant.quantite}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ExpandableSection>
      </div>
    </td>
  </tr>
);

export default JournalDetails;
