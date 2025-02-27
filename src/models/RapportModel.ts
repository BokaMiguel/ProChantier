import { 
  JournalChantier, 
  BottinJournal, 
  JournalActivites, 
  MateriauxJournal, 
  LocalisationJournal, 
  LocalisationDistanceJournal, 
  SousTraitantJournal
} from './JournalFormModel';

/**
 * Interface pour les filtres de recherche du rapport
 */
export interface RapportFilters {
  startDate?: string;
  endDate?: string;
  meteoId?: number[];
  statutId?: number[];
  employeeIds?: number[];
  activiteIds?: number[];
  materiauxIds?: number[];
  plageHoraire?: 'jour' | 'nuit' | 'tous';
}

/**
 * Interface pour la configuration de tri du rapport
 */
export interface SortConfig {
  key: keyof JournalChantier | 'employes' | 'activites' | 'materiaux';
  direction: 'ascending' | 'descending';
}

/**
 * Interface pour les sections extensibles du rapport
 */
export interface ExpandedSections {
  activites: boolean;
  materiaux: boolean;
  sousTraitants: boolean;
  employes: boolean;
}

/**
 * Interface pour l'état des sections extensibles du rapport
 */
export interface JournalSections {
  activites: boolean;
  materiaux: boolean;
  sousTraitants: boolean;
  employes: boolean;
}

/**
 * Interface pour les données enrichies du journal, avec résolution des IDs
 */
export interface EnrichedJournalChantier extends JournalChantier {
  resolvedBottinJournals?: {
    bottinId: number;
    journalId: number;
    employeeName: string;
    fonction?: string;
    equipement?: string;
  }[];
  resolvedMateriauxJournals?: {
    journalId: number;
    materielId: number;
    materielName: string;
    quantite: number;
  }[];
  resolvedActivites?: {
    id: number;
    journalId: number;
    activiteId: number;
    activiteName: string;
    comment?: string;
    localisations?: {
      id: number;
      localisationId: number;
      localisationName: string;
    }[];
    sousTraitants?: {
      sousTraitantId: number;
      sousTraitantName: string;
      quantite: number;
      uniteId: number;
      uniteName?: string;
    }[];
  }[];
  meteoName?: string;
  statutName?: string;
}
