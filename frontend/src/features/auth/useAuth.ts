import { useContext } from "react";
import { AuthContext } from "./auth-context";
import type { AuthContextValue } from "./auth-context";

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth doit être utilisé dans un <AuthProvider>");
  }
  return ctx;
}
