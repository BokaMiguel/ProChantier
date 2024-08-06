import { WebStorageStateStore, UserManager, User } from "oidc-client";

const settings = {
  authority: process.env.REACT_APP_AUTH,
  client_id: 'ProChantier',
  redirect_uri: `${window.location.origin}/callback`,
  response_type: 'id_token token',
  scope: 'openid profile apibottin apioutils',
  post_logout_redirect_uri: `${window.location.origin}/prochantier-login`, 
  userStore: new WebStorageStateStore({ store: window.localStorage })
};

const userManager = new UserManager(settings);

export const login = () => {
  return userManager.signinRedirect();
};

export const handleCallback = async () => {
  return userManager.signinRedirectCallback();
};

export const getUser = async (): Promise<User | null> => {
  return userManager.getUser();
};

export const logout = () => {
  return userManager.signoutRedirect();
};
