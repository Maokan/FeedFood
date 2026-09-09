import FeedPage from './features/Feed/FeedPage';
import { Routes, Route } from 'react-router-dom';
import RegisterPage from './features/Auth/RegisterPage';
import LoginPage from './features/Auth/LoginPage';
import ProfilePage from './features/Profile/ProfilePage';
import RequireAuth from './features/Auth/RequireAuth';

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
        path="/profile"
        element={
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        }
      />
    </Routes>
  )
}

export default App;
