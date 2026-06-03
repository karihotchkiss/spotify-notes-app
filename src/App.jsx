import { useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { getAccessToken, setAccessToken, getAuthUrl, clearAccessToken } from './spotify';
import Login from './components/Login';
import PlaylistView from './components/PlaylistView';
import './App.css';

function App() {
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for Spotify token in URL hash (OAuth callback)
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('access_token');
      if (token) {
        setAccessToken(token);
        setSpotifyToken(token);
        window.history.replaceState({}, document.title, '/');
      }
    } else {
      const token = getAccessToken();
      if (token) {
        setSpotifyToken(token);
      }
    }

    // Firebase anonymous auth for cloud storage
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFirebaseUser(user);
      } else {
        signInAnonymously(auth).catch(console.error);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    window.location.href = getAuthUrl();
  };

  const handleLogout = () => {
    clearAccessToken();
    setSpotifyToken(null);
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
          userId={firebaseUser?.uid}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
