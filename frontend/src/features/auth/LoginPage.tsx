import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login } from "./api";
import { validateEmail } from "./validation";

const inputClass =
  "w-full rounded-full border border-bordercol bg-panellight px-4 py-2.5 text-sm text-cream outline-none placeholder:text-dimtext focus:border-brandyellow";

const submitClass =
  "w-full cursor-pointer rounded-full bg-linear-to-r from-brandred to-brandyellow px-7 py-2.5 text-sm font-extrabold text-bgdark transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70";

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
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-5 py-10">
      <div className="w-full rounded-2xl border border-bordercol bg-panel p-8">
        <div className="mb-6 text-center text-3xl font-extrabold tracking-wide">
          <span className="bg-linear-to-r from-brandred to-brandyellow bg-clip-text text-transparent">
            FeedFood
          </span>
        </div>
        <h1 className="mb-6 text-center text-xl font-bold text-cream">
          Connexion
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
            Mot de passe
            <input
              className={inputClass}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          {error && (
            <p className="m-0 text-center text-sm text-brandred">{error}</p>
          )}

          <button className={submitClass} type="submit" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-dimtext">
          Pas encore de compte ?{" "}
          <Link className="font-semibold text-brandyellow hover:underline" to="/register">
            Créer un compte
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
