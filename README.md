# 🎵 Spotify Notes

Add personal notes to your favorite Spotify tracks. Remember why you love each song, capture memories, and keep your musical journal synced across all devices.

🌐 **Live App**: https://spotify-notes-app.vercel.app

## ✨ Features

- 🎧 **Connect with Spotify** - Access all your playlists
- 📝 **Add Notes to Tracks** - Write personal thoughts and memories for each song
- ☁️ **Cloud Sync** - Your notes sync automatically across devices
- 🔍 **Search** - Find tracks by name, artist, or note content
- 🎨 **Beautiful UI** - Modern, responsive design with Spotify-inspired aesthetics
- 🔒 **Private** - Your notes are stored securely

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click "Create app"
3. Fill in the details:
   - **App name**: Spotify Notes (or whatever you prefer)
   - **App description**: Personal note-taking app for Spotify tracks
   - **Redirect URI**: `http://localhost:3000/callback`
4. Copy your **Client ID**

### 3. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" and follow the wizard
3. Once created, click the web icon (</>) to add a web app
4. Copy the Firebase configuration values
5. In Firebase Console, go to:
   - **Authentication** → Enable "Anonymous" sign-in
   - **Firestore Database** → Create database in production mode
   - **Firestore Rules** → Update rules to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /notes/{noteId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
```

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Fill in your credentials in `.env`:

```env
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_REDIRECT_URI=http://localhost:3000/callback

VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### 5. Run the App

```bash
npm run dev
```

The app will open at `http://localhost:3000`

## 📖 How to Use

1. **Login** - Click "Connect with Spotify" to authorize the app
2. **Select a Playlist** - Choose any playlist from the sidebar
3. **Add Notes** - Click "Add Note" on any track to write your thoughts
4. **Edit Notes** - Click "Edit" on tracks with existing notes to update them
5. **Search** - Use the search box to find tracks or notes

## 🛠️ Tech Stack

- **Frontend**: React + Vite
- **Styling**: CSS3 with modern features
- **Authentication**: Spotify OAuth + Firebase Anonymous Auth
- **Database**: Firebase Firestore
- **API**: Spotify Web API

## 📱 Features Coming Soon

- Export notes to JSON/Markdown
- Share notes with friends
- Note templates and tags
- Rich text formatting
- Album and artist notes
- Dark/light theme toggle

## 🔐 Privacy

- Your notes are stored in Firebase with user-specific access rules
- Only you can read and write your notes
- No tracking or analytics
- Your Spotify credentials are never stored

## 📄 License

MIT License - feel free to use and modify as you wish!

## 🐛 Issues?

If you encounter any problems:
1. Check that your Spotify and Firebase credentials are correct in `.env`
2. Ensure the redirect URI in Spotify Dashboard matches exactly
3. Verify Firebase Authentication and Firestore are enabled
4. Check browser console for any error messages

Enjoy your musical journal! 🎶
