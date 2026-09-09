// Validations côté front pour les formulaires d'authentification.

// Format d'adresse email standard
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  if (!email.trim()) {
    return "L'email est requis";
  }
  if (!EMAIL_REGEX.test(email)) {
    return "Veuillez saisir une adresse email valide";
  }
  return null;
}

export function validateUsername(username: string): string | null {
  if (!username.trim()) {
    return "Le nom d'utilisateur est requis";
  }
  if (username.trim().length < 3) {
    return "Le nom d'utilisateur doit contenir au moins 3 caractères";
  }
  return null;
}

// Mot de passe : 8 caractères minimum, au moins 1 minuscule,
// 1 majuscule, 1 chiffre et 1 caractère spécial
export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Le mot de passe doit contenir au moins 8 caractères";
  }
  if (!/[a-z]/.test(password)) {
    return "Le mot de passe doit contenir au moins une minuscule";
  }
  if (!/[A-Z]/.test(password)) {
    return "Le mot de passe doit contenir au moins une majuscule";
  }
  if (!/[0-9]/.test(password)) {
    return "Le mot de passe doit contenir au moins un chiffre";
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Le mot de passe doit contenir au moins un caractère spécial";
  }
  return null;
}
