import React, { useState } from "react";
export default function NewPost() {
  const [content, setContent] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // const [id, setId] = useState<string | null>(null);
  // const [authorId, setAuthorId] = useState<string | null>(null);
  const id = "temp-id-123";
  const authorId = "temp-author-456";
  const getToken = (): string | null => {
    return localStorage.getItem("token"); // or "jwtToken", depending on your key
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const token = getToken();
    if (!token) {
      console.error("No token found. User may not be authenticated.");
      return;
    }
    const postData = new FormData();
    postData.append("content", content);
    postData.append("id", id);
    postData.append("authorId", authorId);

    if (image) {
      postData.append("image", image);
    }

    try {
      const response = await fetch("http://localhost:3000/posts", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`},
        body: postData,
      });

      if (!response.ok) {
        throw new Error("erreur de création du post");
      }

      const post = await response.json();

      console.log("le post a été crée ! :", post);

      // Reset form
      setContent("");
      setImage(null);
      setSelectedImage(null);
    } catch (error) {
      console.error(error);
    }
  };

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

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Contenu du post :
        <br/>
        <textarea
          placeholder="Qu'avez-vous à manger ?"
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
  );
}