export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
    email: string;
  };
}