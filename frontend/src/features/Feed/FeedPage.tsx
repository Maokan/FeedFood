import { useMemo } from 'react';
import StateCard from '../../components/StateCard';
import PostCard from '../posts/PostCard';
import AuthorsRail from './AuthorsRail';
import { computeAuthorStats } from './authorStats';
import FeedHeader from './FeedHeader';
import FeedSkeleton from './FeedSkeleton';
import FeedSidebar from './FeedSidebar';
import useFeedPosts from './useFeedPosts';
import React, { useState, useCallback } from 'react';

export default function FeedPage() {
  const feed = useFeedPosts();
  const authorStats = useMemo(
    () => computeAuthorStats(feed.posts),
    [feed.posts],
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);
const handlePostCreated = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);
  return (
    <>
      <FeedHeader onPostCreated={handlePostCreated} />
      
      <div className="mx-auto flex max-w-[1100px] items-start gap-8 px-5 py-8">
        <main className="min-w-0 flex-[2]">
          {feed.status === 'loading' && <FeedSkeleton />}

          {feed.status === 'error' && (
            <StateCard
              icon="fa-triangle-exclamation"
              title="Le fil n'a pas pu être chargé"
              text={feed.errorMessage}
              actionLabel="Réessayer"
              onAction={feed.handleRetry}
            />
          )}

          {feed.status === 'success' && feed.posts.length === 0 && (
            <StateCard
              icon="fa-bowl-food"
              title="Aucun post pour le moment"
              text="Sois le premier à publier : la page se mettra à jour dès qu'un post arrivera."
            />
          )}

          {feed.status === 'success' && feed.posts.length > 0 && (
            <>
              <AuthorsRail
                authors={authorStats.slice(0, 8).map((stat) => stat.author)}
              />

              {feed.posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}

              {feed.loadMoreError !== null && (
                <p className="text-center text-sm text-[#ff8b94]">
                  {feed.loadMoreError}
                </p>
              )}

              {feed.hasMore && (
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    className="cursor-pointer rounded-full bg-linear-to-r from-brandred to-brandyellow px-7 py-2.5 text-sm font-extrabold text-bgdark transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
                    onClick={() => void feed.handleLoadMore()}
                    disabled={feed.isLoadingMore}
                  >
                    {feed.isLoadingMore ? 'Chargement…' : 'Voir plus de posts'}
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        {feed.status === 'success' && (
          <aside className="sticky top-24 hidden flex-1 lg:block">
            <FeedSidebar authors={authorStats.slice(0, 5)} />
          </aside>
        )}
      </div>
    </>
  );
}
