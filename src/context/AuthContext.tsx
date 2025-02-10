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
  }, [user, initialFetchAttempted]);

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
  };

  const fetchBases = useCallback(async (lieuId: number) => {
    if (lieuId > 0) {
      const updatedBases = await getBases(lieuId);

      setBases((prevBases) => {
        // Filtrage des bases qui ne sont pas liées au lieu actuel
        const otherBases = (prevBases ?? []).filter(
          (base) => base.lieuId !== lieuId
        );
        // Combinaison des bases existantes avec les nouvelles bases pour ce lieu
        return [...otherBases, ...updatedBases];
      });
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
              return bases.map((base: any) => ({
                id: base.id,
                base: base.base,
                lieuId: lieu.id,
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

  return (
    <AuthContext.Provider
      value={{
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
        setBases,
      }}
    >
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
