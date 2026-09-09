import Avatar from '../../components/Avatar';
import type { FeedAuthor } from '../posts/postTypes';

interface AuthorsRailProps {
  authors: FeedAuthor[];
}

export default function AuthorsRail({ authors }: AuthorsRailProps) {
  if (authors.length === 0) {
    return null;
  }

  return (
    <div
      className="mb-6 flex gap-4 overflow-x-auto rounded-2xl border border-bordercol bg-panel p-4"
      aria-label="Auteurs du fil"
    >
      {authors.map((author) => (
        <div key={author.id} className="flex min-w-[70px] flex-col items-center gap-1">
          <span className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-linear-to-br from-brandyellow to-brandred p-[3px]">
            <Avatar name={author.username} size={54} />
          </span>
          <span className="max-w-[74px] truncate text-xs text-dimtext">
            {author.username}
          </span>
        </div>
      ))}
    </div>
  );
}
