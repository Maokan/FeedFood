import { beforeEach, describe, expect, it, vi } from "vitest";
import { decodeToken, getValidToken } from "./token";

function tokenWithPayload(payload: Record<string, unknown>): string {
  const encoded = btoa(JSON.stringify(payload));
  return `header.${encoded}.signature`;
}

describe("token auth", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    const values = new Map<string, string>();
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        clear: () => values.clear(),
        getItem: (key: string) => values.get(key) ?? null,
        removeItem: (key: string) => values.delete(key),
        setItem: (key: string, value: string) => values.set(key, value),
      },
    });
  });

  it("décode le payload d'un JWT", () => {
    const token = tokenWithPayload({ userId: "user-1", role: "USER", iat: 1, exp: 2 });
    expect(decodeToken(token)).toEqual({
      userId: "user-1",
      role: "USER",
      iat: 1,
      exp: 2,
    });
  });

  it("renvoie null pour un token invalide", () => {
    expect(decodeToken("invalid-token")).toBeNull();
  });

  it("retourne le token valide du localStorage", () => {
    const token = tokenWithPayload({ userId: "user-1", role: "USER", iat: 1, exp: 2 });
    localStorage.setItem("token", token);
    vi.spyOn(Date, "now").mockReturnValue(1_500);

    expect(getValidToken()).toBe(token);
  });

  it("supprime un token expiré", () => {
    const token = tokenWithPayload({ userId: "user-1", role: "USER", iat: 1, exp: 2 });
    localStorage.setItem("token", token);
    vi.spyOn(Date, "now").mockReturnValue(2_000);

    expect(getValidToken()).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
  });
});
