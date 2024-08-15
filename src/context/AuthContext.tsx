import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
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
} from "../services/JournalService";
import { Project } from "../models/ProjectInfoModel";
import { UserClaims } from "../models/AuthModel";
import {
  Employe,
  Equipement,
  Fonction,
  Localisation,
  Materiau,
  SousTraitant,
} from "../models/JournalFormModel";

interface AuthContextProps {
  user: User | null;
  claims: UserClaims | null;
  projects: Project[] | null;
  selectedProject: Project | null;
  employees: Employe[] | null;
  fonctions: Fonction[] | null;
  lieux: string[] | null;
  activites: string[] | null;
  equipements: Equipement[] | null;
  materiaux: Materiau[] | null;
  sousTraitants: SousTraitant[] | null;
  bases: { id: number; base: string }[] | null;
  login: () => void;
  logout: () => void;
  handleCallback: () => Promise<void>;
  selectProject: (project: Project) => void;
  fetchBases: (projectId: number) => void;
  fetchLieux: (projectId: number) => void;
  fetchEmployes: (projectId: number) => void;
  fetchFonctions: () => void;
  fetchEquipements: (projectId: number) => void;
  fetchActivites: (projectId: number) => void;
  fetchMateriaux: () => void;
  fetchSousTraitants: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [claims, setClaims] = useState<UserClaims | null>(null);
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [employeeList, setEmployeeList] = useState<Employe[] | null>(null);
  const [fonctions, setFonctions] = useState<Fonction[] | null>(null);
  const [lieux, setLieux] = useState<string[] | null>(null);
  const [activites, setActivites] = useState<string[] | null>(null);
  const [equipements, setEquipements] = useState<Equipement[] | null>(null);
  const [materiaux, setMateriaux] = useState<Materiau[] | null>(null);
  const [sousTraitants, setSousTraitants] = useState<SousTraitant[] | null>(
    null
  );
  const [bases, setBases] = useState<Localisation[] | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await getUser();
      if (storedUser) {
        setUser(storedUser);
        const userClaims = storedUser.profile as unknown as UserClaims;
        setClaims(userClaims);

        const projectsData = await getAuthorizedProjects(userClaims.sub);
        setProjects(projectsData);
      } else {
        login();
      }
    };

    fetchUser().catch((err) => {
      console.error("Error loading user:", err);
    });
  }, []);

  // Utilisation de useCallback pour mémoriser la fonction fetchProjectDetails
  const fetchProjectDetails = useCallback(async (projectId: number) => {
    try {
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

      const basesData = await getBases(projectId);
      setBases(basesData);

      const sousTraitantsData = await getSousTraitantProjet();
      setSousTraitants(sousTraitantsData);
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
    const user = await handleCallback();
    setUser(user);
    const userClaims = user.profile as unknown as UserClaims;
    setClaims(userClaims);

    const projectsData = await getAuthorizedProjects(userClaims.sub);
    setProjects(projectsData);
  };

  const selectProject = (project: Project) => {
    setSelectedProject(project);
  };

  const fetchBases = useCallback(async (projectId: number) => {
    const basesData = await getBases(projectId);
    setBases(basesData);
  }, []);

  const fetchLieux = useCallback(async (projectId: number) => {
    const lieuData = await getLieuProjet(projectId);
    setLieux(lieuData);
  }, []);

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

  const fetchMateriaux = useCallback(async () => {
    const materiauxData = await getMateriauxOutillage();
    setMateriaux(materiauxData);
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
