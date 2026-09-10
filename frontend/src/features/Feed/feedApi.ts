import { API_BASE_URL } from '../../api/http';
import { getValidToken } from '../auth/token';
import type { FeedAuthor, FeedPage, FeedPost } from '../posts/postTypes';

const PAGE_SIZE = 10;

export async function fetchFeedPage(
  cursor: string | null,
  signal?: AbortSignal,
): Promise<FeedPage> {
  const params = new URLSearchParams({ limit: String(PAGE_SIZE) });
  if (cursor !== null) {
    params.set('cursor', cursor);
  }

  let response: Response;
  try {
    const token = getValidToken();
    response = await fetch(`${API_BASE_URL}/posts?${params}`, {
      signal,
      cache: 'no-store',
      headers:
        token !== null
          ? { Authorization: `Bearer ${token}` }
          : undefined,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    throw new Error(
      `Impossible de contacter le serveur. Vérifie qu'il est démarré sur ${API_BASE_URL}.`,
      { cause: error },
    );
  }

  if (!response.ok) {
    throw new Error(`Le serveur a répondu avec une erreur (${response.status}).`);
  }

  return parseFeedPage(await response.json());
}

function parseFeedPage(raw: unknown): FeedPage {
  if (!isRecord(raw) || !Array.isArray(raw.posts)) {
    throw new Error('Réponse du serveur invalide.');
  }

  const posts: FeedPost[] = [];
  for (const item of raw.posts) {
    if (!isPost(item)) {
      throw new Error('Un post reçu du serveur est invalide.');
    }
    posts.push(item);
  }

  const nextCursor = typeof raw.nextCursor === 'string' ? raw.nextCursor : null;

  return { posts, nextCursor };
}

function isPost(value: unknown): value is FeedPost {
  if (!isRecord(value)) {
    return false;
  }
  if (
    typeof value.id !== 'string' ||
    typeof value.content !== 'string' ||
    typeof value.createdAt !== 'string' ||
    typeof value.likeCount !== 'number' ||
    typeof value.commentCount !== 'number' ||
    typeof value.isLiked !== 'boolean'
  ) {
    return false;
  }
  if (value.imageUrl !== null && typeof value.imageUrl !== 'string') {
    return false;
  }
  return isAuthor(value.author);
}

function isAuthor(value: unknown): value is FeedAuthor {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.username === 'string'
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
