import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
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
} from "../services/JournalService";
import { Project } from "../models/ProjectInfoModel";
import { UserClaims } from "../models/AuthModel";
import { Employe } from "../models/JournalFormModel";

interface AuthContextProps {
  user: User | null;
  claims: UserClaims | null;
  projects: Project[] | null;
  selectedProject: Project | null;
  employeeList: Employe[] | null;
  fonctions: string[] | null;
  lieux: string[] | null;
  activites: string[] | null;
  equipements: string[] | null;
  materiaux: string[] | null;
  bases: { id: number; base: string }[] | null;
  login: () => void;
  logout: () => void;
  handleCallback: () => Promise<void>;
  selectProject: (project: Project) => void;
  fetchBases: (projectId: number) => void;
  fetchLieux: (projectId: number) => void;
  fetchFonctions: () => void;
  fetchEquipements: (projectId: number) => void;
  fetchActivites: (projectId: number) => void;
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
  const [fonctions, setFonctions] = useState<string[] | null>(null);
  const [lieux, setLieux] = useState<string[] | null>(null);
  const [activites, setActivites] = useState<string[] | null>(null);
  const [equipements, setEquipements] = useState<string[] | null>(null);
  const [materiaux, setMateriaux] = useState<string[] | null>(null);
  const [bases, setBases] = useState<{ id: number; base: string }[] | null>(
    null
  );

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

  useEffect(() => {
    if (selectedProject) {
      fetchProjectDetails(selectedProject.ID);
    }
  }, [selectedProject]);

  const fetchProjectDetails = async (projectId: number) => {
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

      const materiauxData = await getMateriauxOutillage(projectId);
      setMateriaux(materiauxData);

      const basesData = await getBases(projectId);
      setBases(basesData);
    } catch (error) {
      console.error("Error fetching project details:", error);
    }
  };

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

  const fetchBases = async (projectId: number) => {
    const basesData = await getBases(projectId);
    setBases(basesData);
  };

  const fetchLieux = async (projectId: number) => {
    const lieuData = await getLieuProjet(projectId);
    setLieux(lieuData);
  };

  const fetchFonctions = async () => {
    const fonctionData = await getFonctionEmploye();
    setFonctions(fonctionData);
  };

  const fetchEquipements = async (projectId: number) => {
    const equipementData = await getEquipementsProjet(projectId);
    setEquipements(equipementData);
  };

  const fetchActivites = async (projectId: number) => {
    const equipementData = await getActiviteProjet(projectId);
    setEquipements(equipementData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        claims,
        projects,
        selectedProject,
        employeeList,
        fonctions,
        lieux,
        activites,
        equipements,
        materiaux,
        bases,
        login: handleUserLogin,
        logout: handleUserLogout,
        handleCallback: handleUserCallback,
        selectProject,
        fetchBases,
        fetchLieux,
        fetchFonctions,
        fetchEquipements,
        fetchActivites,
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
