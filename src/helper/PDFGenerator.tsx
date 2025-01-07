import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
  Svg,
  Path,
} from "@react-pdf/renderer";
import {
  Activite,
  ActivitePlanif,
  Employe,
  Materiau,
  SousTraitant,
  Localisation,
  LocalisationDistance,
  Lieu,
  UserStat,
} from "../models/JournalFormModel";

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

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
    position: "relative",
  },
  container: {
    margin: "0 auto",
    width: "90%",
    maxWidth: "800px",
  },
  separator: {
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
  },
  header: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  journalIdText: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
    color: "#1e3a8a",
  },
  section: {
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginBottom: 15,
    marginTop: 20,
    color: "#2c3e50",
    backgroundColor: "#e8ecf3",
    padding: 8,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  sectionHeaderIcon: {
    width: 20,
    height: 20,
    marginRight: 15,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#2c3e50",
    marginLeft: 15,
  },
  sectionContent: {
    paddingLeft: 8,
    paddingRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
    fontFamily: "Helvetica",
    marginBottom: 3,
  },
  boldText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  label: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    marginRight: 5,
    marginLeft: 15,
  },
  signatureLine: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: "#000000",
    width: "50%",
    marginLeft: "auto",
    marginRight: "auto",
    textAlign: "center",
    paddingTop: 5,
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    marginBottom: 5,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    width: "33.33%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    backgroundColor: "#e0e0e0",
    padding: 5,
    fontSize: 12,
    fontWeight: "bold",
  },
  tableCol: {
    width: "33.33%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    padding: 5,
    fontSize: 12,
  },
  timeTable: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    marginBottom: 10,
  },
  timeTableHeader: {
    backgroundColor: "#e0e0e0",
    padding: 5,
    fontSize: 10,
    fontWeight: "bold",
    width: "20%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
  },
  timeTableCell: {
    padding: 5,
    fontSize: 10,
    width: "20%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
  },
  liaisonContainer: {
    backgroundColor: "#f0f0f0",
    padding: 8,
    marginVertical: 4,
    borderRadius: 4,
  },
  notesSection: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 5,
  },
  noteContent: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#ffffff",
    borderRadius: 3,
    minHeight: 100,
  },
  emptySection: {
    color: "#666",
    fontStyle: "italic",
    marginTop: 10,
  },
  signatureContainer: {
    marginTop: 30,
    padding: 20,
  },
  signatureGridLayout: {
    flexDirection: "column",
    gap: 40,
  },
  signatureRowLayout: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  signatureBoxContainer: {
    width: "30%",
  },
  signatureNameLabel: {
    fontSize: 10,
    color: "#2c3e50",
    marginBottom: 2,
  },
  signatureNameField: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginBottom: 15,
    height: 20,
  },
  signatureField: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginVertical: 25,
    height: 40,
  },
  signatureDateLabel: {
    fontSize: 10,
    color: "#2c3e50",
    marginBottom: 2,
  },
  signatureDateLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginVertical: 5,
    height: 20,
  },
  tableContainer: {
    marginTop: 20,
    marginBottom: 15,
  },
  gridHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  gridRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  gridCell: {
    flex: 1,
    padding: 5,
    fontSize: 10,
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    minWidth: 50,
  },
  gridHeaderCell: {
    flex: 1,
    padding: 5,
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    backgroundColor: "#e0e0e0",
    minWidth: 50,
  },
  gridFirstCol: {
    flex: 2,
    padding: 5,
    fontSize: 10,
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    minWidth: 100,
  },
  gridHeaderFirstCol: {
    flex: 2,
    padding: 5,
    fontSize: 10,
    fontWeight: "bold",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    backgroundColor: "#e0e0e0",
    minWidth: 100,
  },
  totalsRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    backgroundColor: "#f0f0f0",
  },
  tableTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 5,
  },
  pageNumber: {
    position: "absolute",
    bottom: 30,
    right: 30,
    fontSize: 12,
    color: "grey",
  },
  signatureGrid: {
    width: "100%",
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: "100%",
  },
  signatureCell: {
    width: '48%',
  },
  signatureLabel: {
    fontSize: 14,
    marginBottom: 20,
    fontFamily: "Helvetica-Bold",
  },
  dateBox: {
    marginTop: 40,
  },
  dateLabel: {
    fontSize: 14,
    marginBottom: 20,
    fontFamily: "Helvetica-Bold",
  },
  dateLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginTop: 20,
  },
  activityHeader: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    marginTop: 12,
    color: "#34495e",
  },
  activityDetails: {
    marginLeft: 15,
    fontSize: 12,
    lineHeight: 1.4,
  },
  detailRow: {
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginBottom: 5,
    backgroundColor: "#FFD700",
    padding: 2,
  },
});

interface PDFDocumentProps {
  formData: {
    journalDate: string;
    journalArrivee: string;
    journalDepart: string;
    journalWeather: string;
    journalUsers: Employe[];
    journalActivitesState: ActivitePlanif[];
    journalMateriaux?: Materiau[];
    journalSousTraitants?: SousTraitant[];
    userStats?: UserStat[];
    totals?: {
      act: number[];
      ts: number;
      td: number;
    };
    notes: string;
    projetId?: string;
  };
  activites: Activite[] | null;
  bases: Localisation[];
  distances: LocalisationDistance[];
  lieux: Lieu[] | null;
  journalPlanifId: number;
}

interface ProcessedActivitePlanif extends ActivitePlanif {
  processedDistances?: LocalisationDistance[];
}

// Fonction utilitaire pour formater la date
const formatDateForFileName = (date: string): string => {
  return new Date(date).toLocaleDateString("fr-FR").split("/").join("-");
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
      d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"
      fill="#2c3e50"
    />
  </Svg>
);

const ActivitiesIcon = () => (
  <Svg viewBox="0 0 24 24" width={20} height={20}>
    <Path
      d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"
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
  <Svg viewBox="0 0 24 24" width={20} height={20}>
    <Path
      d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 14h-3v3h-2v-3H8v-2h3v-3h2v3h3v2zm-3-7V3.5L18.5 9H13z"
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
      d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"
      fill="#2c3e50"
    />
  </Svg>
);

export const PDFDocument: React.FC<PDFDocumentProps> = ({
  formData,
  activites,
  bases,
  distances,
  lieux,
  journalPlanifId,
}) => {
  const formatDate = (date: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(date).toLocaleDateString("fr-FR", options);
  };

  const generateFileName = () => {
    const date = formatDateForFileName(formData.journalDate);
    const projetId = formData.projetId || "NOPROJ";
    const journalId = journalPlanifId.toString().padStart(7, "0");
    return `${date}_${projetId}_${journalId}`;
  };

  const filteredUsers = formData.journalUsers.filter(
    (user) => user.prenom !== "" || user.nom !== ""
  );

  const processedActivities = formData.journalActivitesState.map((activite) => {
    const activityDistances = distances.filter(
      (d) => d.baseA === activite.lieuID || d.baseB === activite.lieuID
    );

    return {
      ...activite,
      processedDistances: activityDistances,
    } as ProcessedActivitePlanif;
  });

  return (
    <Document
      author="Journal de Chantier"
      creator="Journal de Chantier App"
      producer="Journal de Chantier PDF Generator"
      title={generateFileName()}
    >
      {/* Première page : En-tête et informations générales */}
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* En-tête */}
          <View style={styles.header}>
            <Image style={styles.logo} src="/logo512.png" />
          </View>

          {/* Informations du Journal */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <InfoIcon />
              <Text style={styles.sectionHeaderText}>Informations du Journal</Text>
            </View>
            <View style={styles.sectionContent}>
              <View style={{ flexDirection: "row", marginBottom: 10 }}>
                <Text style={styles.label}>N° Journal : </Text>
                <Text style={styles.text}>
                  {journalPlanifId.toString().padStart(7, "0")}
                </Text>
              </View>
              <View style={{ flexDirection: "row", marginBottom: 10 }}>
                <Text style={styles.label}>N° Projet : </Text>
                <Text style={styles.text}>
                  {formData.projetId || "Non spécifié"}
                </Text>
              </View>
              <View style={{ flexDirection: "row", marginBottom: 10 }}>
                <Text style={styles.label}>Date : </Text>
                <Text style={styles.text}>
                  {formatDate(formData.journalDate)}
                </Text>
              </View>
              <View style={{ flexDirection: "row", marginBottom: 10 }}>
                <Text style={styles.label}>Arrivée : </Text>
                <Text style={styles.text}>{formData.journalArrivee}</Text>
              </View>
              <View style={{ flexDirection: "row", marginBottom: 10 }}>
                <Text style={styles.label}>Départ : </Text>
                <Text style={styles.text}>{formData.journalDepart}</Text>
              </View>
              <View style={{ flexDirection: "row", marginBottom: 10 }}>
                <Text style={styles.label}>Météo : </Text>
                <Text style={styles.text}>
                  {formData.journalWeather || "Aucune information météo"}
                </Text>
              </View>
            </View>
          </View>

          {/* Informations des Employés */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <EmployeesIcon />
              <Text style={styles.sectionHeaderText}>Informations des Employés</Text>
            </View>
            <View style={styles.sectionContent}>
              {filteredUsers.length > 0 ? (
                <View style={styles.table}>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableColHeader}>Nom</Text>
                    <Text style={styles.tableColHeader}>Fonction</Text>
                    <Text style={styles.tableColHeader}>Équipement</Text>
                  </View>
                  {filteredUsers.map((user, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={styles.tableCol}>
                        {user.prenom} {user.nom}
                      </Text>
                      <Text style={styles.tableCol}>
                        {user.fonction?.nom || "N/A"}
                      </Text>
                      <Text style={styles.tableCol}>
                        {user.equipement?.nom || "N/A"}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptySection}>Aucun employé enregistré</Text>
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
              {formData.journalMateriaux && formData.journalMateriaux.length > 0 ? (
                <View style={styles.table}>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableColHeader}>Nom</Text>
                    <Text style={styles.tableColHeader}>Quantité</Text>
                  </View>
                  {formData.journalMateriaux.map((materiau, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={styles.tableCol}>{materiau.nom}</Text>
                      <Text style={styles.tableCol}>
                        {materiau.quantite !== undefined ? materiau.quantite : 'N/A'}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptySection}>Aucun matériau enregistré</Text>
              )}
            </View>
          </View>

          {/* Section des sous-traitants */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ContractorsIcon />
              <Text style={styles.sectionHeaderText}>Sous-Traitants</Text>
            </View>
            <View style={styles.sectionContent}>
              {formData.journalSousTraitants && formData.journalSousTraitants.length > 0 ? (
                <View style={styles.table}>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableColHeader}>Nom</Text>
                    <Text style={styles.tableColHeader}>Quantité</Text>
                  </View>
                  {formData.journalSousTraitants.map((sousTraitant, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={styles.tableCol}>{sousTraitant.nom}</Text>
                      <Text style={styles.tableCol}>
                        {sousTraitant.quantite !== undefined ? sousTraitant.quantite : 'N/A'}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptySection}>Aucun sous-traitant enregistré</Text>
              )}
            </View>
          </View>

          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
            fixed
          />
        </View>
      </Page>

      {/* Page des activités */}
      <Page size="A4" style={styles.page}>
        {/* Section des activités */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ActivitiesIcon />
            <Text style={styles.sectionHeaderText}>Activités</Text>
          </View>
          <View style={styles.sectionContent}>
            {processedActivities.length > 0 ? (
              processedActivities
                .filter((activite) =>
                  (activite.bases && activite.bases.length > 0) ||
                  (activite.liaisons && activite.liaisons.length > 0)
                )
                .map((activite, index) => {
                  const lieu = lieux?.find((l) => l.id === activite.lieuID);
                  const activiteDetails = activites?.find((a) => a.id === activite.activiteID);

                  // Calcul de la distance totale pour les liaisons
                  const totalDistance = activite.liaisons?.reduce((total, liaison) => 
                    total + (liaison.distanceInMeters || 0), 0) || 0;

                  // Formatage des liaisons avec distances
                  const formattedLiaisons = activite.liaisons?.map((liaison) => {
                    const baseA = bases.find((b) => b.id === liaison.baseA)?.base;
                    const baseB = bases.find((b) => b.id === liaison.baseB)?.base;
                    return `${baseA}@${baseB} (${liaison.distanceInMeters}m)`;
                  }).join(", ");

                  return (
                    <View key={index} style={styles.section}>
                      <Text style={styles.activityTitle}>
                        {`${index + 1}. ${activiteDetails?.nom || "Activité non spécifiée"}`}
                      </Text>
                      <View style={styles.activityDetails}>
                        {lieu?.nom && (
                          <Text style={styles.detailRow}>
                            <Text style={styles.label}>Lieu: </Text>
                            {lieu.nom}
                          </Text>
                        )}
                        {activite.liaisons && activite.liaisons.length > 0 ? (
                          <>
                            <Text style={styles.detailRow}>
                              <Text style={styles.label}>Distance Totale: </Text>
                              {`${totalDistance}m`}
                            </Text>
                            <Text style={styles.detailRow}>
                              <Text style={styles.label}>Liaisons: </Text>
                              {formattedLiaisons}
                            </Text>
                          </>
                        ) : activite.bases && activite.bases.length > 0 && (
                          <>
                            <Text style={styles.detailRow}>
                              <Text style={styles.label}>Quantité: </Text>
                              {activite.bases.length}
                            </Text>
                            <Text style={styles.detailRow}>
                              <Text style={styles.label}>Bases: </Text>
                              {activite.bases.map((base) => base.base).join(", ")}
                            </Text>
                          </>
                        )}
                        {activite.note && (
                          <Text style={styles.detailRow}>
                            <Text style={styles.label}>Commentaire: </Text>
                            {activite.note}
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })
            ) : (
              <Text style={styles.emptySection}>Aucune activité enregistrée</Text>
            )}
          </View>
        </View>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>

      {/* Page des heures d'activités */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TimeIcon />
            <Text style={styles.sectionHeaderText}>Heures d'activités</Text>
          </View>
          
          {/* Tableau pour les activités 1-5 */}
          <Text style={styles.tableTitle}>Heures par activité (Activités 1-5)</Text>
          <View style={styles.tableContainer}>
            <View style={styles.gridHeader}>
              <Text style={styles.gridHeaderFirstCol}>Employé</Text>
              {[1, 2, 3, 4, 5].map((num) => (
                <Text key={num} style={styles.gridHeaderCell}>
                  ACT {num}
                </Text>
              ))}
              <Text style={styles.gridHeaderCell}>TS</Text>
              <Text style={styles.gridHeaderCell}>TD</Text>
            </View>

            {formData.userStats?.map((stats, index) => {
              const user = formData.journalUsers.find((u) => u.id === stats.id);
              if (!user) return null;
              return (
                <View key={index} style={styles.gridRow}>
                  <Text style={styles.gridFirstCol}>
                    {user.prenom} {user.nom}
                  </Text>
                  {stats.act.slice(0, 5).map((value, actIndex) => (
                    <Text key={actIndex} style={styles.gridCell}>
                      {value > 0 ? value.toFixed(2) : ""}
                    </Text>
                  ))}
                  <Text style={styles.gridCell}>
                    {stats.ts > 0 ? stats.ts.toFixed(2) : ""}
                  </Text>
                  <Text style={styles.gridCell}>
                    {stats.td > 0 ? stats.td.toFixed(2) : ""}
                  </Text>
                </View>
              );
            })}

            {formData.totals && (
              <View style={styles.totalsRow}>
                <Text style={styles.gridHeaderFirstCol}>Totaux</Text>
                {formData.totals.act.slice(0, 5).map((total, index) => (
                  <Text key={index} style={styles.gridHeaderCell}>
                    {total > 0 ? total.toFixed(2) : ""}
                  </Text>
                ))}
                <Text style={styles.gridHeaderCell}>
                  {formData.totals.ts > 0 ? formData.totals.ts.toFixed(2) : ""}
                </Text>
                <Text style={styles.gridHeaderCell}>
                  {formData.totals.td > 0 ? formData.totals.td.toFixed(2) : ""}
                </Text>
              </View>
            )}
          </View>

          {/* Tableau pour les activités 6-10 si nécessaire */}
          {formData.userStats?.some(stats => stats.act.slice(5).some(v => v > 0)) && (
            <>
              <Text style={styles.tableTitle}>Heures par activité (Activités 6-10)</Text>
              <View style={styles.tableContainer}>
                <View style={styles.gridHeader}>
                  <Text style={styles.gridHeaderFirstCol}>Employé</Text>
                  {[6, 7, 8, 9, 10].map((num) => (
                    <Text key={num} style={styles.gridHeaderCell}>
                      ACT {num}
                    </Text>
                  ))}
                  <Text style={styles.gridHeaderCell}>TS</Text>
                  <Text style={styles.gridHeaderCell}>TD</Text>
                </View>

                {formData.userStats?.map((stats, index) => {
                  const user = formData.journalUsers.find((u) => u.id === stats.id);
                  if (!user) return null;
                  if (!stats.act.slice(5).some(v => v > 0)) return null;
                  return (
                    <View key={index} style={styles.gridRow}>
                      <Text style={styles.gridFirstCol}>
                        {user.prenom} {user.nom}
                      </Text>
                      {stats.act.slice(5, 10).map((value, actIndex) => (
                        <Text key={actIndex} style={styles.gridCell}>
                          {value > 0 ? value.toFixed(2) : ""}
                        </Text>
                      ))}
                      <Text style={styles.gridCell}>
                        {stats.ts > 0 ? stats.ts.toFixed(2) : ""}
                      </Text>
                      <Text style={styles.gridCell}>
                        {stats.td > 0 ? stats.td.toFixed(2) : ""}
                      </Text>
                    </View>
                  );
                })}

                {formData.totals && (
                  <View style={styles.totalsRow}>
                    <Text style={styles.gridHeaderFirstCol}>Totaux</Text>
                    {formData.totals.act.slice(5, 10).map((total, index) => (
                      <Text key={index} style={styles.gridHeaderCell}>
                        {total > 0 ? total.toFixed(2) : ""}
                      </Text>
                    ))}
                    <Text style={styles.gridHeaderCell}>
                      {formData.totals.ts > 0 ? formData.totals.ts.toFixed(2) : ""}
                    </Text>
                    <Text style={styles.gridHeaderCell}>
                      {formData.totals.td > 0 ? formData.totals.td.toFixed(2) : ""}
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}

        </View>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>

      {/* Page des signatures */}
      <Page size="A4" style={styles.page}>
        {/* Notes journalières */}
        {formData.notes ? (
          <View style={styles.notesSection}>
            <View style={styles.sectionHeader}>
              <NotesIcon />
              <Text style={styles.sectionHeaderText}>Note journalière</Text>
            </View>
            <View style={styles.noteContent}>
              <Text style={styles.text}>{formData.notes}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.notesSection}>
            <View style={styles.sectionHeader}>
              <NotesIcon />
              <Text style={styles.sectionHeaderText}>Note journalière</Text>
            </View>
            <View style={styles.noteContent}>
              <Text style={[styles.text, { color: "#666" }]}>Aucune note journalière</Text>
            </View>
          </View>
        )}

        <View style={styles.signatureContainer}>
          <View style={styles.sectionHeader}>
            <SignatureIcon />
            <Text style={styles.sectionHeaderText}>Signatures</Text>
          </View>
          <View style={styles.signatureGridLayout}>
            {/* Première rangée */}
            <View style={styles.signatureRowLayout}>
              <View style={styles.signatureBoxContainer}>
                <Text style={styles.signatureNameLabel}>Nom complet</Text>
                <View style={styles.signatureNameField} />
              </View>
              <View style={styles.signatureBoxContainer}>
                <Text style={styles.signatureNameLabel}>Signature</Text>
                <View style={styles.signatureField} />
              </View>
              <View style={styles.signatureBoxContainer}>
                <Text style={styles.signatureDateLabel}>Date</Text>
                <View style={styles.signatureDateLine} />
              </View>
            </View>

            {/* Deuxième rangée */}
            <View style={styles.signatureRowLayout}>
              <View style={styles.signatureBoxContainer}>
                <Text style={styles.signatureNameLabel}>Nom complet</Text>
                <View style={styles.signatureNameField} />
              </View>
              <View style={styles.signatureBoxContainer}>
                <Text style={styles.signatureNameLabel}>Signature</Text>
                <View style={styles.signatureField} />
              </View>
              <View style={styles.signatureBoxContainer}>
                <Text style={styles.signatureDateLabel}>Date</Text>
                <View style={styles.signatureDateLine} />
              </View>
            </View>
          </View>
        </View>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
};

// Fonction pour générer le nom du fichier PDF
export const getPDFFileName = (formData: PDFDocumentProps["formData"], journalPlanifId: number): string => {
  const date = formatDateForFileName(formData.journalDate);
  const projetId = formData.projetId || "NOPROJ";
  const journalId = journalPlanifId.toString().padStart(7, "0");
  return `${date}_${projetId}_${journalId}`;
};
