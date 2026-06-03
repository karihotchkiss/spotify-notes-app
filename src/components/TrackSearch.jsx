import { useState } from 'react';
import './TrackSearch.css';

function TrackSearch({ onTrackSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchTracks = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('spotify_access_token');
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      const tracks = data.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists.map(a => a.name).join(', '),
        album: track.album.name,
        image: track.album.images[0]?.url,
      }));

      setResults(tracks);
    } catch (err) {
      setError('Search failed. You can still add notes manually below.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchTracks();
    }
  };

  return (
    <div className="track-search">
      <div className="search-input-group">
        <input
          type="text"
          placeholder="Search for a track (e.g., Bring Me to Life Evanescence)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="search-input"
        />
        <button onClick={searchTracks} disabled={loading} className="search-btn">
          {loading ? '🔍 Searching...' : '🔍 Search'}
        </button>
      </div>

      {error && <div className="search-error">{error}</div>}

      {results.length > 0 && (
        <div className="search-results">
          <h3>Search Results</h3>
          {results.map(track => (
            <div key={track.id} className="result-item" onClick={() => onTrackSelect(track)}>
              {track.image && <img src={track.image} alt={track.name} />}
              <div className="result-info">
                <div className="result-name">{track.name}</div>
                <div className="result-artist">{track.artist}</div>
              </div>
              <button className="select-btn">Add Note ➕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TrackSearch;
