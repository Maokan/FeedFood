import { API_BASE_URL } from '../../api/http';


export async function addPostLikes(postId: string, userId: string): Promise<string[]> {  
    const isLiked = await getPostLikes(postId);

    if (isLiked.includes(userId)) {
      return isLiked;
    }
    
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    },
    body: JSON.stringify({ postId, userId }),
  });
  const data = await response.json();
  return data;
}

export async function getPostLikes(postId: string): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    },
  });
  const data = await response.json();
  return data;
}



export async function removePostLikes(postId: string, userId: string): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    },
    body: JSON.stringify({ postId, userId }),
  });
  const data = await response.json();
  return data;
}