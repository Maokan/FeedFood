import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "./api";
import { validateEmail, validatePassword, validateUsername } from "./validation";

const inputClass =
  "w-full rounded-full border border-bordercol bg-panellight px-4 py-2.5 text-sm text-cream outline-none placeholder:text-dimtext focus:border-brandyellow";

const submitClass =
  "w-full cursor-pointer rounded-full bg-linear-to-r from-brandred to-brandyellow px-7 py-2.5 text-sm font-extrabold text-bgdark transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70";

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
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-5 py-10">
      <div className="w-full rounded-2xl border border-bordercol bg-panel p-8">
        <div className="mb-6 text-center text-3xl font-extrabold tracking-wide">
          <span className="bg-linear-to-r from-brandred to-brandyellow bg-clip-text text-transparent">
            FeedFood
          </span>
        </div>
        <h1 className="mb-6 text-center text-xl font-bold text-cream">
          Créer un compte
        </h1>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-cream">
            Email
            <input
              className={inputClass}
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(null);
              }}
              onBlur={() => setEmailError(validateEmail(email))}
              placeholder="toi@exemple.fr"
              required
            />
            {emailError && (
              <small className="text-xs font-normal text-brandred">
                {emailError}
              </small>
            )}
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-cream">
            Nom d'utilisateur
            <input
              className={inputClass}
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setUsernameError(null);
              }}
              onBlur={() => setUsernameError(validateUsername(username))}
              placeholder="chef_cuisine"
              required
            />
            {usernameError && (
              <small className="text-xs font-normal text-brandred">
                {usernameError}
              </small>
            )}
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-cream">
            Mot de passe
            <input
              className={inputClass}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(null);
              }}
              onBlur={() => setPasswordError(validatePassword(password))}
              placeholder="8 caractères min."
              required
            />
            {passwordError && (
              <small className="text-xs font-normal text-brandred">
                {passwordError}
              </small>
            )}
          </label>

          {error && (
            <p className="m-0 text-center text-sm text-brandred">{error}</p>
          )}

          <button className={submitClass} type="submit" disabled={loading}>
            {loading ? "Création..." : "S'inscrire"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-dimtext">
          Déjà un compte ?{" "}
          <Link className="font-semibold text-brandyellow hover:underline" to="/login">
            Se connecter
          </Link>
        </p>
      </div>

      <p className="mt-4 text-sm">
        <Link className="text-dimtext hover:text-cream" to="/">
          ← Retour à l'accueil
        </Link>
      </p>
    </main>
  );
}
