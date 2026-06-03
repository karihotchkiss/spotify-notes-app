import { useState, useEffect } from 'react';
import { getAccessToken, setAccessToken, getAuthUrl, clearAccessToken, exchangeCodeForToken } from './spotify';
import { auth } from './firebase';
import { signInAnonymously } from 'firebase/auth';
import Login from './components/Login';
import PlaylistView from './components/PlaylistView';
import './App.css';

function App() {
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuth = async () => {
      // Sign in to Firebase anonymously
      try {
        const userCredential = await signInAnonymously(auth);
        setUserId(userCredential.user.uid);
      } catch (error) {
        console.error('Firebase auth error:', error);
      }

      // Check for authorization code in URL (OAuth callback)
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
    };

    handleAuth();
  }, []);

  const handleLogin = async () => {
    const authUrl = await getAuthUrl();
    window.location.href = authUrl;
  };

  const handleLogout = () => {
    clearAccessToken();
    setSpotifyToken(null);
    // Clear all localStorage to ensure fresh auth
    localStorage.clear();
    // Also clear session storage
    sessionStorage.clear();
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
      {!spotifyToken ? (
        <Login onLogin={handleLogin} />
      ) : (
        <PlaylistView
          userId={userId}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
