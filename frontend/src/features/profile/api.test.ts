import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchUserPosts, fetchUserProfile } from "./api";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("profile api", () => {
  it("récupère un profil utilisateur", async () => {
    const profile = {
      id: "user-1",
      email: "alice@example.com",
      username: "alice",
      role: "USER",
      createdAt: "2026-09-10T10:00:00.000Z",
    };
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(profile), { status: 200 }),
    );

    await expect(fetchUserProfile("user-1")).resolves.toEqual(profile);
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3000/users/user-1");
  });

  it("renvoie null si le profil est introuvable", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("Not found", { status: 404 }),
    );

    await expect(fetchUserProfile("missing")).resolves.toBeNull();
  });

  it("récupère les posts d'un utilisateur", async () => {
    const posts = [
      {
        id: "post-1",
        content: "Une recette",
        imageUrl: null,
        createdAt: "2026-09-10T10:00:00.000Z",
        author: { id: "user-1", username: "alice" },
        likeCount: 2,
        commentCount: 1,
      },
    ];
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(posts), { status: 200 }),
    );

    await expect(fetchUserPosts("user-1")).resolves.toEqual(posts);
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3000/users/user-1/posts");
  });

  it("renvoie une liste vide si les posts ne peuvent pas être chargés", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("Server error", { status: 500 }),
    );

    await expect(fetchUserPosts("user-1")).resolves.toEqual([]);
  });
});
