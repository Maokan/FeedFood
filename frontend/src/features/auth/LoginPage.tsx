import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login } from "./api";
import { validateEmail } from "./validation";
import "./LoginPage.css";
import "./auth-shared.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Page demandée avant la redirection vers /login (si fournie)
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const emailErr = validateEmail(email);
    setEmailError(emailErr);

    if (emailErr || !password) {
      return;
    }

    setLoading(true);

    try {
      const data = await login({ email, password });

      // Le backend renvoie 200 même en cas d'erreur (ex: identifiants invalides)
      if (data.error || !data.token) {
        setError(data.error ?? "Connexion impossible");
        return;
      }

      localStorage.setItem("token", data.token);
      navigate(from, { replace: true });
    } catch {
      setError("Erreur réseau, veuillez réessayer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <h1>Connexion</h1>
      <form className="login-form" onSubmit={handleSubmit} noValidate>
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
          Mot de passe
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="login-error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
      <p>
        Pas encore de compte ? <Link to="/register">Créer un compte</Link>
      </p>
      <p>
        <Link to="/">← Retour à l'accueil</Link>
      </p>
    </main>
  );
}
