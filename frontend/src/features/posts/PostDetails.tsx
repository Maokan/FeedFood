import { useParams } from 'react-router-dom';
import { resolveAssetUrl } from '../../api/http';
import Avatar from '../../components/Avatar';
import HashtagText from '../../components/HashtagText';
import { formatTimeAgo } from './formatTimeAgo';
import StateCard from '../../components/StateCard';
import usePost from './usePosts';
import React, { useState } from "react";
import { API_BASE_URL } from '../../api/http';
import { getValidToken } from '../auth/token';

export default function PostDetails() {
  const [content, setContent] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();
  const { post, status, errorMessage, handleRetry } = usePost(id);

  if (status === 'loading') {
    return <StateCard icon="fa-spinner" title="Chargement..." text="" />;
  }
  if (status === 'error') {
    return (
      <StateCard
        icon="fa-triangle-exclamation"
        title="Le post n'a pas pu être chargé"
        text={errorMessage || 'Une erreur est survenue'}
        actionLabel="Réessayer"
        onAction={handleRetry}
      />
    );
  }

  if (!post) return null;

  const imageUrl = resolveAssetUrl(post.imageUrl);
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setImage(file);
        setSelectedImage(URL.createObjectURL(file));
      } else {
        setImage(null);
        setSelectedImage(null);
      }
    };
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const token = getValidToken();
  if (!token) {
    console.error("No valid token found. User is not authenticated.");
    return;
  }

  console.log("Token:", token); // Debug log
  console.log("Token is valid:", token !== null);

  try {
    const response = await fetch(`${API_BASE_URL}/posts/${post.id}/comments`, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ content }),
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error data:", errorData);
      throw new Error(errorData.error || "Error creating comment");
    }

    const comment = await response.json();
    console.log("Comment posted:", comment);

    setContent("");
  } catch (error) {
    console.error("Full error:", error);
  }
};
  return (
    <article >
      <header>
        <Avatar name={post.author.username} size={38} />
        <div>
          <div>
            {post.author.username}
          </div>
          <time dateTime={post.createdAt}>
            {formatTimeAgo(post.createdAt)}
          </time>
        </div>
      </header>

      {imageUrl !== null ? (
        <img
          src={imageUrl}
          alt={`Post de ${post.author.username}`}
          loading="lazy"
        />
      ) : (
        <div
          role="img"
          aria-label="Post sans image"
        >
          <i aria-hidden="true" />
        </div>
      )}

      <div>
        <div>
          <span title="J'aime">
            <i aria-hidden="true" />
          </span>
          <span title="Commentaires">
            <i aria-hidden="true" />
          </span>
          <span title="Partager">
            <i aria-hidden="true" />
          </span>
          <span title="Enregistrer">
            <i aria-hidden="true" />
          </span>
        </div>

        <div>
          <i aria-hidden="true" />
          <span>{post.likeCount} calories</span>
        </div>

        <p>
          <strong>{post.author.username} </strong>
          <HashtagText text={post.content} />
        </p>
        <div>
          <form onSubmit={handleSubmit}>
                <label>
                  Commentaire :
                  <br/>
                  <textarea
                    placeholder="Que pensez vous de son plat ?"
                    value={content}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                    minLength={10}
                    maxLength={2000}
                    required
                  />
                </label>
                <p>{content.length}/2000 caractères</p>
                <br/>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
          
          
          
                <div>
                  {selectedImage && (
                    <img
                      src={selectedImage}
                      width={200}
                      height={200}
                      alt="Selected preview"
                    />
                  )}
                </div>
          
                <button type="submit">Post</button>
                {/* if (response.ok)
                {
                  onClose()
             } */}
              </form>
        </div>
        <div>
        <p>COMMENTAIRES</p>
      </div>
      </div>
    </article>
  );
}