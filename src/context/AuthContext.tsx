import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User } from "oidc-client";
import { getUser, login, logout } from "../services/AuthService";

interface UserClaims {
  sub: string;
  name: string;
  Est_Contremaitre: string;
  Est_Adjoint: string;
  Est_Dev: string;
  Est_DirecteurProjet: string;
  Est_ChargeProjet: string;
  email_verified: string;
  given_name: string;
  Est_PricerVetementAdmin: string;
  Est_Entrepot: string;
  idp: string;
  amr: string;
  auth_time: string;
  [key: string]: string;
}

interface Project {
  id: number;
  name: string;
  // Ajoutez d'autres propriétés nécessaires pour votre projet
}

interface AuthContextProps {
  user: User | null;
  claims: UserClaims | null;
  projects: Project[] | null;
  login: () => void;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  claims: null,
  projects: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [claims, setClaims] = useState<UserClaims | null>(null);
  const [projects, setProjects] = useState<Project[] | null>(null);

  useEffect(() => {
    (async () => {
      const user = await getUser();
      if (!user) {
        login();
      } else {
        setUser(user);
        const claims = user.profile as unknown as UserClaims;
        setClaims(claims);
        fetchProjects(claims.sub);
      }
    })();
  }, []);

  const fetchProjects = async (userId: string) => {
    try {
      console.log("userId", userId);
      const response = await fetch(
        `${process.env.REACT_APP_BRUNEAU_API}/Horizon/projets/GetAuthorizedProjects/${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user?.access_token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else {
        console.error("Failed to fetch projects");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, claims, projects, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
