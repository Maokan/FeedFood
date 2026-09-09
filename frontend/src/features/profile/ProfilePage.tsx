import { Link } from "react-router-dom";
import { decodeToken, getValidToken } from "../auth/token";
import "./ProfilePage.css";

export default function ProfilePage() {
  const token = getValidToken();
  const payload = token ? decodeToken(token) : null;

  return (
    <main className="profile-page">
      <h1>Mon profil</h1>
      <p>Cette page n'est accessible qu'aux utilisateurs connectés.</p>
      {payload && (
        <dl className="profile-details">
          <dt>Identifiant</dt>
          <dd>{payload.userId}</dd>
          <dt>Rôle</dt>
          <dd>{payload.role}</dd>
          <dt>Session expire à</dt>
          <dd>{new Date(payload.exp * 1000).toLocaleTimeString()}</dd>
        </dl>
      )}
      <p>
        <Link to="/">← Retour à l'accueil</Link>
      </p>
    </main>
  );
}
