import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Avatar from "../../components/Avatar";
import StateCard from "../../components/StateCard";
import FeedHeader from "../Feed/FeedHeader";
import PostCard from "../posts/PostCard";
import type { FeedPost } from "../posts/postTypes";
import { useAuth } from "../auth/useAuth";
import { fetchUserPosts, fetchUserProfile } from "./api";
import type { ProfileUser } from "./api";

type Status = "loading" | "error" | "success";

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { payload, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [status, setStatus] = useState<Status>("loading");

  const isOwnProfile = payload?.userId === userId;

  useEffect(() => {
    if (!userId) {
      return;
    }
    let active = true;

    (async () => {
      setStatus("loading");
      try {
        const [user, userPosts] = await Promise.all([
          fetchUserProfile(userId),
          fetchUserPosts(userId),
        ]);
        if (!active) return;
        if (!user) {
          setStatus("error");
          return;
        }
        setProfile(user);
        setPosts(userPosts);
        setStatus("success");
      } catch {
        if (active) setStatus("error");
      }
    })();

    return () => {
      active = false;
    };
  }, [userId]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <>
      <FeedHeader />

      <div className="mx-auto max-w-[640px] px-5 py-8">
        {status === "loading" && (
          <p className="text-center text-sm text-dimtext">Chargement du profil...</p>
        )}

        {status === "error" && (
          <StateCard
            icon="fa-triangle-exclamation"
            title="Profil introuvable"
            text="Cet utilisateur n'existe pas ou plus."
          />
        )}

        {status === "success" && profile && (
          <>
            <div className="mb-8 flex flex-col items-center gap-3 rounded-2xl border border-bordercol bg-panel p-8">
              <Avatar name={profile.username} size={72} />
              <h1 className="m-0 text-xl font-bold text-cream">
                {isOwnProfile ? "Mon profil" : profile.username}
              </h1>
              <p className="m-0 text-xs text-dimtext">
                Membre depuis {new Date(profile.createdAt).toLocaleDateString()}
              </p>

              <dl className="mt-4 grid w-full grid-cols-1 gap-3 rounded-xl border border-bordercol bg-panellight p-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-dimtext">
                    Nom d'utilisateur
                  </dt>
                  <dd className="m-0 break-all text-sm text-cream">
                    {profile.username}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-dimtext">
                    Rôle
                  </dt>
                  <dd className="m-0 text-sm text-cream">{profile.role}</dd>
                </div>
                {/* Email : information privée, uniquement visible sur son propre profil */}
                {isOwnProfile && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-dimtext">
                      Email
                    </dt>
                    <dd className="m-0 break-all text-sm text-cream">
                      {profile.email}
                    </dd>
                  </div>
                )}
              </dl>

              {isOwnProfile && (
                <button
                  className="mt-2 w-full cursor-pointer rounded-full border border-brandred px-6 py-2.5 text-sm font-bold text-brandred transition-colors hover:bg-brandred/10"
                  type="button"
                  onClick={handleLogout}
                >
                  Se déconnecter
                </button>
              )}
            </div>

            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-dimtext">
              {isOwnProfile ? "Mes posts" : `Posts de ${profile.username}`}
            </h2>

            {posts.length === 0 ? (
              <StateCard
                icon="fa-bowl-food"
                title="Aucun post"
                text={
                  isOwnProfile
                    ? "Tu n'as encore rien publié."
                    : "Cet utilisateur n'a encore rien publié."
                }
              />
            ) : (
              posts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </>
        )}
      </div>

      <p className="pb-8 text-center text-sm">
        <Link className="text-dimtext hover:text-cream" to="/">
          ← Retour à l'accueil
        </Link>
      </p>
    </>
  );
}
