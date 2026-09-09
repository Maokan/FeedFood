/** Adresse du serveur backend, surchargeable avec la variable VITE_API_URL. */
const envApiUrl = import.meta.env.VITE_API_URL;

export const API_BASE_URL =
  typeof envApiUrl === 'string' && envApiUrl.length > 0
    ? envApiUrl.replace(/\/$/, '')
    : 'http://localhost:3000';

/**
 * Transforme un chemin d'image renvoyé par l'API (ex: "/uploads/x.jpg")
 * en URL absolue vers le backend.
 */
export function resolveAssetUrl(path: string | null): string | null {
  if (path === null) {
    return null;
  }
  return /^https?:\/\//.test(path) ? path : `${API_BASE_URL}${path}`;
}
