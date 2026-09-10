import { Link } from 'react-router-dom';
import Avatar from '../../components/Avatar';
import type { AuthorStat } from './authorStats';

interface FeedSidebarProps {
  authors: AuthorStat[];
}

export default function FeedSidebar({ authors }: FeedSidebarProps) {
  return (
    <div>
      <section className="rounded-2xl border border-bordercol bg-panel p-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-dimtext">
          Top auteurs du moment
        </h2>

        {authors.length === 0 ? (
          <p className="m-0 text-sm text-dimtext">Pas encore d'auteurs.</p>
        ) : (
          authors.map(({ author, postCount }) => (
            <Link
              key={author.id}
              to={`/profile/${author.id}`}
              className="flex items-center gap-3 py-2 hover:opacity-80"
            >
              <Avatar name={author.username} size={34} />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">
                  {author.username}
                </div>
                <div className="text-xs text-dimtext">
                  {postCount} {postCount > 1 ? 'posts' : 'post'}
                </div>
              </div>
            </Link>
          ))
        )}
      </section>

      <p className="mt-5 text-center text-xs text-dimtext">
        FeedFood © 2026 — Manger plus, ensemble.
      </p>
    </div>
  );
}
