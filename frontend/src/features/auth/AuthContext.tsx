import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { AuthContext } from "./auth-context";
import { decodeToken, getValidToken } from "./token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getValidToken());

  const login = useCallback((newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
  }, []);

  const payload = token ? decodeToken(token) : null;

  return (
    <AuthContext.Provider value={{ token, payload, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
