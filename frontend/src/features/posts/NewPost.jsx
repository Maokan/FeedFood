import { useState } from "react";

export default function CreatePost() {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
//   const [id, setId] = useState(null);
//   const [authorId, setAuthorId] = useState(null);
 const id = "temp-id-123";
  const authorId = "temp-author-456";

  const handleSubmit = async (e) => {
    e.preventDefault();

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
    } catch (error) {
      console.error(error);
    }
  };

  return (    
    <form onSubmit={handleSubmit}>
        <label>Contenu du post :    
            <textarea
                placeholder="Qu'avez-vous à manger ?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
        </label>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
        const file = e.target.files?.[0]; 
        setSelectedImage(file ? URL.createObjectURL(file) : undefined);
        }}
      />
      <p>{content.length}/2000 caractères</p>
      <div>
      {selectedImage && (
        <img
            src={selectedImage}
            width={200}
            height={200}
            alt="Selected avatar"
            minLength={10}
            maxLength={2000}
            required
        />

      )}
      </div>
      <button type="submit">
        Post
      </button>
    </form>
     );
}