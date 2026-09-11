import type { Page, Route } from '@playwright/test';
import type { FeedPost } from '../posts/postTypes';

/**
 * Faux JWT : le front ne vérifie que sa forme et sa date d'expiration,
 * jamais la signature (elle est vérifiée côté backend).
 */
export const FAKE_TOKEN =
  'header.eyJ1c2VySWQiOiJ1MSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxLCJleHAiOjQxMDI0NDQ4MDB9.signature';

/** En-têtes nécessaires pour qu'une réponse simulée passe le CORS du navigateur. */
export const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Content-Type': 'application/json',
};

export interface FeedPagePayload {
  posts: FeedPost[];
  nextCursor: string | null;
}

/** Pour un curseur donné : la page à renvoyer, ou un code HTTP d'erreur. */
export type FeedResolver = (cursor: string | null) => FeedPagePayload | number;

/** Place un token valide dans le localStorage avant le démarrage de l'app. */
export async function authenticate(page: Page): Promise<void> {
  await page.addInitScript((token: string) => {
    window.localStorage.setItem('token', token);
  }, FAKE_TOKEN);
}

export function makePost(overrides: Partial<FeedPost> = {}): FeedPost {
  return {
    id: 'post-1',
    content: 'Mon burger du soir',
    imageUrl: null,
    createdAt: new Date().toISOString(),
    author: { id: 'user-1', username: 'alice' },
    likeCount: 0,
    commentCount: 0,
    isLiked: false,
    ...overrides,
  };
}

export function isPostsRequest(url: URL): boolean {
  return url.hostname === 'localhost' && url.pathname === '/posts';
}

export async function fulfillJson(
  route: Route,
  status: number,
  body: unknown,
): Promise<void> {
  try {
    await route.fulfill({
      status,
      headers: CORS_HEADERS,
      body: JSON.stringify(body),
    });
  } catch {
    // Requête annulée : React StrictMode relance l'effet de chargement en dev.
  }
}

export async function fulfillNoContent(route: Route): Promise<void> {
  try {
    await route.fulfill({ status: 204, headers: CORS_HEADERS });
  } catch {
    // Requête annulée (préflight CORS obsolète).
  }
}

/**
 * Intercepte GET /posts et répond selon `resolver` (indexé par le curseur).
 * Renvoie la liste des curseurs réellement demandés par le front.
 */
export async function mockFeed(
  page: Page,
  resolver: FeedResolver,
): Promise<{ cursors: (string | null)[] }> {
  const cursors: (string | null)[] = [];

  await page.route(isPostsRequest, async (route) => {
    if (route.request().method() === 'OPTIONS') {
      await fulfillNoContent(route);
      return;
    }

    const cursor = new URL(route.request().url()).searchParams.get('cursor');
    cursors.push(cursor);

    const result = resolver(cursor);
    if (typeof result === 'number') {
      await fulfillJson(route, result, { error: 'Erreur simulée' });
      return;
    }
    await fulfillJson(route, 200, result);
  });

  return { cursors };
}
