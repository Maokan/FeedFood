import { afterEach, describe, expect, it, vi } from "vitest";
import { login, register } from "./api";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("auth api", () => {
  it("envoie les données d'inscription à la route register", async () => {
    const response = { token: "jwt", user: { id: "1", email: "a@b.com", username: "alice" } };
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(response), { status: 200 }),
    );

    await expect(register({ email: "a@b.com", username: "alice", password: "Secret1!" })).resolves.toEqual(response);
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "a@b.com", username: "alice", password: "Secret1!" }),
    });
  });

  it("envoie les identifiants à la route login", async () => {
    const response = { token: "jwt" };
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(response), { status: 200 }),
    );

    await expect(login({ email: "a@b.com", password: "Secret1!" })).resolves.toEqual(response);
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "a@b.com", password: "Secret1!" }),
    });
  });
});
