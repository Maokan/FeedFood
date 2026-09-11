import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import {
  authenticate,
  fulfillJson,
  fulfillNoContent,
  makePost,
  mockFeed,
} from '../Feed/feedTestHelpers';

/** Simule POST/DELETE /posts/post-1/like et renvoie les méthodes reçues. */
async function mockLikeRoute(
  page: Page,
  status: number,
  delayMs = 0,
): Promise<string[]> {
  const methods: string[] = [];

  await page.route(
    (url) => url.hostname === 'localhost' && url.pathname === '/posts/post-1/like',
    async (route) => {
      if (route.request().method() === 'OPTIONS') {
        await fulfillNoContent(route);
        return;
      }

      methods.push(route.request().method());
      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
      await fulfillJson(route, status, { ok: true });
    },
  );

  return methods;
}

test.describe('PostCard — like', () => {
  test('met à jour le compteur immédiatement (optimiste)', async ({ page }) => {
    await authenticate(page);
    await mockFeed(page, () => ({
      posts: [makePost({ id: 'post-1', likeCount: 10, isLiked: false })],
      nextCursor: null,
    }));
    const methods = await mockLikeRoute(page, 200, 1000);

    await page.goto('/');
    await expect(page.getByText('10 calories')).toBeVisible();

    await page.getByRole('button', { name: "J'aime" }).click();

    // L'UI réagit avant la réponse du serveur (relayée de 1 s).
    await expect(page.getByText('11 calories')).toBeVisible();
    await expect(
      page.getByRole('button', { name: "Retirer le J'aime" }),
    ).toHaveAttribute('aria-pressed', 'true');

    await expect.poll(() => methods.length).toBe(1);
    expect(methods[0]).toBe('POST');
  });

  test("annule le like si l'API échoue", async ({ page }) => {
    await authenticate(page);
    await mockFeed(page, () => ({
      posts: [makePost({ id: 'post-1', likeCount: 10, isLiked: false })],
      nextCursor: null,
    }));
    await mockLikeRoute(page, 500);

    await page.goto('/');
    await page.getByRole('button', { name: "J'aime" }).click();

    await expect(page.getByText('10 calories')).toBeVisible();
    await expect(page.getByRole('button', { name: "J'aime" })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  test('unlike : décrémente le compteur', async ({ page }) => {
    await authenticate(page);
    await mockFeed(page, () => ({
      posts: [makePost({ id: 'post-1', likeCount: 5, isLiked: true })],
      nextCursor: null,
    }));
    const methods = await mockLikeRoute(page, 200);

    await page.goto('/');
    await expect(page.getByText('5 calories')).toBeVisible();

    await page.getByRole('button', { name: "Retirer le J'aime" }).click();

    await expect(page.getByText('4 calories')).toBeVisible();
    await expect(page.getByRole('button', { name: "J'aime" })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    await expect.poll(() => methods.length).toBe(1);
    expect(methods[0]).toBe('DELETE');
  });

  test('sans image : visuel de remplacement et « Aucun commentaire »', async ({
    page,
  }) => {
    await authenticate(page);
    await mockFeed(page, () => ({
      posts: [makePost({ id: 'post-1', imageUrl: null, commentCount: 0 })],
      nextCursor: null,
    }));

    await page.goto('/');

    await expect(page.getByRole('img', { name: 'Post sans image' })).toBeVisible();
    await expect(page.getByText('Aucun commentaire')).toBeVisible();
  });
});
