import { useState, useEffect } from 'react';
import { getAllNotes, saveNote, deleteNote, searchNotes, exportNotes } from '../localNotes';
import TrackSearch from './TrackSearch';
import './NotesView.css';

function NotesView({ user, onLogout }) {
  const [notes, setNotes] = useState([]);
  const [editingTrack, setEditingTrack] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = () => {
    const allNotes = getAllNotes();
    setNotes(Object.values(allNotes).sort((a, b) =>
      new Date(b.updatedAt) - new Date(a.updatedAt)
    ));
  };

  const handleTrackSelect = (track) => {
    setSelectedTrack(track);
    setEditingTrack(track.id);
    const existing = getAllNotes()[track.id];
    setNoteText(existing?.note || '');
  };

  const handleSaveNote = () => {
    if (!selectedTrack || !noteText.trim()) return;

    saveNote(
      selectedTrack.id,
      selectedTrack.name,
      selectedTrack.artist,
      selectedTrack.album || '',
      selectedTrack.image || '',
      noteText
    );

    setEditingTrack(null);
    setNoteText('');
    setSelectedTrack(null);
    loadNotes();
  };

  const handleEditNote = (note) => {
    setSelectedTrack({
      id: note.trackId,
      name: note.trackName,
      artist: note.artist,
      album: note.album,
      image: note.image,
    });
    setEditingTrack(note.trackId);
    setNoteText(note.note);
  };

  const handleDeleteNote = (trackId) => {
    if (confirm('Delete this note?')) {
      deleteNote(trackId);
      loadNotes();
    }
  };

  const handleExport = () => {
    exportNotes();
  };

  const filteredNotes = searchQuery
    ? notes.filter(note =>
        note.trackName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.note.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : notes;

  return (
    <div className="notes-view">
      <header className="app-header">
        <div className="header-content">
          <h1>🎵 Spotify Notes</h1>
          {user && (
            <div className="user-actions">
              <span className="username">{user.display_name || 'User'}</span>
              <button className="export-btn" onClick={handleExport} title="Export notes">
                💾 Export
              </button>
              <button className="logout-btn" onClick={onLogout}>Logout</button>
            </div>
          )}
        </div>
      </header>

      <div className="main-container">
        <div className="notes-section">
          <div className="section-header">
            <h2>✨ Search for a Track</h2>
            <p className="subtitle">Find any track and add your personal notes</p>
          </div>

          <TrackSearch onTrackSelect={handleTrackSelect} />

          {selectedTrack && editingTrack && (
            <div className="note-editor-card">
              <div className="selected-track">
                {selectedTrack.image && (
                  <img src={selectedTrack.image} alt={selectedTrack.name} />
                )}
                <div>
                  <div className="track-name">{selectedTrack.name}</div>
                  <div className="track-artist">{selectedTrack.artist}</div>
                </div>
              </div>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add your thoughts, memories, or why you love this track..."
                rows={6}
                autoFocus
                className="note-textarea"
              />
              <div className="note-actions">
                <button className="save-btn" onClick={handleSaveNote}>
                  💾 Save Note
                </button>
                <button className="cancel-btn" onClick={() => {
                  setEditingTrack(null);
                  setSelectedTrack(null);
                  setNoteText('');
                }}>
                  ✖️ Cancel
                </button>
              </div>
            </div>
          )}

          <div className="section-header" style={{ marginTop: '3rem' }}>
            <h2>📝 Your Notes ({notes.length})</h2>
            <input
              type="text"
              placeholder="Search your notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="notes-search"
            />
          </div>

          {filteredNotes.length === 0 && (
            <div className="empty-state">
              {searchQuery ? (
                <>
                  <div className="empty-icon">🔍</div>
                  <p>No notes match your search</p>
                </>
              ) : (
                <>
                  <div className="empty-icon">📝</div>
                  <h3>No notes yet!</h3>
                  <p>Search for a track above and start adding notes</p>
                </>
              )}
            </div>
          )}

          <div className="notes-list">
            {filteredNotes.map(note => (
              <div key={note.trackId} className="note-card">
                <div className="note-header">
                  {note.image && (
                    <img src={note.image} alt={note.trackName} className="note-image" />
                  )}
                  <div className="note-info">
                    <div className="note-track-name">{note.trackName}</div>
                    <div className="note-artist">{note.artist}</div>
                  </div>
                  <div className="note-buttons">
                    <button onClick={() => handleEditNote(note)} className="edit-btn" title="Edit">
                      ✏️
                    </button>
                    <button onClick={() => handleDeleteNote(note.trackId)} className="delete-btn" title="Delete">
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="note-content">{note.note}</div>
                <div className="note-date">
                  Updated {new Date(note.updatedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotesView;
