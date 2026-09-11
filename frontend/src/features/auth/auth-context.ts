import { createContext } from "react";
import type { TokenPayload } from "./token";

export interface AuthContextValue {
  
  token: string | null;
  
  payload: TokenPayload | null;
  
  login: (token: string) => void;
  
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);
