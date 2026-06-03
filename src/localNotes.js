// Local storage implementation for notes
// No Spotify API restrictions - works immediately

const NOTES_KEY = 'spotify_notes_local';

export const getAllNotes = () => {
  const notes = localStorage.getItem(NOTES_KEY);
  return notes ? JSON.parse(notes) : {};
};

export const getNote = (trackId) => {
  const notes = getAllNotes();
  return notes[trackId] || null;
};

export const saveNote = (trackId, trackName, artist, album, image, noteText) => {
  const notes = getAllNotes();
  notes[trackId] = {
    trackId,
    trackName,
    artist,
    album,
    image,
    note: noteText,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  return notes[trackId];
};

export const deleteNote = (trackId) => {
  const notes = getAllNotes();
  delete notes[trackId];
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
};

export const searchNotes = (query) => {
  const notes = getAllNotes();
  const lowerQuery = query.toLowerCase();

  return Object.values(notes).filter(note =>
    note.trackName.toLowerCase().includes(lowerQuery) ||
    note.artist.toLowerCase().includes(lowerQuery) ||
    note.note.toLowerCase().includes(lowerQuery)
  );
};

export const exportNotes = () => {
  const notes = getAllNotes();
  const dataStr = JSON.stringify(notes, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `spotify-notes-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const importNotes = (jsonString) => {
  try {
    const imported = JSON.parse(jsonString);
    const existing = getAllNotes();
    const merged = { ...existing, ...imported };
    localStorage.setItem(NOTES_KEY, JSON.stringify(merged));
    return Object.keys(imported).length;
  } catch (error) {
    throw new Error('Invalid JSON file');
  }
};
