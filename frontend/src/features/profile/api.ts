import { API_BASE_URL } from "../../api/http";
import type { FeedPost } from "../posts/postTypes";

export interface ProfileUser {
  id: string;
  email: string;
  username: string;
  role: string;
  createdAt: string;
}

export async function fetchUserProfile(userId: string): Promise<ProfileUser | null> {
  const res = await fetch(`${API_BASE_URL}/users/${userId}`);
  if (!res.ok) {
    return null;
  }
  const user = await res.json();
  return user ?? null;
}

export async function fetchUserPosts(userId: string): Promise<FeedPost[]> {
  const res = await fetch(`${API_BASE_URL}/users/${userId}/posts`);
  if (!res.ok) {
    return [];
  }
  return res.json();
}
