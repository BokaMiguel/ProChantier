// models.ts
export interface Project {
  ID: string;
  NumeroProjet: string;
  Description: string;
}

export interface CurrentUser {
  sub: string;
  name: string;
  projects: Project[];
  [key: string]: any; // pour permettre des propriétés supplémentaires si nécessaire
}
