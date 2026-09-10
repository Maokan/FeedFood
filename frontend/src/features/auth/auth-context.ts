import { createContext } from "react";
import type { TokenPayload } from "./token";

export interface AuthContextValue {
  /** Token JWT courant (stocké en localStorage), ou null si non connecté. */
  token: string | null;
  /** Contenu décodé du token (userId, role, expiration...). */
  payload: TokenPayload | null;
  /** Enregistre le token (localStorage + état) après un login réussi. */
  login: (token: string) => void;
  /** Supprime le token (localStorage + état). */
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);
