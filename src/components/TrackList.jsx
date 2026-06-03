import { useState } from 'react';
import './TrackList.css';

function TrackList({ tracks, notes, onSaveNote }) {
  const [editingTrack, setEditingTrack] = useState(null);
  const [noteText, setNoteText] = useState('');

  const handleEditClick = (track) => {
    setEditingTrack(track.id);
    setNoteText(notes[track.id] || '');
  };

  const handleSave = (trackId) => {
    onSaveNote(trackId, noteText);
    setEditingTrack(null);
    setNoteText('');
  };

  const handleCancel = () => {
    setEditingTrack(null);
    setNoteText('');
  };

  return (
    <div className="track-list">
      {tracks.length === 0 ? (
        <div className="no-results">
          <p>No tracks found</p>
        </div>
      ) : (
        tracks.map(track => (
          <div key={track.id} className="track-item">
            <div className="track-main">
              {track.image && (
                <img src={track.image} alt={track.album} className="track-image" />
              )}
              <div className="track-details">
                <div className="track-name">{track.name}</div>
                <div className="track-artist">{track.artist}</div>
                <div className="track-album">{track.album}</div>
              </div>
              <button
                className="edit-note-btn"
                onClick={() => handleEditClick(track)}
                title={notes[track.id] ? 'Edit note' : 'Add note'}
              >
                {notes[track.id] ? '✏️ Edit' : '➕ Add Note'}
              </button>
            </div>

            {editingTrack === track.id ? (
              <div className="note-editor">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add your thoughts, memories, or why you love this track..."
                  rows={4}
                  autoFocus
                />
                <div className="note-actions">
                  <button className="save-btn" onClick={() => handleSave(track.id)}>
                    💾 Save
                  </button>
                  <button className="cancel-btn" onClick={handleCancel}>
                    ✖️ Cancel
                  </button>
                </div>
              </div>
            ) : notes[track.id] ? (
              <div className="note-display">
                <div className="note-label">📝 Your note:</div>
                <div className="note-text">{notes[track.id]}</div>
              </div>
            ) : null}
          </div>
        ))
      )}
    </div>
  );
}

export default TrackList;
