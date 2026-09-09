import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getValidToken } from "./token";

// Protège une route : redirige vers /login si l'utilisateur n'est pas connecté
export default function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();

  if (!getValidToken()) {
    // on mémorise la page demandée pour y revenir après connexion
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
