// Quick check to see if env vars are loaded
console.log('Environment Variables Check:');
console.log('VITE_SPOTIFY_CLIENT_ID:', import.meta.env.VITE_SPOTIFY_CLIENT_ID ? '✅ Set' : '❌ Missing');
console.log('VITE_FIREBASE_API_KEY:', import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing');
console.log('VITE_FIREBASE_PROJECT_ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing');
