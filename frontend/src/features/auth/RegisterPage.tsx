import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "./api";
import { validateEmail, validatePassword, validateUsername } from "./validation";
import "./RegisterPage.css";
import "./auth-shared.css";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const emailErr = validateEmail(email);
    const usernameErr = validateUsername(username);
    const passwordErr = validatePassword(password);
    setEmailError(emailErr);
    setUsernameError(usernameErr);
    setPasswordError(passwordErr);

    if (emailErr || usernameErr || passwordErr) {
      return;
    }

    setLoading(true);

    try {
      const data = await register({ email, username, password });

      // Le backend renvoie 200 même en cas d'erreur (ex: email déjà utilisé)
      if (data.error) {
        setError(data.error);
        return;
      }

      // Pas de connexion automatique : on redirige vers la page de connexion
      navigate("/login");
    } catch {
      setError("Erreur réseau, veuillez réessayer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="register-page">
      <h1>Créer un compte</h1>
      <form className="register-form" onSubmit={handleSubmit} noValidate>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError(null);
            }}
            onBlur={() => setEmailError(validateEmail(email))}
            required
          />
          {emailError && <small className="field-error">{emailError}</small>}
        </label>
        <label>
          Nom d'utilisateur
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setUsernameError(null);
            }}
            onBlur={() => setUsernameError(validateUsername(username))}
            required
          />
          {usernameError && (
            <small className="field-error">{usernameError}</small>
          )}
        </label>
        <label>
          Mot de passe
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError(null);
            }}
            onBlur={() => setPasswordError(validatePassword(password))}
            required
          />
          {passwordError && (
            <small className="field-error">{passwordError}</small>
          )}
        </label>
        {error && <p className="register-error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Création..." : "S'inscrire"}
        </button>
      </form>
      <p>
        Déjà un compte ? <Link to="/login">Se connecter</Link>
      </p>
      <p>
        <Link to="/">← Retour à l'accueil</Link>
      </p>
    </main>
  );
}
