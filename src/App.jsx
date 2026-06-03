import { useState, useEffect } from 'react';
import { getAccessToken, setAccessToken, getAuthUrl, clearAccessToken, exchangeCodeForToken, getCurrentUser } from './spotify';
import Login from './components/Login';
import NotesView from './components/NotesView';
import './App.css';

function App() {
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [spotifyUser, setSpotifyUser] = useState(null);
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
          // Get user info
          const user = await getCurrentUser();
          setSpotifyUser(user);
        } catch (error) {
          console.error('Error exchanging code for token:', error);
        }
      } else {
        const token = getAccessToken();
        if (token) {
          setSpotifyToken(token);
          // Try to get user info
          try {
            const user = await getCurrentUser();
            setSpotifyUser(user);
          } catch (error) {
            console.error('Error getting user:', error);
          }
        }
      }
      setLoading(false);
    };

    handleSpotifyCallback();
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
        <NotesView
          user={spotifyUser}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
