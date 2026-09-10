import { Link, useNavigate } from "react-router-dom";
import Avatar from "../../components/Avatar";
import { useAuth } from "../auth/useAuth";

export default function ProfilePage() {
  const { payload, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const username = payload?.userId ?? "utilisateur";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-5 py-10">
      <div className="w-full rounded-2xl border border-bordercol bg-panel p-8">
        <div className="mb-6 flex flex-col items-center gap-3">
          <Avatar name={username} size={72} />
          <h1 className="m-0 text-xl font-bold text-cream">Mon profil</h1>
        </div>

        <p className="m-0 text-center text-sm text-dimtext">
          Cette page n'est accessible qu'aux utilisateurs connectés.
        </p>

        {payload && (
          <dl className="mt-6 flex flex-col gap-3 rounded-xl border border-bordercol bg-panellight p-4">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-dimtext">
                Identifiant
              </dt>
              <dd className="m-0 break-all text-sm text-cream">
                {payload.userId}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-dimtext">
                Rôle
              </dt>
              <dd className="m-0 text-sm text-cream">{payload.role}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-dimtext">
                Session expire à
              </dt>
              <dd className="m-0 text-sm text-cream">
                {new Date(payload.exp * 1000).toLocaleTimeString()}
              </dd>
            </div>
          </dl>
        )}

        <button
          className="mt-6 w-full cursor-pointer rounded-full border border-brandred px-6 py-2.5 text-sm font-bold text-brandred transition-colors hover:bg-brandred/10"
          type="button"
          onClick={handleLogout}
        >
          Se déconnecter
        </button>
      </div>

      <p className="mt-4 text-sm">
        <Link className="text-dimtext hover:text-cream" to="/">
          ← Retour à l'accueil
        </Link>
      </p>
    </main>
  );
}
