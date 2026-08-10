import { Link, Route, Routes } from 'react-router-dom'

import Navbar from './components/Navbar'
import ArticleDetail from './pages/ArticleDetail'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'

function NotFound() {
  return (
    <div className="page page--narrow center">
      <h1>הדף לא נמצא</h1>
      <Link to="/" className="btn">
        חזרה לעמוד הראשי
      </Link>
    </div>
  )
}

export default function App() {
  return (
    <>
      <Navbar />

      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/articles/:id" element={<ArticleDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="footer">פרויקט גמר — מערכת בלוג מבוססת Django REST</footer>
    </>
  )
}
