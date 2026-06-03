import { useState, useEffect } from 'react';
import { getAccessToken, setAccessToken, getAuthUrl, clearAccessToken, exchangeCodeForToken } from './spotify';
import { auth } from './firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import Login from './components/Login';
import PlaylistView from './components/PlaylistView';
import './App.css';

function App() {
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUserId(firebaseUser.uid);
        setUser(firebaseUser);
      } else {
        setUserId(null);
        setUser(null);
      }

      // Check for Spotify authorization code in URL (OAuth callback)
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        try {
          const token = await exchangeCodeForToken(code);
          setAccessToken(token);
          setSpotifyToken(token);
          window.history.replaceState({}, document.title, '/');
        } catch (error) {
          console.error('Error exchanging code for token:', error);
        }
      } else {
        const token = getAccessToken();
        if (token) {
          setSpotifyToken(token);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // User state will be set by onAuthStateChanged
    } catch (error) {
      console.error('Google sign-in error:', error);
    }
  };

  const handleSpotifyLogin = async () => {
    const authUrl = await getAuthUrl();
    window.location.href = authUrl;
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      clearAccessToken();
      setSpotifyToken(null);
      setUserId(null);
      setUser(null);
      // Clear all localStorage to ensure fresh auth
      localStorage.clear();
      // Also clear session storage
      sessionStorage.clear();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {!user ? (
        <Login onGoogleSignIn={handleGoogleSignIn} />
      ) : !spotifyToken ? (
        <Login onLogin={handleSpotifyLogin} user={user} />
      ) : (
        <PlaylistView
          userId={userId}
          user={user}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
