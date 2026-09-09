import { useCallback, useEffect, useState } from 'react';
import type { FeedPost } from '../posts/postTypes';
import { fetchFeedPage } from './feedApi';

export type FeedStatus = 'loading' | 'error' | 'success';

/**
 * Cycle de vie du fil : charge la première page puis les suivantes,
 * en gardant les posts déjà affichés (aucun clignotement au "Voir plus").
 */
export default function useFeedPosts() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [status, setStatus] = useState<FeedStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  // Charge la première page au montage, et après chaque clic sur "Réessayer"
  // (l'état repasse à "loading" dans handleRetry, pas ici).
  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    fetchFeedPage(null, controller.signal)
      .then((page) => {
        if (!active) {
          return;
        }
        setPosts(page.posts);
        setNextCursor(page.nextCursor);
        setStatus('success');
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }
        setStatus('error');
        setErrorMessage(toErrorMessage(error));
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [reloadKey]);

  const handleRetry = useCallback(() => {
    setStatus('loading');
    setErrorMessage(null);
    setPosts([]);
    setNextCursor(null);
    setReloadKey((key) => key + 1);
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (nextCursor === null || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    setLoadMoreError(null);
    try {
      const page = await fetchFeedPage(nextCursor);
      setPosts((current) => [...current, ...page.posts]);
      setNextCursor(page.nextCursor);
    } catch (error) {
      setLoadMoreError(toErrorMessage(error));
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextCursor, isLoadingMore]);

  return {
    posts,
    status,
    errorMessage,
    hasMore: nextCursor !== null,
    isLoadingMore,
    loadMoreError,
    handleRetry,
    handleLoadMore,
  };
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Une erreur inattendue est survenue.';
}
