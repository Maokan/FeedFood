export interface TokenPayload {
  userId: string;
  role: string;
  iat: number;
  exp: number;
}

// Décode la partie payload d'un JWT (sans vérifier la signature)
export function decodeToken(token: string): TokenPayload | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

// Renvoie le token s'il existe et n'est pas expiré, sinon null
export function getValidToken(): string | null {
  const token = localStorage.getItem("token");
  if (!token) {
    return null;
  }

  const payload = decodeToken(token);
  if (!payload || payload.exp * 1000 <= Date.now()) {
    // Token illisible ou expiré : on le supprime
    localStorage.removeItem("token");
    return null;
  }

  return token;
}
