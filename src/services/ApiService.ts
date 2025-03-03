// src/services/ApiService.ts
import { userManager } from './AuthService';

/**
 * Service centralisé pour effectuer des requêtes API avec authentification
 * Ajoute automatiquement le token d'authentification aux en-têtes
 */
export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  try {
    // Récupérer l'utilisateur authentifié et son token
    const user = await userManager.getUser();
    
    if (!user || !user.access_token) {
      // Erreur silencieuse - sera gérée par le bloc catch
      throw new Error("Utilisateur non authentifié ou token d'accès non disponible");
    }
    
    // Vérifier si le token est expiré
    if (user.expired) {
      try {
        const renewedUser = await userManager.signinSilent();
        if (!renewedUser || !renewedUser.access_token) {
          throw new Error("Échec du renouvellement du token");
        }
        
        // Utiliser le token renouvelé
        const headers = new Headers(options.headers);
        headers.set('Authorization', `Bearer ${renewedUser.access_token}`);
        headers.set('Content-Type', 'application/json');
        
        return fetch(url, {
          ...options,
          headers
        });
      } catch (renewError) {
        // Erreur silencieuse - sera gérée par le bloc catch
        throw new Error("Session expirée, veuillez vous reconnecter");
      }
    }
    
    // Utiliser le token existant
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${user.access_token}`);
    
    // Ne pas écraser Content-Type s'il est déjà défini
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    
    return fetch(url, {
      ...options,
      headers
    });
  } catch (error) {
    // Erreur silencieuse - ne pas logger pour éviter le spam
    throw error;
  }
};

/**
 * Fonction pour vérifier si l'authentification est valide
 * Cette fonction ne vérifie que si l'utilisateur est authentifié avec un token valide
 */
export const checkApiAccess = async (): Promise<boolean> => {
  try {
  
    // Vérifier si l'utilisateur est authentifié
    const user = await userManager.getUser();
    
    if (user && user.access_token && !user.expired) {
      return true;
    }
    
    if (user && user.expired) {
      
      try {
        const renewedUser = await userManager.signinSilent();
        const isValid = !!renewedUser && !!renewedUser.access_token && !renewedUser.expired;
        
        return isValid;
      } catch (renewError) {
        // Erreur silencieuse
        return false;
      }
    }
    
    return false;
  } catch (error) {
    // Erreur silencieuse
    return false;
  }
};
