import { describe, expect, it } from "vitest";
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from "./validation";

describe("validation auth", () => {
  describe("validateEmail", () => {
    it("accepte une adresse valide", () => {
      expect(validateEmail("alice@example.com")).toBeNull();
    });

    it("rejette une adresse vide ou mal formée", () => {
      expect(validateEmail(" ")).toBe("L'email est requis");
      expect(validateEmail("alice@example")).toBe(
        "Veuillez saisir une adresse email valide",
      );
    });
  });

  describe("validateUsername", () => {
    it("accepte un nom d'utilisateur d'au moins 3 caractères", () => {
      expect(validateUsername("alice")).toBeNull();
    });

    it("rejette un nom vide ou trop court", () => {
      expect(validateUsername("")).toBe("Le nom d'utilisateur est requis");
      expect(validateUsername("ab")).toBe(
        "Le nom d'utilisateur doit contenir au moins 3 caractères",
      );
    });
  });

  describe("validatePassword", () => {
    it("accepte un mot de passe conforme", () => {
      expect(validatePassword("Motdepasse1!")).toBeNull();
    });

    it.each([
      ["court", "Mot1!", "Le mot de passe doit contenir au moins 8 caractères"],
      ["sans minuscule", "MOTDEPASSE1!", "Le mot de passe doit contenir au moins une minuscule"],
      ["sans majuscule", "motdepasse1!", "Le mot de passe doit contenir au moins une majuscule"],
      ["sans chiffre", "Motdepasse!", "Le mot de passe doit contenir au moins un chiffre"],
      ["sans caractère spécial", "Motdepasse1", "Le mot de passe doit contenir au moins un caractère spécial"],
    ])("rejette un mot de passe %s", (_, password, message) => {
      expect(validatePassword(password)).toBe(message);
    });
  });
});
