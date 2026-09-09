import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
// @ts-ignore
import CreatePost from './features/posts/NewPost.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/newpost" element={<CreatePost />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)