import { useState, useEffect, useCallback } from 'react';
import type { Comment } from './commentTypes';

export type CommentStatus = 'loading' | 'error' | 'success';

interface UsePostCommentsReturn {
  comments: Comment[];
  status: CommentStatus;
  errorMessage: string | null;
  handleRetry: () => void;
}

export default function usePostComments(postId: string | undefined): UsePostCommentsReturn {
  const [comments, setComments] = useState<Comment[]>([]);
  const [status, setStatus] = useState<CommentStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const fetchComments = useCallback(async () => {
    if (!postId) return;

    try {
      setStatus('loading');
      const response = await fetch(`/api/posts/${postId}/comments`);

      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.status}`);
      }

      const data: Comment[] = await response.json();
      setComments(data);
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
    }
  }, [postId, reloadKey]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleRetry = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  return { comments, status, errorMessage, handleRetry };
}