import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Chatbot from './components/chatbot/Chatbot';
import Home from './pages/Home';
import Companies from './pages/Companies';
import CompanyPage from './pages/CompanyPage';
import PostDetail from './pages/PostDetail';
import MyPosts from './pages/MyPosts';
import Admin from './pages/Admin';
import EditPost from './pages/EditPost';
import Profile from './pages/Profile';
import { Login, Register } from './pages/Auth';

// Protected route wrapper
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><span className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const AppContent = () => {
  const [chatbotOpen, setChatbotOpen] = useState(false);

  return (
    <>
      <Navbar onOpenChatbot={() => setChatbotOpen(true)} />

      <Routes>
        <Route path="/" element={<Home onOpenChatbot={() => setChatbotOpen(true)} />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/companies/:slug" element={<CompanyPage />} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/my-posts" element={
          <ProtectedRoute>
            <MyPosts onOpenChatbot={() => setChatbotOpen(true)} />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute roles={['admin', 'tpo', 'principal']}>
            <Admin />
          </ProtectedRoute>
        } />

        <Route path="/posts/:id/edit" element={
          <ProtectedRoute>
            <EditPost />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        <Route path="*" element={
          <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text3)' }}>
            <h2>404 – Page not found</h2>
            <a href="/" style={{ color: 'var(--accent2)', marginTop: 12, display: 'block' }}>Go Home</a>
          </div>
        } />
      </Routes>

      <Chatbot isOpen={chatbotOpen} onClose={() => setChatbotOpen(false)} />
    </>
  );
};

const App = () => (
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--border2)',
            fontSize: '0.875rem',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: 'transparent' } },
          error: { iconTheme: { primary: '#ef4444', secondary: 'transparent' } },
        }}
      />
      <AppContent />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
