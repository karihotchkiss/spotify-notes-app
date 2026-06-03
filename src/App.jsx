import { useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { getAccessToken, setAccessToken, getAuthUrl, clearAccessToken, exchangeCodeForToken } from './spotify';
import Login from './components/Login';
import PlaylistView from './components/PlaylistView';
import './App.css';

function App() {
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleSpotifyCallback = async () => {
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
    };

    handleSpotifyCallback();

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

  const handleLogin = async () => {
    const authUrl = await getAuthUrl();
    window.location.href = authUrl;
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
