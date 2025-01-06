import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
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
  signaturePage: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
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
    borderRadius: 4,
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
  separator: {
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
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
  signatureSection: {
    marginTop: 50,
    marginBottom: 30,
  },
  dateField: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  dateText: {
    fontSize: 12,
    marginRight: 10,
  },
  dateInput: {
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    width: "60%",
    textAlign: "center",
  },
  signatureBoxContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  signatureBoxNew: {
    marginBottom: 40,
  },
  signatureText: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
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
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginTop: 40,
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

const Separator = () => <View style={styles.separator} />;

export const PDFDocument: React.FC<PDFDocumentProps> = ({
  formData,
  activites,
  bases,
  distances,
  lieux,
  journalPlanifId,
}) => {
  // Générer un ID de journal formaté à 7 chiffres
  const generateJournalId = (id: number): string => {
    return id.toString().padStart(7, "0");
  };

  const formatDate = (date: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(date).toLocaleDateString("fr-FR", options);
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
    <Document>
      {/* Première page : En-tête et informations générales */}
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <Image style={styles.logo} src="/logo512.png" />
        </View>

        {/* Informations du Journal */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Informations du Journal</Text>
          <View style={styles.sectionContent}>
            <View style={{ flexDirection: "row", marginBottom: 10 }}>
              <Text style={styles.label}>N° Journal : </Text>
              <Text style={styles.text}>
                {generateJournalId(journalPlanifId)}
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
          <Text style={styles.sectionHeader}>Informations des Employés</Text>
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

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>

      {/* Page des activités */}
      <Page size="A4" style={styles.page}>
        {/* Section des activités */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Activités</Text>
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
                      <Text style={styles.activityHeader}>
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
          <Text style={styles.sectionHeader}>Heures d'activités</Text>
          
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
            <Text style={styles.sectionHeader}>Note journalière</Text>
            <View style={styles.noteContent}>
              <Text style={styles.text}>{formData.notes}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.notesSection}>
            <Text style={styles.sectionHeader}>Note journalière</Text>
            <View style={styles.noteContent}>
              <Text style={[styles.text, { color: "#666" }]}>Aucune note journalière</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Signatures</Text>
          <View style={styles.signatureGrid}>
            <View style={styles.signatureRow}>
              {/* Signature Contremaître */}
              <View style={styles.signatureCell}>
                <View style={styles.signatureBoxNew}>
                  <Text style={styles.signatureLabel}>Signature Contremaître</Text>
                  <Text style={styles.signatureLine}></Text>
                </View>
                <View style={styles.dateBox}>
                  <Text style={styles.dateLabel}>Date</Text>
                  <Text style={styles.dateLine}></Text>
                </View>
              </View>

              {/* Signature Client */}
              <View style={styles.signatureCell}>
                <View style={styles.signatureBoxNew}>
                  <Text style={styles.signatureLabel}>Signature Client</Text>
                  <Text style={styles.signatureLine}></Text>
                </View>
                <View style={styles.dateBox}>
                  <Text style={styles.dateLabel}>Date</Text>
                  <Text style={styles.dateLine}></Text>
                </View>
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
