import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleCallback, getUser } from '../services/AuthService';

const Callback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    const processCallback = async () => {
      try {        
        // Vérifier si l'URL contient une erreur
        const url = window.location.href;
        if (url.includes('error=')) {
          console.error("❌ Erreur détectée dans l'URL du callback");
          const errorMatch = url.match(/error=([^&]*)/);
          const errorDescriptionMatch = url.match(/error_description=([^&]*)/);
          const error = errorMatch ? decodeURIComponent(errorMatch[1]) : "unknown_error";
          const errorDescription = errorDescriptionMatch ? decodeURIComponent(errorDescriptionMatch[1]) : "Unknown error";
          console.error("❌ Détails de l'erreur:", { error, errorDescription });
          throw new Error(`${error}: ${errorDescription}`);
        }
        
        // Traiter le callback
        const user = await handleCallback();
        
        if (!user) {
          throw new Error("Aucun utilisateur retourné après le traitement du callback");
        }
                
        // Vérifier que l'utilisateur est bien stocké
        const storedUser = await getUser();
        if (!storedUser) {
          console.error("⚠️ L'utilisateur n'est pas correctement stocké après le callback");
          
          if (retryCount < maxRetries) {
            setRetryCount(prevCount => prevCount + 1);
            // Attendre 1 seconde avant de réessayer
            setTimeout(processCallback, 1000);
            return;
          } else {
            throw new Error("Impossible de stocker l'utilisateur après plusieurs tentatives");
          }
        }
                
        // Forcer la mise à jour du localStorage/sessionStorage avant la redirection
        window.sessionStorage.setItem('auth_redirect_completed', 'true');
        
        // S'assurer que la redirection se produit après un court délai pour laisser le temps
        // aux tokens d'être correctement enregistrés
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        console.error(`❌ Erreur lors du traitement du callback: ${errorMessage}`);
        
        // Afficher plus de détails sur l'erreur
        if (error instanceof Error && error.stack) {
          console.error("Stack trace:", error.stack);
        }
        
        // Si nous n'avons pas encore atteint le nombre maximum de tentatives, réessayer
        if (retryCount < maxRetries) {
          setRetryCount(prevCount => prevCount + 1);
          // Attendre 1 seconde avant de réessayer
          setTimeout(processCallback, 1000);
        } else {
          setError(`Erreur lors de l'authentification: ${errorMessage}`);
          setProcessing(false);
        }
      }
    };

    processCallback();
  }, [navigate, retryCount]);

  if (error) {
    return (
      <div className="callback-error">
        <h1>Erreur d'authentification</h1>
        <p>{error}</p>
        <button onClick={() => window.location.href = '/'}>Retour à l'accueil</button>
      </div>
    );
  }

  return (
    <div className="callback-processing">
      <div className="spinner"></div>
      <h1>Traitement de l'authentification...</h1>
      <p>Veuillez patienter pendant que nous traitons votre connexion.</p>
      {retryCount > 0 && (
        <p>Tentative de récupération {retryCount}/{maxRetries}...</p>
      )}
    </div>
  );
};

export default Callback;
