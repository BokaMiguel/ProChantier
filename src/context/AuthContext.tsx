import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  Dispatch,
  SetStateAction,
} from "react";
import { User } from "oidc-client";
import {
  getUser,
  login,
  logout,
  handleCallback,
} from "../services/AuthService";
import {
  getAuthorizedProjects,
  getEmployeeList,
  getFonctionEmploye,
  getLieuProjet,
  getActiviteProjet,
  getEquipementsProjet,
  getMateriauxOutillage,
  getBases,
  getSousTraitantProjet,
  getSignalisationProjet,
  getActivitePlanif,
  getAllUnites,
  getEquipeChantierByProjet,
  getBottinsEquipeChantier,
  createOrUpdateEquipeChantier as createOrUpdateEquipeChantierService,
  deleteEquipeChantier as deleteEquipeChantierService,
  addEmployeToEquipe as addEmployeToEquipeService,
  removeEmployeFromEquipe as removeEmployeFromEquipeService,
  getAllJournalChantierByProject,
} from "../services/JournalService";
import { Project } from "../models/ProjectInfoModel";
import { UserClaims } from "../models/AuthModel";
import {
  Activite,
  ActivitePlanif,
  Employe,
  Equipement,
  Fonction,
  Lieu,
  Localisation,
  Materiau,
  SignalisationProjet,
  SousTraitant,
  Unite,
  TabEquipeChantier,
  TabBottinsEquipeChantier,
} from "../models/JournalFormModel";

interface AuthContextProps {
  user: User | null;
  claims: UserClaims | null;
  projects: Project[] | null;
  selectedProject: Project | null;
  employees: Employe[] | null;
  fonctions: Fonction[] | null;
  activitesPlanif: ActivitePlanif[] | null;
  lieux: Lieu[] | null;
  activites: Activite[] | null;
  equipements: Equipement[] | null;
  materiaux: Materiau[] | null;
  sousTraitants: SousTraitant[] | null;
  bases: Localisation[] | null;
  signalisations: SignalisationProjet[] | null;
  unites: Unite[] | null;
  equipes: TabEquipeChantier[] | null;
  bottinsEquipe: TabBottinsEquipeChantier[] | null;
  journals: any[] | null; // Ajouter le type pour les journaux
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  handleCallback: () => Promise<User>;
  selectProject: (project: Project) => void;
  fetchBases: (lieuId: number) => void;
  fetchLieux: (projectId: number) => void;
  fetchEmployes: (projectId: number) => void;
  fetchFonctions: () => void;
  fetchEquipements: (projectId: number) => void;
  fetchActivites: (projectId: number) => void;
  fetchMateriaux: () => void;
  fetchSousTraitants: () => void;
  fetchSignalisations: (projectId: number) => void;
  fetchActivitesPlanif: (projectId: number) => void;
  fetchUnites: () => void;
  fetchEquipes: (projectId: number) => Promise<void>;
  fetchBottinsEquipe: (equipeId: number) => void;
  fetchJournals: (projectId: number) => void; // Ajouter la fonction pour récupérer les journaux
  createOrUpdateEquipeChantier: (equipe: TabEquipeChantier) => Promise<TabEquipeChantier>;
  deleteEquipeChantier: (id: number) => Promise<void>;
  addEmployeToEquipe: (equipeId: number, employeId: number) => Promise<void>;
  removeEmployeFromEquipe: (equipeId: number, employeId: number) => Promise<void>;
  setBases: Dispatch<SetStateAction<Localisation[] | null>>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [claims, setClaims] = useState<UserClaims | null>(null);
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [employeeList, setEmployeeList] = useState<Employe[] | null>(null);
  const [fonctions, setFonctions] = useState<Fonction[] | null>(null);
  const [lieux, setLieux] = useState<Lieu[] | null>(null);
  const [activites, setActivites] = useState<Activite[] | null>(null);
  const [activitesPlanif, setActivitesPlanif] = useState<
    ActivitePlanif[] | null
  >(null);
  const [equipements, setEquipements] = useState<Equipement[] | null>(null);
  const [materiaux, setMateriaux] = useState<Materiau[] | null>(null);
  const [sousTraitants, setSousTraitants] = useState<SousTraitant[] | null>(
    null
  );
  const [initialFetchAttempted, setInitialFetchAttempted] = useState(false);
  const [bases, setBases] = useState<Localisation[] | null>(null);
  const [signalisations, setSignalisations] = useState<
    SignalisationProjet[] | null
  >(null);
  const [unites, setUnites] = useState<Unite[]>([]);
  const [equipes, setEquipes] = useState<TabEquipeChantier[] | null>(null);
  const [bottinsEquipe, setBottinsEquipe] = useState<
    TabBottinsEquipeChantier[] | null
  >(null);
  const [journals, setJournals] = useState<any[] | null>(null); // Ajouter l'état pour les journaux

  useEffect(() => {
    const fetchUser = async () => {
      if (!user && !initialFetchAttempted) {
        setInitialFetchAttempted(true);
        setIsLoading(true);
        try {
          const storedUser = await getUser();
          if (storedUser) {
            setUser(storedUser);
            const userClaims = storedUser.profile as unknown as UserClaims;
            setClaims(userClaims);

            const projectsData = await getAuthorizedProjects(userClaims.sub);
            setProjects(projectsData);
            
            // Vérifier s'il y a un projet sauvegardé dans sessionStorage
            const storedProject = sessionStorage.getItem('selectedProject');
            if (storedProject && !selectedProject) {
              try {
                const parsedProject = JSON.parse(storedProject);
                // Vérifier si le projet sauvegardé est toujours dans la liste des projets autorisés
                const projectExists = projectsData.some((p: Project) => p.ID === parsedProject.ID);
                if (projectExists) {
                  setSelectedProject(parsedProject);
                } else {
                  // Si le projet n'existe plus, sélectionner le premier projet
                  if (projectsData && projectsData.length > 0) {
                    setSelectedProject(projectsData[0]);
                  }
                }
              } catch (error) {
                console.error('Erreur lors de la récupération du projet depuis sessionStorage:', error);
                // En cas d'erreur, sélectionner le premier projet
                if (projectsData && projectsData.length > 0) {
                  setSelectedProject(projectsData[0]);
                }
              }
            } else if (projectsData && projectsData.length > 0 && !selectedProject) {
              // Si aucun projet n'est sauvegardé, sélectionner le premier projet
              setSelectedProject(projectsData[0]);
            }
          }
        } catch (err) {
          console.error("Error loading user:", err);
        } finally {
          setIsLoading(false);
        }
      } else if (user) {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [user, initialFetchAttempted, selectedProject]);

  // Utilisation de useCallback pour mémoriser la fonction fetchProjectDetails
  const fetchProjectDetails = useCallback(async (projectId: number) => {
    try {
      // Récupération des données du projet
      const employeeData = await getEmployeeList(projectId);
      setEmployeeList(employeeData);

      const fonctionData = await getFonctionEmploye();
      setFonctions(fonctionData);

      const lieuData = await getLieuProjet(projectId);
      setLieux(lieuData);

      const activiteData = await getActiviteProjet(projectId);
      setActivites(activiteData);

      const equipementData = await getEquipementsProjet(projectId);
      setEquipements(equipementData);

      const materiauxData = await getMateriauxOutillage();
      setMateriaux(materiauxData);

      const sousTraitantData = await getSousTraitantProjet();
      setSousTraitants(sousTraitantData);

      const signalisationData = await getSignalisationProjet(projectId);
      setSignalisations(signalisationData);

      const activitePlanifData = await getActivitePlanif(projectId);
      setActivitesPlanif(activitePlanifData);

      // Récupération des bases associées aux lieux
      if (lieuData && lieuData.length > 0) {
        const basesData = await Promise.all(
          lieuData.map(async (lieu: Lieu) => {
            const bases = await getBases(lieu.id);
            return bases.map((base: any) => ({
              id: base.id,
              base: base.base,
              lieuId: lieu.id,
            }));
          })
        );

        // Flatten the array of arrays into a single array
        const flattenedBasesData = basesData.flat();
        setBases(flattenedBasesData);
      } else {
        setBases([]);
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
    }
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchProjectDetails(selectedProject.ID);
    }
  }, [selectedProject, fetchProjectDetails]);

  // Ajout d'un effet pour s'assurer que les données sont chargées lorsque l'utilisateur
  // navigue directement vers une route autre que la page d'accueil
  useEffect(() => {
    // Si l'utilisateur est connecté et qu'un projet est sélectionné mais que les données ne sont pas chargées
    if (user && selectedProject && !lieux) {
      // Charger les données du projet
      fetchProjectDetails(selectedProject.ID);
    }
  }, [user, selectedProject, lieux, fetchProjectDetails]);

  const handleUserLogin = () => {
    login();
  };

  const handleUserLogout = () => {
    logout();
    setUser(null);
    setClaims(null);
    setProjects(null);
    setSelectedProject(null);
    setEmployeeList(null);
    setFonctions(null);
    setLieux(null);
    setActivites(null);
    setEquipements(null);
    setMateriaux(null);
    setBases(null);
  };

  const handleUserCallback = async () => {
    setIsLoading(true);
    try {
      const user = await handleCallback();
      setUser(user);
      const userClaims = user.profile as unknown as UserClaims;
      setClaims(userClaims);

      const projectsData = await getAuthorizedProjects(userClaims.sub);
      setProjects(projectsData);

      return user;
    } catch (error) {
      console.error("Error in handleUserCallback:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const selectProject = (project: Project) => {
    setSelectedProject(project);
    // Sauvegarder le projet sélectionné dans sessionStorage
    try {
      sessionStorage.setItem('selectedProject', JSON.stringify(project));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du projet dans sessionStorage:', error);
    }
  };

  const fetchBases = useCallback(async (lieuId: number) => {
    if (lieuId > 0) {
      try {
        const basesFromApi = await getBases(lieuId);
        
        // S'assurer que chaque base a un lieuId
        const updatedBases = basesFromApi.map((base: any) => ({
          ...base,
          lieuId: lieuId // Ajouter explicitement le lieuId
        }));
        
        setBases((prevBases) => {
          // Filtrage des bases qui ne sont pas liées au lieu actuel
          const otherBases = (prevBases ?? []).filter(
            (base) => base.lieuId !== lieuId
          );
          // Combinaison des bases existantes avec les nouvelles bases pour ce lieu
          const newBases = [...otherBases, ...updatedBases];
          return newBases;
        });
      } catch (error) {
        console.error("Erreur lors de la récupération des bases:", error);
      }
    }
  }, []);

  const fetchLieux = useCallback(
    async (projectId: number) => {
      try {
        // Récupération des lieux pour le projet sélectionné
        const lieuData = await getLieuProjet(projectId);
        setLieux(lieuData);

        if (lieuData && lieuData.length > 0) {
          // Récupération des bases pour chaque lieu
          const basesData = await Promise.all(
            lieuData.map(async (lieu: Lieu) => {
              const bases = await getBases(lieu.id);
              // Ajouter explicitement le lieuId à chaque base
              return bases.map((base: any) => ({
                ...base,
                lieuId: lieu.id, // S'assurer que lieuId est bien défini
              }));
            })
          );

          // Aplatissement des résultats pour avoir un seul tableau de bases
          const flattenedBasesData = basesData.flat();
          setBases(flattenedBasesData);
        } else {
          // Si aucun lieu n'est trouvé, on réinitialise les bases
          setBases([]);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des lieux et des bases:",
          error
        );
      }
    },
    [setLieux, setBases]
  );

  const fetchEmployes = useCallback(async (projectId: number) => {
    const employesData = await getEmployeeList(projectId);
    setEmployeeList(employesData);
  }, []);

  const fetchFonctions = useCallback(async () => {
    const fonctionData = await getFonctionEmploye();
    setFonctions(fonctionData);
  }, []);

  const fetchEquipements = useCallback(async (projectId: number) => {
    const equipementData = await getEquipementsProjet(projectId);
    setEquipements(equipementData);
  }, []);

  const fetchActivites = useCallback(async (projectId: number) => {
    const activiteData = await getActiviteProjet(projectId);
    setActivites(activiteData);
  }, []);

  const fetchActivitesPlanif = useCallback(async (projectId: number) => {
    const activiteData = await getActivitePlanif(projectId);
    setActivitesPlanif(activiteData);
  }, []);

  const fetchMateriaux = useCallback(async () => {
    const materiauxData = await getMateriauxOutillage();
    setMateriaux(materiauxData);
  }, []);

  const fetchSignalisations = useCallback(async (projectId: number) => {
    const signalisationData = await getSignalisationProjet(projectId);
    setSignalisations(signalisationData);
  }, []);

  const fetchSousTraitants = useCallback(async () => {
    const sousTraitantsData = await getSousTraitantProjet();
    setSousTraitants(sousTraitantsData);
  }, []);

  const fetchUnites = useCallback(async () => {
    try {
      const unitesList = await getAllUnites();
      setUnites(unitesList);
    } catch (error) {
      console.error('Erreur lors de la récupération des unités:', error);
    }
  }, []);

  const fetchEquipes = useCallback(async (projectId: number) => {
    if (!projectId) {
      console.error("ID du projet non fourni pour fetchEquipes");
      setEquipes([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await getEquipeChantierByProjet(projectId);
      const equipeData = response.data || []; // Accéder à la propriété data de la réponse

      if (!Array.isArray(equipeData)) {
        console.error("Les données d'équipes reçues ne sont pas un tableau:", equipeData);
        setEquipes([]);
        return;
      }
      
      // Pour chaque équipe, récupérer ses employés
      const equipesWithEmployes = await Promise.all(
        equipeData.map(async (equipe: TabEquipeChantier) => {
          try {
            if (!equipe.id) {
              console.error("Équipe sans ID:", equipe);
              return {
                ...equipe,
                employes: []
              };
            }
            const bottinsResponse = await getBottinsEquipeChantier(equipe.id);
            const bottins = bottinsResponse.data || [];
            return {
              ...equipe,
              employes: bottins
            };
          } catch (error) {
            console.error(`Erreur lors de la récupération des employés pour l'équipe ${equipe.id}:`, error);
            return {
              ...equipe,
              employes: []
            };
          }
        })
      );
      
      setEquipes(equipesWithEmployes);
    } catch (error) {
      console.error("Erreur lors de la récupération des équipes:", error);
      setEquipes([]);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);

  useEffect(() => {
    if (selectedProject?.ID) {
      fetchEquipes(selectedProject.ID);
    } else {
      setEquipes([]);
    }
  }, [selectedProject?.ID, fetchEquipes]);

  const fetchBottinsEquipe = useCallback(async (equipeId: number) => {
    try {
      const bottins = await getBottinsEquipeChantier(equipeId);
      setBottinsEquipe(bottins);
    } catch (error) {
      console.error("Erreur lors de la récupération des bottins de l'équipe:", error);
      setBottinsEquipe(null);
    }
  }, []);

  const fetchJournals = useCallback(async (projectId: number) => { // Ajouter la fonction pour récupérer les journaux
    try {
      const journalsData = await getAllJournalChantierByProject(projectId);
      setJournals(journalsData);
    } catch (error) {
      console.error("Erreur lors de la récupération des journaux:", error);
      setJournals(null);
    }
  }, []);

  const handleCreateOrUpdateEquipe = useCallback(async (equipe: TabEquipeChantier): Promise<TabEquipeChantier> => {
    try {
      const updatedEquipe = await createOrUpdateEquipeChantierService(equipe);
      return updatedEquipe;
    } catch (error) {
      console.error("Erreur lors de la création ou de la mise à jour de l'équipe:", error);
      throw error;
    }
  }, []);

  const handleDeleteEquipe = useCallback(async (id: number): Promise<void> => {
    try {
      await deleteEquipeChantierService(id);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'équipe:", error);
      throw error;
    }
  }, []);

  const handleAddEmployeToEquipe = useCallback(async (equipeId: number, employeId: number): Promise<void> => {
    try {
      await addEmployeToEquipeService(equipeId, employeId);
    } catch (error) {
      console.error("Erreur lors de l'ajout d'un employé à l'équipe:", error);
      throw error;
    }
  }, []);

  const handleRemoveEmployeFromEquipe = useCallback(async (equipeId: number, employeId: number): Promise<void> => {
    try {
      await removeEmployeFromEquipeService(equipeId, employeId);
    } catch (error) {
      console.error("Erreur lors de la suppression d'un employé de l'équipe:", error);
      throw error;
    }
  }, []);

  useEffect(() => {
    fetchUnites();
  }, []);

  useEffect(() => {
    if (selectedProject?.ID) {
      fetchEmployes(selectedProject.ID);
      fetchBases(selectedProject.ID);
      fetchLieux(selectedProject.ID);
      fetchFonctions();
      fetchEquipements(selectedProject.ID);
      fetchSousTraitants();
      fetchMateriaux();
      fetchActivites(selectedProject.ID);
      fetchJournals(selectedProject.ID); // Appeler la fonction pour récupérer les journaux
    }
  }, [selectedProject, fetchEmployes, fetchBases, fetchLieux, fetchFonctions, fetchEquipements, fetchSousTraitants, fetchMateriaux, fetchActivites, fetchJournals]);

  const value = {
    user,
    claims,
    projects,
    selectedProject,
    employees: employeeList,
    fonctions,
    lieux,
    activites,
    equipements,
    materiaux,
    bases,
    sousTraitants,
    signalisations,
    activitesPlanif,
    unites,
    equipes,
    bottinsEquipe,
    journals, // Ajouter les journaux à la valeur du contexte
    isLoading,
    login: handleUserLogin,
    logout: handleUserLogout,
    handleCallback: handleUserCallback,
    selectProject,
    fetchBases,
    fetchLieux,
    fetchEmployes,
    fetchFonctions,
    fetchEquipements,
    fetchActivites,
    fetchMateriaux,
    fetchSousTraitants,
    fetchSignalisations,
    fetchActivitesPlanif,
    fetchUnites,
    fetchEquipes,
    fetchBottinsEquipe,
    fetchJournals, // Ajouter la fonction pour récupérer les journaux à la valeur du contexte
    createOrUpdateEquipeChantier: handleCreateOrUpdateEquipe,
    deleteEquipeChantier: handleDeleteEquipe,
    addEmployeToEquipe: handleAddEmployeToEquipe,
    removeEmployeFromEquipe: handleRemoveEmployeFromEquipe,
    setBases,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
