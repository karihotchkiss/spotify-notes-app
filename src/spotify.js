const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const SCOPES = 'playlist-read-private playlist-read-collaborative user-library-read';

export const getAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'token',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
  });
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

export const getAccessToken = () => {
  return localStorage.getItem('spotify_access_token');
};

export const setAccessToken = (token) => {
  localStorage.setItem('spotify_access_token', token);
};

export const clearAccessToken = () => {
  localStorage.removeItem('spotify_access_token');
};

const spotifyFetch = async (endpoint) => {
  const token = getAccessToken();
  const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearAccessToken();
      throw new Error('Token expired');
    }
    throw new Error('Spotify API error');
  }

  return response.json();
};

export const getUserPlaylists = async () => {
  const data = await spotifyFetch('/me/playlists?limit=50');
  return data.items;
};

export const getPlaylistTracks = async (playlistId) => {
  const data = await spotifyFetch(`/playlists/${playlistId}/tracks`);
  return data.items.map(item => ({
    id: item.track.id,
    name: item.track.name,
    artist: item.track.artists.map(a => a.name).join(', '),
    album: item.track.album.name,
    image: item.track.album.images[0]?.url,
    uri: item.track.uri,
  }));
};

export const getCurrentUser = async () => {
  return await spotifyFetch('/me');
};
