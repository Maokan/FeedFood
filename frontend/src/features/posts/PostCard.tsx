import { resolveAssetUrl } from '../../api/http';
import Avatar from '../../components/Avatar';
import HashtagText from '../../components/HashtagText';
import { formatTimeAgo } from './formatTimeAgo';
import type { FeedPost } from './postTypes';
import { addPostLikes, removePostLikes } from './postLike';

interface PostCardProps {
  post: FeedPost;
}

export async function handleLike(postId: string, isLiked: boolean): Promise<void> {
  try {
    if (isLiked) {
      await removePostLikes(postId );
    } else {
      await addPostLikes(postId);
    }
  } catch (error) {
    console.error('Error handling like:', error);
  }
}


export default function PostCard({ post }: PostCardProps) {
  const imageUrl = resolveAssetUrl(post.imageUrl);

  return (
    <article className="mb-6 overflow-hidden rounded-2xl border border-bordercol bg-panel">
      <header className="flex items-center gap-3 px-4 py-3">
        <Avatar name={post.author.username} size={38} />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">
            {post.author.username}
          </div>
          <time className="text-xs text-dimtext" dateTime={post.createdAt}>
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
            className="rounded-full p-2 hover:bg-brandred/20"
            onClick={() => {
              void handleLike(post.id, post.isLiked);
            }}
          >
            <span className="text-brandred" title="J'aime">
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
          <span>{post.likeCount} calories</span>
        </div>

        <p className="mt-2 break-words text-sm leading-relaxed">
          <strong>{post.author.username} </strong>
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
