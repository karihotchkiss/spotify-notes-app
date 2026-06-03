const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const SCOPES = 'playlist-read-private playlist-read-collaborative user-library-read';

// Generate PKCE code verifier and challenge
const generateCodeVerifier = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
};

const base64URLEncode = (buffer) => {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

const sha256 = async (plain) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return await crypto.subtle.digest('SHA-256', data);
};

const generateCodeChallenge = async (verifier) => {
  const hashed = await sha256(verifier);
  return base64URLEncode(hashed);
};

export const getAuthUrl = async () => {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Store code verifier for later use
  localStorage.setItem('code_verifier', codeVerifier);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
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
  localStorage.removeItem('code_verifier');
};

export const exchangeCodeForToken = async (code) => {
  const codeVerifier = localStorage.getItem('code_verifier');

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange code for token');
  }

  const data = await response.json();
  return data.access_token;
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
    const errorText = await response.text();
    console.error('Spotify API error:', response.status, errorText);
    throw new Error(`Spotify API error: ${response.status} - ${errorText}`);
  }

  return response.json();
};

export const getUserPlaylists = async () => {
  const data = await spotifyFetch('/me/playlists?limit=50');
  console.log('Playlists fetched:', data.items.length);
  console.log('First playlist sample:', data.items[0]);
  return data.items;
};

export const getPlaylistTracks = async (playlistId) => {
  // Use /items endpoint instead of /tracks - works in Development Mode!
  const data = await spotifyFetch(`/playlists/${playlistId}/items`);
  return data.items
    .filter(item => item.track && item.track.id) // Filter out null/deleted tracks
    .map(item => ({
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
