import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Callback from './components/Callback';
import { AuthProvider } from './context/AuthContext';
import { 
  checkOidcConfiguration, 
  checkTokenStorage,
  checkSsoAuthentication,
  isAuthCallback as isAuthCallbackService,
  login
} from "./services/AuthService";
import { checkApiAccess } from './services/ApiService';
import Form from "./components/journalForm/Form";
import CalendarPage from "./components/calendrier/CalendarPage";
import PlanningForm from "./components/calendrier/PlanningForm";
import Sidebar from "./components/header/Sidebar";
import Footer from "./components/footer/Footer";
import Gestion from "./components/sections/gestions/Gestions";
import Rapport from "./components/sections/rapport/journal/Rapport";
import TruckLoader from './components/loader/TruckLoader';

// Composant pour la redirection vers la page de login
const LoginRedirect: React.FC = () => {
  useEffect(() => {
    login();
  }, []);

  return (
    <div className="login-redirect">
      <h1>Redirection vers la page de login...</h1>
      <p>Veuillez patienter pendant que nous vous redirigeons vers la page de connexion.</p>
    </div>
  );
};

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [diagnosticInfo, setDiagnosticInfo] = useState<Record<string, boolean>>({});
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [directOidcTest, setDirectOidcTest] = useState<string>('Non testé');
  
  // Fonction pour tester directement l'accès à l'URL de configuration OIDC
  const testOidcConfigurationDirectly = async () => {
    try {
      const oidcUrl = `${process.env.REACT_APP_AUTH}/.well-known/openid-configuration`;
      
      // Essai avec XMLHttpRequest
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            setDirectOidcTest(`Succès (XMLHttpRequest): ${xhr.status}`);
          } else {
            // Si XMLHttpRequest échoue, essayer avec fetch
            fetch(oidcUrl)
              .then(response => {
                setDirectOidcTest(`Succès (fetch): ${response.status}`);
                return response.text();
              })
              .catch(fetchError => {
                setDirectOidcTest(`Échec (fetch): ${fetchError.message}`);
              });
          }
        }
      };
      xhr.open('GET', oidcUrl, true);
      xhr.timeout = 5000;
      xhr.send();
    } catch (error) {
      setDirectOidcTest(`Erreur: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Vérifier l'authentification
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        setLoading(true);
        
        // Vérifier s'il s'agit d'un rappel d'authentification
        if (isAuthCallbackService()) {
          setLoading(false); // Important: désactiver le chargement pour permettre au composant Callback de fonctionner
          return;
        }
        
        // Vérifier si l'authentification a été récemment terminée
        const redirectCompleted = sessionStorage.getItem('auth_redirect_completed');
        if (redirectCompleted === 'true') {
          sessionStorage.removeItem('auth_redirect_completed');
          // Ajouter un petit délai pour s'assurer que tout est prêt
          setTimeout(() => {
            setAuthChecked(true);
            setLoading(false);
          }, 500);
          return;
        }
                
        // Vérifier la configuration OIDC
        const oidcConfigValid = await checkOidcConfiguration();
        setDiagnosticInfo(prev => ({ ...prev, oidcConfigValid }));
        
        if (!oidcConfigValid) {
          console.error("Configuration OIDC invalide");
          setError("La configuration OIDC est invalide. Vérifiez que le serveur d'identité est accessible.");
          setShowDiagnostic(true);
          setLoading(false);
          return;
        }
        
        // Vérifier si l'utilisateur est authentifié
        const authValid = await checkApiAccess();
        setDiagnosticInfo(prev => ({ ...prev, apiAccessible: authValid }));
        
        // Vérifier si des tokens sont stockés
        const tokensStored = await checkTokenStorage();
        setDiagnosticInfo(prev => ({ ...prev, tokensStored }));
        
        // Vérifier l'authentification SSO
        const user = await checkSsoAuthentication();
        
        if (user) {
          // Utilisateur authentifié, marquer l'authentification comme vérifiée
          setAuthChecked(true);
          setLoading(false);
        } else {
          // Utilisateur non authentifié, rediriger vers la page de connexion
          if (!authChecked) {
            // Rediriger immédiatement vers la page de connexion
            try {
              login();
            } catch (loginError) {
              console.error("Erreur lors de la redirection vers la page de connexion");
              setError(`Erreur lors de la redirection vers la page de connexion: ${loginError instanceof Error ? loginError.message : 'Erreur inconnue'}`);
              setShowDiagnostic(true);
              setLoading(false);
            }
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        console.error(`Erreur lors de la vérification de l'authentification: ${errorMessage}`);
        setError(`Erreur lors de la vérification de l'authentification: ${errorMessage}`);
        setShowDiagnostic(true);
        setLoading(false);
      }
    };
    
    // Ajouter un timeout de sécurité pour éviter un chargement infini
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn("Timeout de sécurité atteint lors de la vérification de l'authentification");
        setError("Le processus d'authentification a pris trop de temps. Veuillez rafraîchir la page.");
        setShowDiagnostic(true);
        setLoading(false);
      }
    }, 15000); // 15 secondes de timeout
    
    checkAuthentication();
    
    // Nettoyer le timeout
    return () => clearTimeout(timeoutId);
  }, [authChecked]);

  // Afficher un écran de chargement
  if (loading && !showDiagnostic) {
    return <TruckLoader />;
  }
  
  // Afficher un écran de diagnostic
  if (showDiagnostic) {
    return (
      <div className="diagnostic-screen">
        <h1>Diagnostic d'authentification</h1>
        <div className="diagnostic-info">
          <h2>Informations de configuration</h2>
          <ul>
            <li>URL d'authentification: <code>{process.env.REACT_APP_AUTH}</code></li>
            <li>URL de l'API: <code>{process.env.REACT_APP_BRUNEAU_API}</code></li>
            <li>URL de redirection: <code>{window.location.origin}/callback</code></li>
            <li>Test direct OIDC: <strong>{directOidcTest}</strong></li>
          </ul>
          
          <h2>État de l'authentification</h2>
          <ul>
            <li>Configuration OIDC valide: <span className={diagnosticInfo['oidcConfigValid'] ? 'success' : 'error'}>{diagnosticInfo['oidcConfigValid'] ? 'Oui ' : 'Non '}</span></li>
            <li>API accessible: <span className={diagnosticInfo['apiAccessible'] ? 'success' : 'error'}>{diagnosticInfo['apiAccessible'] ? 'Oui ' : 'Non '}</span></li>
            <li>Tokens stockés: <span className={diagnosticInfo['tokensStored'] ? 'success' : 'error'}>{diagnosticInfo['tokensStored'] ? 'Oui ' : 'Non '}</span></li>
          </ul>
        </div>
        <div className="diagnostic-actions">
          <h2>Actions</h2>
          <button 
            onClick={() => testOidcConfigurationDirectly()}
            className="diagnostic-button"
          >
            Tester l'URL de configuration OIDC
          </button>
          <button 
            onClick={() => login()}
            className="diagnostic-button primary"
          >
            Se connecter
          </button>
        </div>
        <div className="diagnostic-help">
          <h2>Aide au dépannage</h2>
          <ul>
            <li>Vérifiez que le serveur d'authentification est en cours d'exécution à l'adresse <code>{process.env.REACT_APP_AUTH}</code></li>
            <li>Vérifiez que le serveur d'API est en cours d'exécution à l'adresse <code>{process.env.REACT_APP_BRUNEAU_API}</code></li>
            <li>Vérifiez que les certificats SSL sont valides ou que vous avez désactivé la vérification SSL</li>
            <li>Vérifiez que la configuration CORS est correcte sur le serveur d'authentification</li>
            <li>Vérifiez que le client <code>ProChantier</code> est correctement configuré dans IdentityServer4</li>
          </ul>
        </div>
      </div>
    );
  }

  // Afficher l'application normale
  return (
    <AuthProvider>
      <Router>
        <div className="App flex flex-col min-h-screen">
          <Routes>
            <Route path="/callback" element={<Callback />} />
            <Route path="/login" element={<LoginRedirect />} />
            <Route path="/*" element={
              <div className="flex flex-1 flex-row">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                  <Routes>
                    <Route path="/" element={<CalendarPage />} />
                    <Route path="/planning" element={<PlanningForm />} />
                    <Route path="/rapport" element={<Rapport />} />
                    <Route path="/gestions" element={<Gestion />} />
                    <Route path="/journal-chantier" element={<Form />} />
                    <Route path="/journal-chantier/:idPlanif" element={<Form />} />
                  </Routes>
                  <Footer />
                </div>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
