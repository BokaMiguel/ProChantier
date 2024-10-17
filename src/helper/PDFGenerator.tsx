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
    fontFamily: "Roboto",
    minHeight: "100%",
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
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subSectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 5,
  },
  text: {
    fontSize: 12,
    marginBottom: 3,
  },
  boldText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  employeeInfo: {
    marginBottom: 5,
  },
  employeeName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e3a8a",
  },
  separator: {
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
  },
  baseInfo: {
    marginLeft: 10,
  },
  note: {
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 3,
    marginBottom: 3,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
    marginBottom: 3,
    color: "#1e3a8a",
  },
  locationName: {
    fontSize: 12,
    marginBottom: 3,
    fontStyle: "italic",
  },
  activityDetails: {
    marginLeft: 5,
  },
  basesLiaisonsData: {
    marginLeft: 10,
  },
});

interface PDFDocumentProps {
  formData: {
    journalDate: Date;
    journalArrivee: string;
    journalDepart: string;
    journalWeather: string;
    journalUsers: Employe[];
    journalActivitesState: ActivitePlanif[];
    journalMateriaux: Materiau[];
    journalSousTraitants: SousTraitant[];
  };
  activites: Activite[] | null;
  bases: Localisation[];
  distances: LocalisationDistance[];
  lieux: Lieu[] | null;
}

const Separator = () => <View style={styles.separator} />;

export const PDFDocument: React.FC<PDFDocumentProps> = ({
  formData,
  activites,
  bases,
  distances,
  lieux,
}) => {
  const getActivityName = (id: number | null) => {
    if (id === null) return "Inconnu";
    const activity = activites?.find((act: Activite) => act.id === id);
    return activity ? activity.nom : "Inconnu";
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("fr-FR", options);
  };

  const getBaseName = (baseId: number) => {
    const base = bases.find((b) => b.id === baseId);
    return base ? base.base : "N/A";
  };

  const getDistance = (baseAId: number, baseBId: number) => {
    const distance = distances.find(
      (d) =>
        (d.baseA === baseAId && d.baseB === baseBId) ||
        (d.baseA === baseBId && d.baseB === baseAId)
    );
    return distance ? distance.distanceInMeters : 0;
  };

  const getLieuName = (lieuId: number | null) => {
    if (lieuId === null) return "Inconnu";
    const lieu = lieux?.find((l) => l.id === lieuId);
    return lieu ? lieu.nom : "Inconnu";
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <Image style={styles.logo} src="/logo512.png" />
            <Text style={styles.headerTitle}>Rapport Journal de Chantier</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations du Projet</Text>
            <View style={{ flexDirection: "row" }}>
              <Text style={styles.boldText}>Date: </Text>
              <Text style={styles.text}>
                {formatDate(formData.journalDate)}
              </Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text style={styles.boldText}>Arrivée: </Text>
              <Text style={styles.text}>{formData.journalArrivee || ""}</Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text style={styles.boldText}>Départ: </Text>
              <Text style={styles.text}>{formData.journalDepart || ""}</Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text style={styles.boldText}>Météo: </Text>
              <Text style={styles.text}>
                {formData.journalWeather || "Non défini"}
              </Text>
            </View>
          </View>

          <Separator />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations des Employés</Text>
            {formData.journalUsers.map((user, index) => (
              <View key={index} style={styles.employeeInfo}>
                <Text style={styles.employeeName}>
                  {user.prenom} {user.nom}
                </Text>
                {user.fonction?.nom && (
                  <View style={{ flexDirection: "row" }}>
                    <Text style={styles.boldText}>Fonction: </Text>
                    <Text style={styles.text}>{user.fonction.nom}</Text>
                  </View>
                )}
                {user.equipement?.nom && (
                  <View style={{ flexDirection: "row" }}>
                    <Text style={styles.boldText}>Équipement: </Text>
                    <Text style={styles.text}>{user.equipement.nom}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          <Separator />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activités du Projet</Text>
            {formData.journalActivitesState.length > 0 ? (
              formData.journalActivitesState.map((activite, index) => (
                <View key={index} style={styles.employeeInfo}>
                  <Text style={styles.activityTitle}>
                    {index + 1}. {getActivityName(activite.activiteID)}
                  </Text>
                  <View style={styles.activityDetails}>
                    <View style={{ flexDirection: "row" }}>
                      <Text style={styles.boldText}>Lieu: </Text>
                      <Text style={styles.text}>
                        {`${getLieuName(activite.lieuID)}`}
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row" }}>
                      <Text style={styles.boldText}>Quantité: </Text>
                      <Text style={styles.text}>
                        {activite.quantite || "Non spécifiée"}
                      </Text>
                    </View>
                    {activite.note && (
                      <View style={{ flexDirection: "row" }}>
                        <Text style={styles.boldText}>Note: </Text>
                        <Text style={styles.text}>{activite.note}</Text>
                      </View>
                    )}
                    {(activite.bases && activite.bases.length > 0) ||
                    (activite.liaisons && activite.liaisons.length > 0) ? (
                      <View style={styles.baseInfo}>
                        <Text style={styles.subSectionTitle}>
                          Bases/Liaisons:
                        </Text>
                        <View style={styles.basesLiaisonsData}>
                          {activite.bases && activite.bases.length > 0 && (
                            <Text style={styles.text}>
                              {activite.bases
                                .map((base) => base.base)
                                .join(" - ")}
                            </Text>
                          )}
                          {activite.liaisons &&
                            activite.liaisons.length > 0 && (
                              <View>
                                {activite.liaisons.map(
                                  (liaison, liaisonIndex) => (
                                    <Text
                                      key={liaisonIndex}
                                      style={styles.text}
                                    >
                                      {getBaseName(liaison.baseA)} @{" "}
                                      {getBaseName(liaison.baseB)} - Distance:{" "}
                                      {getDistance(
                                        liaison.baseA,
                                        liaison.baseB
                                      )}{" "}
                                      m
                                    </Text>
                                  )
                                )}
                                <Text style={styles.boldText}>
                                  Distance total:{" "}
                                  {activite.liaisons.reduce(
                                    (total, liaison) => {
                                      const distance = getDistance(
                                        liaison.baseA,
                                        liaison.baseB
                                      );
                                      return (
                                        total +
                                        (typeof distance === "number"
                                          ? distance
                                          : 0)
                                      );
                                    },
                                    0
                                  )}{" "}
                                  m
                                </Text>
                              </View>
                            )}
                        </View>
                      </View>
                    ) : null}
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.text}>Aucune activité enregistrée</Text>
            )}
          </View>

          <Separator />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Matériaux/Outillage</Text>
            {formData.journalMateriaux.length > 0 ? (
              formData.journalMateriaux.map((materiau, index) => (
                <View key={index} style={{ flexDirection: "row" }}>
                  <Text style={styles.boldText}>{materiau.nom}: </Text>
                  <Text style={styles.text}>
                    {materiau.quantite ? `Quantité: ${materiau.quantite}` : ""}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.text}>
                Aucun matériau ou outillage enregistré
              </Text>
            )}
          </View>

          <Separator />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sous-Traitants</Text>
            {formData.journalSousTraitants.length > 0 ? (
              formData.journalSousTraitants.map((sousTraitant, index) => (
                <View key={index} style={{ flexDirection: "row" }}>
                  <Text style={styles.boldText}>{sousTraitant.nom}: </Text>
                  <Text style={styles.text}>
                    {sousTraitant.quantite
                      ? `Quantité: ${sousTraitant.quantite}`
                      : ""}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.text}>Aucun sous-traitant enregistré</Text>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
};
