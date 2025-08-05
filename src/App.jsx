// src/App.jsx

// REMOVE `BrowserRouter as Router` from this import line.
import { Routes, Route, Navigate } from 'react-router-dom'; 

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// A wrapper for routes that require authentication
function ProtectedRoute({ children }) {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory-white">
        <div className="text-orange text-xl font-poppins">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default function App() {
  return (
    // REMOVED the <Router> wrapper from here.
    // The Routes component is now the top-level element.
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={<Navigate to="/dashboard" />}
      />
    </Routes>
  );
}