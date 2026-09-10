import { Link } from 'react-router-dom';
import { useState } from 'react';

import { resolveAssetUrl } from '../../api/http';
import Avatar from '../../components/Avatar';
import HashtagText from '../../components/HashtagText';
import { formatTimeAgo } from './formatTimeAgo';
import type { FeedPost } from './postTypes';
import { addPostLikes, removePostLikes } from './postLike';

interface PostCardProps {
  post: FeedPost;
}

export default function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [isToggling, setIsToggling] = useState(false);

  const imageUrl = resolveAssetUrl(post.imageUrl);

  async function handleToggleLike(): Promise<void> {
    if (isToggling) {
      return;
    }

    // Mise à jour optimiste : l'UI réagit immédiatement, puis on annule
    // si le serveur répond par une erreur.
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikeCount((count) => count + (nextLiked ? 1 : -1));
    setIsToggling(true);

    try {
      if (nextLiked) {
        await addPostLikes(post.id);
      } else {
        await removePostLikes(post.id);
      }
    } catch (error) {
      setIsLiked(!nextLiked);
      setLikeCount((count) => count + (nextLiked ? -1 : 1));
      console.error('Erreur lors du changement de like :', error);
    } finally {
      setIsToggling(false);
    }
  }

  return (
    <article className="mb-6 overflow-hidden rounded-2xl border border-bordercol bg-panel">
      <header className="flex items-center gap-3 px-4 py-3">
        <Link to={`/profile/${post.author.id}`}>
          <Avatar name={post.author.username} size={38} />
        </Link>
        <div className="min-w-0">
          <Link
            to={`/profile/${post.author.id}`}
            className="truncate text-sm font-semibold hover:underline"
          >
            {post.author.username}
          </Link>
          <time className="block text-xs text-dimtext" dateTime={post.createdAt}>
            {formatTimeAgo(post.createdAt)}
          </time>
        </div>
      </header>

      {imageUrl !== null ? (
        <img
          className="block h-[420px] w-full bg-panellight object-cover"
          src={imageUrl}
          alt={`Post de ${post.author.username}`}
          loading="lazy"
        />
      ) : (
        <div
          className="flex h-60 items-center justify-center bg-linear-to-br from-brandred/20 to-brandyellow/10 text-6xl text-brandyellow"
          role="img"
          aria-label="Post sans image"
        >
          <i className="fa-solid fa-burger" aria-hidden="true" />
        </div>
      )}

      <div className="px-4 pb-4 pt-3">
        <div className="flex items-center gap-5 text-xl text-cream">
          <button
            type="button"
            aria-pressed={isLiked}
            aria-label={isLiked ? "Retirer le J'aime" : "J'aime"}
            title={isLiked ? "Je n'aime plus" : "J'aime"}
            className="rounded-full p-2 hover:bg-brandred/20 disabled:cursor-wait disabled:opacity-60"
            onClick={() => void handleToggleLike()}
            disabled={isToggling}
          >
            <span className={isLiked ? 'text-brandred' : 'text-dimtext'}>
              <i className="fa-solid fa-fire" aria-hidden="true" />
            </span>
          </button>
          <span title="Commentaires">
            <i className="fa-regular fa-comment" aria-hidden="true" />
          </span>
          <span title="Partager">
            <i className="fa-regular fa-paper-plane" aria-hidden="true" />
          </span>
          <span className="ml-auto" title="Enregistrer">
            <i className="fa-regular fa-bookmark" aria-hidden="true" />
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm font-bold text-brandyellow">
          <i className="fa-solid fa-fire text-brandred" aria-hidden="true" />
          <span>{likeCount} calories</span>
        </div>

        <p className="mt-2 break-words text-sm leading-relaxed">
          <Link to={`/profile/${post.author.id}`} className="font-bold hover:underline">
            {post.author.username}{' '}
          </Link>
          <HashtagText text={post.content} />
        </p>

        <div className="mt-1 text-sm text-dimtext">
          {post.commentCount === 0
            ? 'Aucun commentaire'
            : `Voir les ${post.commentCount} commentaires`}
        </div>
      </div>
    </article>
  );
}
