import { useCallback, useEffect, useState } from 'react';
import type { FeedPost } from './postTypes';
import { getValidToken } from '../auth/token';
export type PostStatus = 'loading' | 'error' | 'success';
import { API_BASE_URL } from '../../api/http';
export async function fetchPost(id: string): Promise<FeedPost> {
  const token = getValidToken();    
  const response = await fetch(`${API_BASE_URL}/posts/${id}`, { 
    method:'GET',
    cache: 'no-store',
    headers:
    token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch post: ${response.status}`);
  }
  return response.json();
};

export default function usePost(id: string | undefined) {
  const [post, setPost] = useState<FeedPost | null>(null);
  const [status, setStatus] = useState<PostStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();
    let active = true;

    fetchPost(id)
      .then((data) => {
        if (!active) return;
        setPost(data);
        setStatus('success');
      })
      .catch((error: unknown) => {
        if (!active) return;
        setStatus('error');
        setErrorMessage(toErrorMessage(error));
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [id, reloadKey]);

  const handleRetry = useCallback(() => {
    setStatus('loading');
    setErrorMessage(null);
    setPost(null);
    setReloadKey((key) => key + 1);
  }, []);

  return { post, status, errorMessage, handleRetry };
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Une erreur inattendue est survenue.';
}