/**
 * Formes des données renvoyées par le backend pour le fil de posts.
 * `createdAt` est une chaîne ISO 8601 (ex: "2026-03-02T10:15:30.000Z").
 */
export interface FeedAuthor {
  id: string;
  username: string;
}

export interface FeedPost {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  author: FeedAuthor;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
}

export interface FeedPage {
  posts: FeedPost[];
  nextCursor: string | null;
}
