import { WebStorageStateStore, UserManager, User, Log } from "oidc-client";

// Désactiver les logs détaillés pour éviter le spam en console
Log.logger = console;
Log.level = Log.ERROR; // Changer de DEBUG à ERROR pour ne montrer que les erreurs importantes

// Définir les paramètres OIDC
const settings = {
  authority: process.env.REACT_APP_AUTH,
  client_id: 'ProChantier', // Utiliser le client ID original
  // Utiliser une URL de redirection dynamique basée sur l'environnement actuel
  redirect_uri: window.location.origin + '/callback',
  post_logout_redirect_uri: window.location.origin,
  response_type: 'id_token token',
  scope: 'openid profile apibottin apioutils',
  // Utiliser sessionStorage au lieu de localStorage pour éviter les problèmes de stockage
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
  automaticSilentRenew: true,
  silentRequestTimeout: 10000,
  monitorSession: false, // Désactiver la surveillance continue de session
  loadUserInfo: true,
  filterProtocolClaims: true,
  revokeAccessTokenOnSignout: true,
  checkSessionInterval: 60000, // Augmenter l'intervalle à 60 secondes au lieu de 10
  accessTokenExpiringNotificationTime: 300, // 5 minutes avant expiration au lieu de la valeur par défaut (60s)
};

// Vérifier si les paramètres essentiels sont définis
if (!settings.authority) {
  throw new Error("L'autorité OIDC n'est pas définie. Vérifiez votre fichier .env");
}

if (!settings.client_id) {
  throw new Error("L'ID client OIDC n'est pas défini");
}

if (!settings.redirect_uri) {
  throw new Error("L'URI de redirection OIDC n'est pas définie");
}

export const userManager = new UserManager(settings);

// Ajouter des événements pour le débogage - avec moins de logging
userManager.events.addUserLoaded((user) => {
  // Utilisateur chargé (après connexion ou renouvellement de token)
});

userManager.events.addSilentRenewError((error) => {
  // Erreur lors du renouvellement silencieux du token
  console.error("Erreur de renouvellement silencieux:", error);
});

userManager.events.addUserSignedOut(() => {
  // Utilisateur déconnecté
  // Supprimer l'utilisateur du stockage local
  userManager.removeUser().catch(error => {
    // Gestion silencieuse de l'erreur
  });
});

userManager.events.addAccessTokenExpiring(() => {
  // Le token d'accès va expirer - ne pas logger pour éviter le spam
});

userManager.events.addAccessTokenExpired(() => {
  // Le token d'accès a expiré
});

userManager.events.addUserUnloaded(() => {
  // Utilisateur déchargé
});

userManager.events.addUserSessionChanged(() => {
  // Session utilisateur modifiée
});

// Fonction pour vérifier si l'utilisateur est en cours de redirection depuis le serveur d'authentification
export const isAuthCallback = () => {
  const url = window.location.href;
  const isCallback = url.includes('code=') || 
         url.includes('id_token=') || 
         url.includes('access_token=') ||
         url.includes('error=');
  
  return isCallback;
};

// Fonction pour vérifier si l'utilisateur est déjà authentifié via SSO
export const checkSsoAuthentication = async (): Promise<User | null> => {
  try {
    // Vérifier si l'utilisateur est déjà connecté
    const user = await userManager.getUser();
    
    if (user) {
      if (!user.expired) {
        return user;
      }
      
      // Si l'utilisateur a un token expiré, essayer de le renouveler silencieusement
      try {
        const renewedUser = await userManager.signinSilent();
        return renewedUser;
      } catch (error: any) {
        // En cas d'échec du renouvellement, l'utilisateur devra se reconnecter
        await userManager.removeUser();
        return null;
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

export const login = async (): Promise<void> => {
  try {
    // Supprimer l'utilisateur existant avant de rediriger
    await userManager.removeUser();
    
    // Utiliser la méthode standard signinRedirect avec des options explicites
    // Créer des options explicites pour la redirection
    const redirectOptions = {
      redirect_uri: window.location.origin + '/callback',
      state: Math.random().toString(36).substring(2, 15),
      nonce: Math.random().toString(36).substring(2, 15)
    };
    
    await userManager.signinRedirect(redirectOptions);
  } catch (error) {
    throw error;
  }
};

// Fonction pour gérer le callback d'authentification
export const handleCallback = async (): Promise<User> => {
  try {
    // Vérifier si l'URL contient une erreur
    const url = window.location.href;
    if (url.includes('error=')) {
      const errorMatch = url.match(/error=([^&]*)/);
      const errorDescriptionMatch = url.match(/error_description=([^&]*)/);
      const error = errorMatch ? decodeURIComponent(errorMatch[1]) : "unknown_error";
      const errorDescription = errorDescriptionMatch ? decodeURIComponent(errorDescriptionMatch[1]) : "Unknown error";
      throw new Error(`${error}: ${errorDescription}`);
    }
    
    // Extraire directement les tokens du fragment d'URL
    if (window.location.hash) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      
      const access_token = params.get('access_token');
      const id_token = params.get('id_token');
      const token_type = params.get('token_type');
      const expires_in = params.get('expires_in');
      const scope = params.get('scope');
      const state = params.get('state');
      
      if (access_token && id_token) {
        try {
          // Essayer d'abord la méthode standard avant de passer à la méthode manuelle
          try {
            const user = await userManager.signinRedirectCallback(url);
            
            if (user) {
              // Double vérification du stockage
              const storedUser = await userManager.getUser();
              if (!storedUser) {
                throw new Error("Utilisateur non stocké après signinRedirectCallback");
              }
              
              return user;
            }
            
            throw new Error("Aucun utilisateur retourné par signinRedirectCallback");
          } catch (standardError) {
            // Procéder avec la méthode manuelle si la méthode standard échoue
            // Décoder le token ID pour obtenir les informations de l'utilisateur
            const base64Url = id_token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            const profile = JSON.parse(jsonPayload);
            
            // Créer un objet utilisateur manuellement
            const manualUser = {
              id_token: id_token,
              access_token: access_token,
              token_type: token_type || 'Bearer',
              scope: scope || 'openid profile apibottin apioutils',
              profile: profile,
              expires_at: expires_in ? Math.floor(Date.now() / 1000) + parseInt(expires_in) : Math.floor(Date.now() / 1000) + 3600,
              state: state || '',
            };
            
            // Supprimer l'utilisateur existant pour éviter les conflits
            await userManager.removeUser();
            
            // Stocker l'utilisateur manuellement
            await userManager.storeUser(manualUser as any);
            
            // Stocker également dans sessionStorage comme sauvegarde
            try {
              sessionStorage.setItem('manual_user_backup', JSON.stringify(manualUser));
            } catch (storageError) {
              // Gestion silencieuse de l'erreur
            }
            
            // Double vérification du stockage
            const user = await userManager.getUser();
            
            if (!user) {
              throw new Error("Impossible de récupérer l'utilisateur après le stockage manuel");
            }
            
            return user;
          }
        } catch (manualError) {
          throw manualError;
        }
      } else {
        throw new Error("Tokens manquants dans l'URL");
      }
    } else {
      throw new Error("Aucun fragment trouvé dans l'URL");
    }
  } catch (error) {
    // Essayer de récupérer l'utilisateur depuis la sauvegarde manuelle
    try {
      const manualBackup = sessionStorage.getItem('manual_user_backup');
      if (manualBackup) {
        const backupUser = JSON.parse(manualBackup);
        await userManager.storeUser(backupUser);
        
        const restoredUser = await userManager.getUser();
        if (restoredUser) {
          return restoredUser;
        }
      }
    } catch (backupError) {
      // Gestion silencieuse de l'erreur
    }
    
    // Essayer de vérifier si l'utilisateur est déjà stocké malgré l'erreur
    try {
      const fallbackUser = await userManager.getUser();
      
      if (fallbackUser && !fallbackUser.expired) {
        return fallbackUser;
      }
    } catch (fallbackError) {
      // Gestion silencieuse de l'erreur
    }
    
    throw error;
  }
};

// Fonction pour récupérer l'utilisateur actuel
export const getUser = async (): Promise<User | null> => {
  try {
    // Récupérer l'utilisateur depuis le stockage
    const user = await userManager.getUser();
    
    if (!user) {
      return null;
    }
    
    // Si le token est expiré, essayer de le renouveler silencieusement
    if (user.expired) {
      try {
        // Essayer de renouveler le token silencieusement
        const renewedUser = await userManager.signinSilent();
        return renewedUser;
      } catch (error: any) {
        // Si le renouvellement silencieux échoue, supprimer l'utilisateur du stockage
        await userManager.removeUser();
        return null;
      }
    }
    
    // Si le token n'est pas expiré, retourner l'utilisateur
    return user;
  } catch (error) {
    return null;
  }
};

export const logout = async () => {
  try {
    // Vérifier si l'utilisateur est connecté
    const user = await userManager.getUser();
    
    if (!user) {
      return;
    }
    
    // Supprimer l'utilisateur du stockage local avant de rediriger
    await userManager.removeUser();
    
    // Rediriger vers la page de déconnexion du serveur d'identité
    await userManager.signoutRedirect();
  } catch (error) {
    // En cas d'erreur, essayer de supprimer l'utilisateur du stockage local
    try {
      await userManager.removeUser();
    } catch (removeError) {
      // Gestion silencieuse de l'erreur
    }
    
    throw error;
  }
};

// Fonction pour vérifier la configuration OIDC
export const checkOidcConfiguration = async (): Promise<boolean> => {
  try {
    // Vérifier si l'autorité est définie
    if (!settings.authority) {
      return false;
    }
    
    // Vérifier si l'autorité est accessible
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 secondes timeout
    
    try {
      const response = await fetch(`${settings.authority}/.well-known/openid-configuration`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        try {
          const config = await response.json();
          
          // Vérifier que la configuration contient les éléments essentiels
          if (config.authorization_endpoint && config.token_endpoint && config.jwks_uri) {
            return true;
          } else {
            return false;
          }
        } catch (jsonError) {
          return false;
        }
      } else {
        // Essayer une approche alternative avec XMLHttpRequest qui peut être plus permissive avec les certificats auto-signés
        return new Promise((resolve) => {
          const xhr = new XMLHttpRequest();
          xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
              if (xhr.status === 200) {
                try {
                  // Analyser la réponse JSON
                  const config = JSON.parse(xhr.responseText);
                  
                  // Vérifier que la configuration contient les éléments essentiels
                  if (config.authorization_endpoint && config.token_endpoint && config.jwks_uri) {
                    resolve(true);
                  } else {
                    resolve(false);
                  }
                } catch (jsonError) {
                  resolve(false);
                }
              } else {
                resolve(false);
              }
            }
          };
          xhr.open('GET', `${settings.authority}/.well-known/openid-configuration`, true);
          xhr.timeout = 5000;
          xhr.send();
        });
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // Essayer une approche alternative
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              try {
                // Analyser la réponse JSON
                const config = JSON.parse(xhr.responseText);
                
                // Vérifier que la configuration contient les éléments essentiels
                if (config.authorization_endpoint && config.token_endpoint && config.jwks_uri) {
                  resolve(true);
                } else {
                  resolve(false);
                }
              } catch (jsonError) {
                resolve(false);
              }
            } else {
              resolve(false);
            }
          }
        };
        xhr.open('GET', `${settings.authority}/.well-known/openid-configuration`, true);
        xhr.timeout = 5000;
        xhr.send();
      });
    }
  } catch (error) {
    return false;
  }
};

// Fonction pour vérifier si les tokens sont correctement stockés
export const checkTokenStorage = (): boolean => {
  try {
    // Vérifier si sessionStorage est disponible
    if (typeof sessionStorage === 'undefined') {
      return false;
    }
    
    // Vérifier si les clés OIDC existent dans sessionStorage
    const keys = Object.keys(sessionStorage);
    const oidcKeys = keys.filter(key => key.startsWith('oidc.'));
    
    if (oidcKeys.length === 0) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

// Fonction pour vérifier si les tokens sont valides pour les requêtes API
export const checkTokenForApi = async (): Promise<boolean> => {
  try {
    const user = await userManager.getUser();
    
    if (!user) {
      return false;
    }
    
    if (!user.access_token) {
      return false;
    }
    
    if (user.expired) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
};
