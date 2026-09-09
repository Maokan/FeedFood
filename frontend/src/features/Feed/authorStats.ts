import type { FeedAuthor, FeedPost } from '../posts/postTypes';

export interface AuthorStat {
  author: FeedAuthor;
  postCount: number;
}

export function computeAuthorStats(posts: FeedPost[]): AuthorStat[] {
  const byAuthor = new Map<string, AuthorStat>();

  for (const post of posts) {
    const current = byAuthor.get(post.author.id);
    if (current === undefined) {
      byAuthor.set(post.author.id, { author: post.author, postCount: 1 });
    } else {
      current.postCount += 1;
    }
  }

  return [...byAuthor.values()].sort(
    (a, b) =>
      b.postCount - a.postCount ||
      a.author.username.localeCompare(b.author.username),
  );
}
