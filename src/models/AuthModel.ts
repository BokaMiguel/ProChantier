export interface UserClaims {
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