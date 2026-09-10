import FeedPage from './features/Feed/FeedPage';
import { Routes, Route } from 'react-router-dom';
import RegisterPage from './features/auth/RegisterPage';
import LoginPage from './features/auth/LoginPage';
import ProfilePage from './features/profile/ProfilePage';
import RequireAuth from './features/auth/RequireAuth';
import PostDetails from './features/posts/PostDetails';


function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <RequireAuth>
            <FeedPage />
          </RequireAuth>
        }
      />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/profile/:userId"
        element={
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        }
      />
      <Route path="/:id" element={<PostDetails/>} />
    </Routes>

  )
}

export default App;
