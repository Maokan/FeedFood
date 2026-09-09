import { API_BASE_URL } from '../../api/http';
import { getValidToken } from '../auth/token';

/**
 * Renvoie true si l'utilisateur connecté a liké le post.
 */
export async function getPostLikes(postId: string): Promise<boolean> {
  const data = await sendLikeRequest(postId, 'GET');
  return data.liked === true;
}

export async function addPostLikes(postId: string): Promise<void> {
  await sendLikeRequest(postId, 'POST');
}

export async function removePostLikes(postId: string): Promise<void> {
  await sendLikeRequest(postId, 'DELETE');
}

async function sendLikeRequest(
  postId: string,
  method: 'GET' | 'POST' | 'DELETE',
): Promise<{ liked: boolean }> {
  const token = getValidToken();

  const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
    method,
    headers:
      token !== null ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!response.ok) {
    throw new Error(`Le serveur a répondu avec une erreur (${response.status}).`);
  }

  return (await response.json()) as { liked: boolean };
}
