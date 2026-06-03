import { useState, useEffect } from 'react';
import { getUserPlaylists, getPlaylistTracks, getCurrentUser } from '../spotify';
import TrackList from './TrackList';
import './PlaylistView.css';

function PlaylistView({ onLogout }) {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [playlistsData, userData] = await Promise.all([
        getUserPlaylists(),
        getCurrentUser()
      ]);
      setPlaylists(playlistsData);
      setUser(userData);
    } catch (error) {
      console.error('Error loading data:', error);
      if (error.message === 'Token expired') {
        onLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const loadPlaylistTracks = async (playlistId) => {
    try {
      const tracksData = await getPlaylistTracks(playlistId);
      setTracks(tracksData);

      // Load notes from localStorage
      const notesData = {};
      const storedNotes = localStorage.getItem('spotify_notes') || '{}';
      const allNotes = JSON.parse(storedNotes);
      for (const track of tracksData) {
        if (allNotes[track.id]) {
          notesData[track.id] = allNotes[track.id];
        }
      }
      setNotes(notesData);
    } catch (error) {
      console.error('Error loading tracks:', error);
    }
  };

  const handlePlaylistSelect = (playlist) => {
    setSelectedPlaylist(playlist);
    setSearchQuery('');
    loadPlaylistTracks(playlist.id);
  };

  const handleSaveNote = (trackId, note) => {
    try {
      // Save to localStorage
      const storedNotes = localStorage.getItem('spotify_notes') || '{}';
      const allNotes = JSON.parse(storedNotes);
      allNotes[trackId] = note;
      localStorage.setItem('spotify_notes', JSON.stringify(allNotes));
      setNotes(prev => ({ ...prev, [trackId]: note }));
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const filteredTracks = tracks.filter(track =>
    track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notes[track.id]?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="playlist-loading">
        <div className="spinner"></div>
        <p>Loading your playlists...</p>
      </div>
    );
  }

  return (
    <div className="playlist-view">
      <header className="app-header">
        <div className="header-content">
          <h1>🎵 Spotify Notes</h1>
          {user && (
            <div className="user-info">
              <span className="username">{user.display_name}</span>
              <button className="logout-btn" onClick={onLogout}>Logout</button>
            </div>
          )}
        </div>
      </header>

      <div className="main-content">
        <aside className="sidebar">
          <h2>Your Playlists</h2>
          <div className="playlist-list">
            {playlists.map(playlist => (
              <div
                key={playlist.id}
                className={`playlist-item ${selectedPlaylist?.id === playlist.id ? 'active' : ''}`}
                onClick={() => handlePlaylistSelect(playlist)}
              >
                {playlist.images[0] && (
                  <img src={playlist.images[0].url} alt={playlist.name} />
                )}
                <div className="playlist-info">
                  <div className="playlist-name">{playlist.name}</div>
                  <div className="playlist-count">{playlist.items?.total || playlist.tracks?.total || 0} tracks</div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="track-section">
          {selectedPlaylist ? (
            <>
              <div className="track-header">
                <div className="playlist-title">
                  {selectedPlaylist.images[0] && (
                    <img src={selectedPlaylist.images[0].url} alt={selectedPlaylist.name} />
                  )}
                  <div>
                    <h2>{selectedPlaylist.name}</h2>
                    <p>{selectedPlaylist.items?.total || selectedPlaylist.tracks?.total || 0} tracks</p>
                  </div>
                </div>
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search tracks or notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <TrackList
                tracks={filteredTracks}
                notes={notes}
                onSaveNote={handleSaveNote}
              />
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📁</div>
              <h3>Select a playlist to get started</h3>
              <p>Choose a playlist from the sidebar to view tracks and add notes</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default PlaylistView;
