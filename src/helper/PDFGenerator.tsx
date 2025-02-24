import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Font,
  Image,
  Svg,
  Path,
} from "@react-pdf/renderer";
import { styles } from '../styles/PDFStyles';
import {
  Employe,
  PlanifChantier,
  PlanifActivites,
  Localisation,
  SignatureData,
  Activite,
  Lieu,
  JournalSousTraitant,
} from "../models/JournalFormModel";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Project } from "../models/ProjectInfoModel";

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
      fontWeight: "normal",
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: "bold",
    },
  ],
});

interface PDFData {
  totals: any;
  journalDate: Date;
  journalArrivee: string;
  journalDepart: string;
  journalWeather: string;
  journalUsers: Employe[];
  planifChantier: PlanifChantier;
  planifActivites: PlanifActivites[];
  journalMateriaux: any[];
  journalSousTraitants: JournalSousTraitant[];
  userStats: {
    id: number;
    nom: string;
    act: number[];
    ts: number;
    td: number;
    totals?: {
      act: number[];
      ts: number;
      td: number;
    };
  }[];
  notes: string;
  projetId: string;
  signatureData: SignatureData | null;
}

interface PDFDocumentProps {
  data: {
    journalDate: Date;
    journalArrivee: string;
    journalDepart: string;
    journalWeather: string;
    journalUsers: Employe[];
    planifChantier: PlanifChantier;
    planifActivites: PlanifActivites[];
    journalMateriaux: any[];
    journalSousTraitants: JournalSousTraitant[];
    userStats: { id: number; nom: string; act: number[]; ts: number; td: number }[];
    totals: { act: number[]; ts: number; td: number };
    notes: string;
    signatureData: { signature: string; signataire: string; date: Date } | null;
  };
  selectedProject: Project | null;
  activites: Activite[] | null;
  lieux: Lieu[] | null;
  bases: Localisation[] | null;
  journalPlanifId: number;
}

interface EnrichedPlanifActivite extends PlanifActivites {
  activiteNom?: string;
  lieuNom?: string;
}

// Fonction utilitaire pour formater la date
const formatDateForFileName = (date: Date): string => {
  return date.toLocaleDateString("fr-FR").split("/").join("-");
};

const formatDateToFrenchText = (date: Date): string => {
  return format(date, 'EEEE d MMMM yyyy', { locale: fr });
};

const Separator = () => <View style={styles.separator} />;

const InfoIcon = () => (
  <Svg viewBox="0 0 24 24" width={20} height={20}>
    <Path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
      fill="#2c3e50"
    />
  </Svg>
);

const EmployeesIcon = () => (
  <Svg viewBox="0 0 24 24" width={20} height={20}>
    <Path
      d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"
      fill="#2c3e50"
    />
  </Svg>
);

const ActivitiesIcon = () => (
  <Svg viewBox="0 0 24 24" width={20} height={20}>
    <Path
      d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"
      fill="#2c3e50"
    />
    <Path
      d="M7 7h10v2H7zm0 4h10v2H7zm0 4h7v2H7z"
      fill="#2c3e50"
    />
  </Svg>
);

const TimeIcon = () => (
  <Svg viewBox="0 0 24 24" width={20} height={20}>
    <Path
      d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"
      fill="#2c3e50"
    />
  </Svg>
);

const NotesIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 14H8v-2h6v2zm0-4H8v-2h6v2zM8 9h6V7H8v2z"
      fill="#2c3e50"
    />
  </Svg>
);

const SignatureIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24">
    <Path
      d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM21.41 6.34l-3.75-3.75-2.53 2.54 3.75 3.75 2.53-2.54z"
      fill="#2c3e50"
    />
  </Svg>
);

const MaterialsIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"
      fill="#2c3e50"
    />
    <Path
      d="M7 7h10v2H7zm0 4h10v2H7zm0 4h7v2H7z"
      fill="#2c3e50"
    />
  </Svg>
);

const ContractorsIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"
      fill="#2c3e50"
    />
  </Svg>
);

export const PDFDocument: React.FC<PDFDocumentProps> = ({
  data,
  selectedProject,
  activites,
  lieux,
  bases,
  journalPlanifId
}) => {
  const validUsers = data.journalUsers.filter(
    (user) => user.prenom !== "" || user.nom !== ""
  );

  const renderActivitesTable = () => {
    const renderBases = (activite: PlanifActivites) => {
      if (!activite.bases || activite.bases.length === 0) return null;
      
      return (
        <View style={styles.subSection}>
          <View style={styles.subSectionHeader}>
            <Text style={styles.subTitle}>Bases ({activite.bases.length})</Text>
          </View>
          <View style={styles.basesContent}>
            {activite.bases.map((base: Localisation, index: number) => (
              <Text key={index} style={styles.baseText}>
                {base.base}
              </Text>
            ))}
          </View>
        </View>
      );
    };

    const renderLiaisons = (activite: PlanifActivites) => {
      if (!activite.liaisons || activite.liaisons.length === 0) return null;

      // Calculer la distance totale
      const totalDistance = activite.liaisons.reduce((sum, liaison) => {
        return sum + (liaison.distanceInMeters || 0);
      }, 0);

      return (
        <View style={styles.subSection}>
          <View style={styles.subSectionHeader}>
            <Text style={styles.subTitle}>Liaisons ({activite.liaisons.length})</Text>
          </View>
          <View style={styles.basesContent}>
            {activite.liaisons.map((liaison, index) => {
              const baseA = bases?.find(b => b.id === liaison.baseA)?.base;
              const baseB = bases?.find(b => b.id === liaison.baseB)?.base;
              
              return (
                <Text key={index} style={styles.baseText}>
                  {baseA} - {baseB}: {liaison.distanceInMeters}m
                </Text>
              );
            })}
            <Text style={styles.totalText}>Distance totale: {totalDistance}m</Text>
          </View>
        </View>
      );
    };

    return (
      <View style={styles.activitiesContainer}>
        {data.planifActivites.map((activite, index) => {
          const activiteInfo = activites?.find(a => a.id === activite.activiteID);
          const lieuInfo = lieux?.find(l => l.id === activite.lieuID);
          
          return (
            <View key={index} style={styles.activitySection}>
              <View style={styles.activityHeader}>
                <View style={styles.activityTitleContainer}>
                  <Text style={styles.activityTitle}>
                    {activiteInfo?.nom || 'N/A'}
                  </Text>
                  <Text style={styles.activityId}>
                    ACT. {index + 1}
                  </Text>
                </View>
                <Text style={styles.locationText}>
                  Localisation: {lieuInfo?.nom || 'N/A'}
                </Text>
              </View>

              {activite.notes && activite.notes.trim() !== '' && (
                <View style={styles.notesSection}>
                  <View style={styles.notesHeader}>
                    <Text style={styles.notesTitle}>Commentaire</Text>
                  </View>
                  <Text style={styles.notesText}>{activite.notes}</Text>
                </View>
              )}

              {renderBases(activite)}
              {renderLiaisons(activite)}
            </View>
          );
        })}
      </View>
    );
  };

  const renderSousTraitantsTable = () => (
    <View style={styles.section}>
      <View style={styles.table}>
        <View style={[styles.tableRow, { backgroundColor: "#F9FAFB" }]}>
          <Text style={[styles.tableHeader, { flex: 3 }]}>Sous-traitant</Text>
          <Text style={[styles.tableHeader, { flex: 3 }]}>Activité</Text>
          <Text style={[styles.tableHeader, { flex: 2 }]}>Quantité</Text>
          <Text style={[styles.tableHeader, { flex: 2 }]}>Unité</Text>
        </View>
        {data.journalSousTraitants.map((st, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 3 }]}>{st.nomSousTraitant || ''}</Text>
            <Text style={[styles.tableCell, { flex: 3 }]}>{st.nomActivite || ''}</Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>{st.quantite}</Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>{st.descriptionUnite || ''}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderMateriauxTable = () => (
    <View style={styles.table}>
      <View style={styles.tableRow}>
        <View style={[styles.tableCell, styles.tableHeader, styles.tableCellBorder, { flex: 2 }]}>
          <Text>Nom</Text>
        </View>
        <View style={[styles.tableCell, styles.tableHeader, { flex: 1 }]}>
          <Text>Quantité</Text>
        </View>
      </View>
      {data.journalMateriaux.map((materiel, index) => (
        <View key={index} style={styles.tableRow}>
          <View style={[styles.tableCell, styles.tableCellBorder, { flex: 2 }]}>
            <Text>{materiel.nom}</Text>
          </View>
          <View style={[styles.tableCell, { flex: 1 }]}>
            <Text>{materiel.quantite}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderEmployesTable = () => (
    <View style={styles.table}>
      <View style={styles.tableRow}>
        <View style={[styles.tableCell, styles.tableHeader, styles.tableCellBorder, { flex: 2 }]}>
          <Text>Nom</Text>
        </View>
        <View style={[styles.tableCell, styles.tableHeader, styles.tableCellBorder, { flex: 2 }]}>
          <Text>Fonction</Text>
        </View>
        <View style={[styles.tableCell, styles.tableHeader, { flex: 2 }]}>
          <Text>Équipement</Text>
        </View>
      </View>
      {validUsers.map((employe, index) => (
        <View key={index} style={styles.tableRow}>
          <View style={[styles.tableCell, styles.tableCellBorder, { flex: 2 }]}>
            <Text>{`${employe.prenom} ${employe.nom}`}</Text>
          </View>
          <View style={[styles.tableCell, styles.tableCellBorder, { flex: 2 }]}>
            <Text>{employe.fonction?.nom || 'N/A'}</Text>
          </View>
          <View style={[styles.tableCell, { flex: 2 }]}>
            <Text>{employe.equipement?.nom || 'N/A'}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderSignatureSection = () => {
    const currentDate = new Date().toLocaleDateString('fr-FR');
    
    const SignatureBlock = ({ 
      title, 
      isElectronic = false 
    }: { 
      title: string; 
      isElectronic?: boolean;
    }) => (
      <View style={styles.signatureBlock}>
        <Text style={styles.signatureTitle}>{title}</Text>
        <View style={styles.signatureRow}>
          <View style={styles.signatureField}>
            <Text style={styles.signatureLabel}>Signature</Text>
            <View style={styles.signatureBox}>
              {isElectronic && data.signatureData?.signature && (
                <Image src={data.signatureData.signature} style={styles.signatureImage} />
              )}
            </View>
          </View>
          <View style={styles.signatureField}>
            <Text style={styles.signatureLabel}>Nom complet</Text>
            <View style={styles.signatureLine}>
              {isElectronic && (
                <Text>{data.signatureData?.signataire || ''}</Text>
              )}
            </View>
          </View>
          <View style={styles.signatureField}>
            <Text style={styles.signatureLabel}>Date</Text>
            <View style={styles.signatureLine}>
              {isElectronic && (
                <Text>
                  {data.signatureData?.date 
                    ? new Date(data.signatureData.date).toLocaleDateString('fr-FR') 
                    : currentDate}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>
    );

    return (
      <View style={styles.signaturePage}>
        <SignatureBlock title="Signature Électronique" isElectronic={true} />
        <SignatureBlock title="Signature Manuscrite" />
      </View>
    );
  };

  const renderNotesSection = () => {
    if (!data.notes || data.notes.trim() === '') return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <NotesIcon />
          <Text style={styles.sectionHeaderText}>Notes Journalières</Text>
        </View>
        <View style={styles.notesSection}>
          <View style={styles.notesHeader}>
            <Text style={styles.notesTitle}>Commentaires du jour</Text>
          </View>
          <Text style={styles.notesContent}>{data.notes}</Text>
        </View>
      </View>
    );
  };

  const PageFooter = () => (
    <Text
      style={styles.pageNumber}
      render={({ pageNumber, totalPages }) => `Page ${pageNumber} sur ${totalPages}`}
      fixed
    />
  );

  return (
    <Document
      author="Journal de Chantier"
      keywords="journal, chantier, rapport"
      subject="Rapport journalier"
      title={`Journal de Chantier - ${formatDateToFrenchText(data.journalDate)}`}
    >
      {/* Première page : Informations et Employés */}
      <Page size="A4" style={styles.page} wrap={false}>
        <View style={styles.container}>
          {/* En-tête avec logo */}
          <View style={styles.header}>
            <Image style={styles.logo} src="/logo512.png" />
          </View>

          {/* Section Info Projet */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <InfoIcon />
              <Text style={styles.sectionHeaderText}>Informations du Projet</Text>
            </View>
            <View style={styles.sectionContent}>
              <View style={{ flexDirection: "row", marginBottom: 10 }}>
                <Text style={styles.label}>N° Journal : </Text>
                <Text style={styles.text}>
                  {journalPlanifId.toString().padStart(7, "0")}
                </Text>
              </View>
              <View style={{ flexDirection: "row", marginBottom: 10 }}>
                <Text style={styles.label}>Projet : </Text>
                <Text style={styles.text}>
                  {selectedProject?.NumeroProjet || "Non spécifié"}
                </Text>
              </View>

              <View style={{ flexDirection: "row", marginBottom: 10 }}>
                <Text style={styles.label}>Date : </Text>
                <Text style={styles.text}>
                  {formatDateToFrenchText(data.journalDate)}
                </Text>
              </View>
              <View style={{ flexDirection: "row", marginBottom: 10 }}>
                <Text style={styles.label}>Arrivée : </Text>
                <Text style={styles.text}>{data.journalArrivee}</Text>
              </View>
              <View style={{ flexDirection: "row", marginBottom: 10 }}>
                <Text style={styles.label}>Départ : </Text>
                <Text style={styles.text}>{data.journalDepart}</Text>
              </View>
              <View style={{ flexDirection: "row", marginBottom: 10 }}>
                <Text style={styles.label}>Météo : </Text>
                <Text style={styles.text}>
                  {data.journalWeather || "Aucune information météo"}
                </Text>
              </View>
            </View>
          </View>

          {/* Section Employés */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <EmployeesIcon />
              <Text style={styles.sectionHeaderText}>Employés</Text>
            </View>
            <View style={styles.sectionContent}>
              {validUsers.length > 0 ? (
                renderEmployesTable()
              ) : (
                <Text style={styles.emptySection}>Aucun employé enregistré</Text>
              )}
            </View>
          </View>
        </View>
        <PageFooter />
      </Page>

      {/* Deuxième page : Statistiques */}
      <Page size="A4" style={styles.page} wrap={false}>
        <View style={styles.container}>
          {/* Section Statistiques des heures */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TimeIcon />
              <Text style={styles.sectionHeaderText}>Statistiques des heures</Text>
            </View>
            <View style={styles.statsTable}>
              <View style={styles.statsHeader} fixed>
                <Text style={styles.statsHeaderCell}>Employé</Text>
                {Array.from({ length: 5 }, (_, i: number) => (
                  <Text key={i} style={styles.statsHeaderCell}>Act {i + 1}</Text>
                ))}
                <Text style={styles.statsHeaderCell}>TS</Text>
                <Text style={styles.statsHeaderCell}>TD</Text>
              </View>
              {data.userStats?.filter(stat => 
                stat.act.some(hours => hours > 0) || stat.ts > 0 || stat.td > 0
              ).map((stat, index) => (
                <View key={index} style={styles.statsRow}>
                  <Text style={styles.statsCell}>{stat.nom}</Text>
                  {stat.act.slice(0, 5).map((hours: number, i: number) => (
                    <Text key={i} style={styles.statsCell}>{hours}</Text>
                  ))}
                  <Text style={styles.statsCell}>{stat.ts}</Text>
                  <Text style={styles.statsCell}>{stat.td}</Text>
                </View>
              ))}
              {data.totals && (
                <View style={[styles.statsRow, styles.totalRow]}>
                  <Text style={[styles.statsCell, styles.boldText]}>Total</Text>
                  {data.totals.act.slice(0, 5).map((total: number, i: number) => (
                    <Text key={i} style={[styles.statsCell, styles.boldText]}>{total}</Text>
                  ))}
                  <Text style={[styles.statsCell, styles.boldText]}>{data.totals.ts}</Text>
                  <Text style={[styles.statsCell, styles.boldText]}>{data.totals.td}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Autres sections */}
          {/* Section des sous-traitants */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ContractorsIcon />
              <Text style={styles.sectionHeaderText}>Sous-Traitants</Text>
            </View>
            <View style={styles.sectionContent}>
              {data.journalSousTraitants && data.journalSousTraitants.length > 0 ? (
                renderSousTraitantsTable()
              ) : (
                <Text style={styles.emptySection}>Aucun sous-traitant enregistré</Text>
              )}
            </View>
          </View>

          {/* Section des matériaux et outillages */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialsIcon />
              <Text style={styles.sectionHeaderText}>Matériaux et Outillages</Text>
            </View>
            <View style={styles.sectionContent}>
              {data.journalMateriaux && data.journalMateriaux.length > 0 ? (
                renderMateriauxTable()
              ) : (
                <Text style={styles.emptySection}>Aucun matériau enregistré</Text>
              )}
            </View>
          </View>
        </View>
        <PageFooter />
      </Page>

      {/* Troisième page : Activités */}
 <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ActivitiesIcon />
            <Text style={styles.sectionHeaderText}>Activités du Projet</Text>
          </View>
          {renderActivitesTable()}
        </View>
        <PageFooter />
      </Page>

      {/* Dernière page : Notes et signatures */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          {renderNotesSection()}
        </View>
        {renderSignatureSection()}
        <PageFooter />
      </Page>
    </Document>
  );
};

// Fonction pour générer le nom du fichier PDF
export const getPDFFileName = (
  data: PDFDocumentProps["data"], 
  journalPlanifId: number,
  selectedProject: Project | null
): string => {
  const date = formatDateForFileName(data.journalDate);
  const journalId = journalPlanifId.toString().padStart(7, "0");
  return `${date}_${selectedProject?.NumeroProjet || "NOPROJ"}_${journalId}`;
};
