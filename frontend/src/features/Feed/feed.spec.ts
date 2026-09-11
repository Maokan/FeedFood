import { expect, test } from '@playwright/test';
import {
  authenticate,
  fulfillJson,
  fulfillNoContent,
  isPostsRequest,
  makePost,
  mockFeed,
} from './feedTestHelpers';

test.describe('Feed (user story S3)', () => {
  test('affiche auteur, contenu, image et date du post', async ({ page }) => {
    await authenticate(page);
    const createdAt = new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString();

    await mockFeed(page, () => ({
      posts: [
        makePost({
          author: { id: 'u1', username: 'alice' },
          content: 'Objectif de la semaine #PriseDeMasse',
          imageUrl: '/seed-images/img-01.jpg',
          createdAt,
          likeCount: 842,
          commentCount: 24,
        }),
      ],
      nextCursor: null,
    }));

    await page.goto('/');

    await expect(page.getByRole('link', { name: 'alice' }).first()).toBeVisible();
    await expect(page.getByText('#PriseDeMasse')).toBeVisible();
    await expect(page.locator('img[alt="Post de alice"]')).toHaveAttribute(
      'src',
      'http://localhost:3000/seed-images/img-01.jpg',
    );
    await expect(page.locator('time')).toHaveText('il y a 2 h');
    await expect(page.getByText('842 calories')).toBeVisible();
    await expect(page.getByText('Voir les 24 commentaires')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Voir plus de posts' }),
    ).toBeHidden();
  });

  test('« Voir plus » ajoute la page suivante sans vider la liste', async ({
    page,
  }) => {
    await authenticate(page);
    const { cursors } = await mockFeed(page, (cursor) =>
      cursor === null
        ? {
            posts: [makePost({ id: 'p1', content: 'Premier post' })],
            nextCursor: 'cursor-1',
          }
        : {
            posts: [
              makePost({
                id: 'p2',
                content: 'Deuxième post',
                author: { id: 'u2', username: 'bob' },
              }),
            ],
            nextCursor: null,
          },
    );

    await page.goto('/');
    await expect(page.getByText('Premier post')).toBeVisible();

    await page.getByRole('button', { name: 'Voir plus de posts' }).click();

    await expect(page.getByText('Deuxième post')).toBeVisible();
    // La page précédente reste affichée : la liste n'est jamais vidée.
    await expect(page.getByText('Premier post')).toBeVisible();
    // Le curseur renvoyé par l'API a bien été transmis à la requête suivante.
    expect(cursors).toContain('cursor-1');
    await expect(
      page.getByRole('button', { name: 'Voir plus de posts' }),
    ).toBeHidden();
  });

  test('la liste reste affichée pendant le chargement de la page suivante', async ({
    page,
  }) => {
    await authenticate(page);
    await page.route(isPostsRequest, async (route) => {
      if (route.request().method() === 'OPTIONS') {
        await fulfillNoContent(route);
        return;
      }
      const cursor = new URL(route.request().url()).searchParams.get('cursor');
      if (cursor === null) {
        await fulfillJson(route, 200, {
          posts: [makePost({ id: 'p1', content: 'Premier post' })],
          nextCursor: 'cursor-1',
        });
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await fulfillJson(route, 200, {
        posts: [makePost({ id: 'p2', content: 'Deuxième post' })],
        nextCursor: null,
      });
    });

    await page.goto('/');
    await expect(page.getByText('Premier post')).toBeVisible();

    await page.getByRole('button', { name: 'Voir plus de posts' }).click();

    await expect(page.getByRole('button', { name: 'Chargement…' })).toBeDisabled();
    await expect(page.getByText('Premier post')).toBeVisible();
    await expect(page.locator('.animate-pulse')).toHaveCount(0);

    await expect(page.getByText('Deuxième post')).toBeVisible();
  });

  test('affiche un squelette puis l’état vide quand le fil est vide', async ({
    page,
  }) => {
    await authenticate(page);
    await page.route(isPostsRequest, async (route) => {
      if (route.request().method() === 'OPTIONS') {
        await fulfillNoContent(route);
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 800));
      await fulfillJson(route, 200, { posts: [], nextCursor: null });
    });

    await page.goto('/');

    await expect(page.locator('.animate-pulse').first()).toBeVisible();
    await expect(page.getByText('Aucun post pour le moment')).toBeVisible();
  });

  test('affiche une erreur, puis recharge après « Réessayer »', async ({ page }) => {
    await authenticate(page);
    let failing = true;
    await mockFeed(page, () =>
      failing
        ? 500
        : {
            posts: [makePost({ id: 'p1', content: 'De retour sur le fil' })],
            nextCursor: null,
          },
    );

    await page.goto('/');
    await expect(page.getByText("Le fil n'a pas pu être chargé")).toBeVisible();
    await expect(
      page.getByText('Le serveur a répondu avec une erreur (500).'),
    ).toBeVisible();

    failing = false;
    await page.getByRole('button', { name: 'Réessayer' }).click();

    await expect(page.getByText('De retour sur le fil')).toBeVisible();
    await expect(page.getByText("Le fil n'a pas pu être chargé")).toBeHidden();
  });

  test('une erreur sur la page suivante laisse la liste intacte', async ({
    page,
  }) => {
    await authenticate(page);
    await mockFeed(page, (cursor) =>
      cursor === null
        ? {
            posts: [makePost({ id: 'p1', content: 'Premier post' })],
            nextCursor: 'cursor-1',
          }
        : 500,
    );

    await page.goto('/');
    await page.getByRole('button', { name: 'Voir plus de posts' }).click();

    await expect(
      page.getByText('Le serveur a répondu avec une erreur (500).'),
    ).toBeVisible();
    await expect(page.getByText('Premier post')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Voir plus de posts' }),
    ).toBeVisible();
  });
});
