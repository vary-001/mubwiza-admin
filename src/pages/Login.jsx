// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faLock, faSpinner } from '@fortawesome/free-solid-svg-icons'

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // State to handle loading feedback
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true); // --- Start loading state
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password. Please try again.');
      } else {
        setError('An error occurred. Please try again later.');
      }
      console.error("Firebase login error:", err);
    } finally {
      setIsLoading(false); // --- Stop loading state, regardless of outcome
    }
  };

  return (
    // Main container with a branded gradient background
    <div className="min-h-screen flex items-center justify-center bg-hero-gradient font-poppins px-4">
      
      {/* Centered Login Board */}
      <div className="w-full max-w-md p-6 md:p-10 space-y-6 bg-ivory-white rounded-2xl shadow-2xl border-t-4 border-orange">
        
        {/* --- Logo Placeholder --- */}
        <div className="flex justify-center">
          {/* To add a logo, uncomment the img tag and replace the src */}
          { <img src="./public/logo-mubwiza.png" alt="Mubwiza-Eden Logo" className="w-32 mx-auto" /> }
          {/* If you don't have a logo, you can use a text-based one: */}
           <h1 className="text-3xl font-bold text-mahogany">mubwiza<span className="text-orange">.</span>eden</h1>
        </div>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold text-charcoal">Admin Panel</h2>
          <p className="mt-1 text-gray-500">Welcome back! Please sign in.</p>
        </div>
        
        <form className="space-y-6" onSubmit={handleLogin}>
          {/* Email Input */}
          <div className="relative">
            <FontAwesomeIcon icon={faUser} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full border border-sand focus:outline-none focus:ring-2 focus:ring-orange shadow-sm transition-all"
              required
              disabled={isLoading}
            />
          </div>
          
          {/* Password Input */}
          <div className="relative">
            <FontAwesomeIcon icon={faLock} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full border border-sand focus:outline-none focus:ring-2 focus:ring-orange shadow-sm transition-all"
              required
              disabled={isLoading}
            />
          </div>
          
          {/* Error Display */}
          {error && (
            <p className="text-red-600 text-sm text-center bg-red-100 p-3 rounded-lg">
              {error}
            </p>
          )}
          
          {/* Login Button with Loading State */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center bg-gradient-to-r from-orange to-amber text-white font-bold py-3 px-4 rounded-full
                         hover:shadow-lg hover:shadow-orange/40
                         transition-all duration-300
                         disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                  <span>Signing In...</span>
                </>
              ) : (
                'Log In'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}