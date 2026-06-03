import { useState, useEffect } from 'react';
import { getUserPlaylists, getPlaylistTracks, getCurrentUser } from '../spotify';
import { db } from '../firebase';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import TrackList from './TrackList';
import './PlaylistView.css';

function PlaylistView({ userId, user: firebaseUser, onLogout }) {
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

      // Load notes from Firebase
      if (userId) {
        const notesData = {};
        for (const track of tracksData) {
          const noteDoc = await getDoc(doc(db, 'users', userId, 'notes', track.id));
          if (noteDoc.exists()) {
            notesData[track.id] = noteDoc.data().note;
          }
        }
        setNotes(notesData);
      }
    } catch (error) {
      console.error('Error loading tracks:', error);
    }
  };

  const handlePlaylistSelect = (playlist) => {
    setSelectedPlaylist(playlist);
    setSearchQuery('');
    loadPlaylistTracks(playlist.id);
  };

  const handleSaveNote = async (trackId, note) => {
    try {
      // Save to Firebase
      if (userId) {
        await setDoc(doc(db, 'users', userId, 'notes', trackId), {
          note: note,
          trackId: trackId,
          updatedAt: new Date().toISOString()
        });
        setNotes(prev => ({ ...prev, [trackId]: note }));
      }
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const filteredTracks = tracks.filter(track =>
    track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notes[track.id]?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportNotes = () => {
    // Filter tracks that have notes
    const tracksWithNotes = tracks.filter(track => notes[track.id]);

    if (tracksWithNotes.length === 0) {
      alert('No notes to export in this playlist!');
      return;
    }

    // Create export content
    let content = `${selectedPlaylist.name}\n`;
    content += `Exported: ${new Date().toLocaleDateString()}\n`;
    content += `Total tracks with notes: ${tracksWithNotes.length}\n`;
    content += `\n${'='.repeat(80)}\n\n`;

    tracksWithNotes.forEach((track, index) => {
      content += `${index + 1}. ${track.name}\n`;
      content += `   Artist: ${track.artist}\n`;
      content += `   Album: ${track.album}\n`;
      content += `   Note: ${notes[track.id]}\n`;
      content += `\n`;
    });

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedPlaylist.name.replace(/[^a-z0-9]/gi, '_')}_notes.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportNotes = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split('\n');

      let currentTrack = null;
      let trackName = '';
      let artistName = '';
      let noteText = '';
      let imported = 0;
      let notFound = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Match track number and name: "1. Track Name"
        if (/^\d+\.\s+(.+)$/.test(line)) {
          // Save previous track if exists
          if (currentTrack && noteText) {
            await handleSaveNote(currentTrack.id, noteText);
            imported++;
          } else if (trackName && !currentTrack) {
            notFound++;
          }

          // Start new track
          trackName = line.replace(/^\d+\.\s+/, '');
          artistName = '';
          noteText = '';
          currentTrack = null;
        }
        // Match artist line: "   Artist: Artist Name"
        else if (line.startsWith('Artist:')) {
          artistName = line.replace('Artist:', '').trim();
          // Try to find matching track
          currentTrack = tracks.find(t =>
            t.name.toLowerCase() === trackName.toLowerCase() &&
            t.artist.toLowerCase().includes(artistName.toLowerCase())
          );
        }
        // Match note line: "   Note: Note text"
        else if (line.startsWith('Note:')) {
          noteText = line.replace('Note:', '').trim();
        }
      }

      // Save last track
      if (currentTrack && noteText) {
        await handleSaveNote(currentTrack.id, noteText);
        imported++;
      } else if (trackName && !currentTrack) {
        notFound++;
      }

      // Reload notes to show imported data
      await loadPlaylistTracks(selectedPlaylist.id);

      let message = `Import complete!\n\n`;
      message += `✅ ${imported} note(s) imported successfully\n`;
      if (notFound > 0) {
        message += `⚠️ ${notFound} track(s) not found in this playlist`;
      }
      alert(message);

    } catch (error) {
      console.error('Import error:', error);
      alert('Error importing notes. Please make sure the file format is correct.');
    }

    // Clear file input
    event.target.value = '';
  };

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
          <div className="user-info">
            {firebaseUser && (
              <span className="username">{firebaseUser.displayName || firebaseUser.email}</span>
            )}
            {user && user.display_name && (
              <span className="username"> • {user.display_name}</span>
            )}
            <button className="logout-btn" onClick={onLogout}>Logout</button>
          </div>
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
                <div className="track-actions">
                  <div className="search-box">
                    <input
                      type="text"
                      placeholder="Search tracks or notes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="action-buttons">
                    <label className="import-btn" title="Import notes">
                      📤 Import Notes
                      <input
                        type="file"
                        accept=".txt"
                        onChange={handleImportNotes}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <button className="export-btn" onClick={handleExportNotes} title="Export notes">
                      📥 Export Notes
                    </button>
                  </div>
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
