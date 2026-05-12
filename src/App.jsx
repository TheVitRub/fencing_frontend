import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import Home from './pages/Home'
import Events from './pages/Events'
import Plans from './pages/Plans'
import Honor from './pages/Honor'
import Achievements from './pages/Achievements'
import Founder from './pages/Founder'
import AdminLogin from './pages/AdminLogin'
import Admin from './pages/Admin'

function ProtectedRoute({ children }) {
  const { isAdmin } = useAuth()
  return isAdmin ? children : <Navigate to="/login" replace />
}

function Layout() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/honor" element={<Honor />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/founder" element={<Founder />} />
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Layout />
    </AuthProvider>
  )
}
