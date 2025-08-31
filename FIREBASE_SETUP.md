# Firebase Setup Instructions

The map creation and database functionality requires Firebase configuration. Follow these steps to set up Firebase for your project:

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `shareablemaps2`
4. Enable Google Analytics (optional)
5. Wait for project creation

## 2. Set up Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** provider
3. Enable **Google** provider (optional)

## 3. Set up Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** for now
4. Select your preferred location (e.g., `us-central1`)

## 4. Get Firebase Configuration

1. Go to **Project Settings** (gear icon) → **General**
2. Scroll down to **Your apps** section
3. Click **Add app** → **Web** (</> icon)
4. Register app with name: `shareablemaps2`
5. Copy the `firebaseConfig` object

## 5. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Firebase config values in `.env.local`:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

## 6. Set up Firestore Security Rules

In Firebase Console, go to **Firestore Database** → **Rules** and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Maps collection
    match /maps/{mapId} {
      // Users can read any map
      allow read: if true;
      
      // Users can only create/update/delete their own maps
      allow create, update, delete: if request.auth != null 
        && request.auth.uid == resource.data.ownerId;
    }
    
    // Markers collection (subcollection of maps)
    match /maps/{mapId}/markers/{markerId} {
      // Users can read markers if they can read the parent map
      allow read: if true;
      
      // Users can modify markers only if they own the parent map
      allow create, update, delete: if request.auth != null 
        && request.auth.uid == get(/databases/$(database)/documents/maps/$(mapId)).data.ownerId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 7. Test the Configuration

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Go to http://localhost:3005
3. Sign in with your Google/email account
4. Try creating a new map
5. Check the Firebase Console to see if data is being stored

## Database Structure

The app creates the following collections:

### `maps` Collection
```typescript
{
  id: string,                    // Auto-generated document ID
  ownerId: string,              // Firebase Auth user ID
  title: string,                // Map title
  description?: string,         // Optional description
  mainLocation?: {              // Starting location
    lat: number,
    lng: number,
    address: string,
    city?: string
  },
  tags: string[],               // Tags array
  shareId: string,              // 12-character unique hash for sharing
  isPublicLinkEnabled: boolean, // Whether public sharing is enabled
  stats: {                      // Map statistics
    views: number,
    comments: number,
    likes: number
  },
  categories: [],               // Map categories (future feature)
  createdAt: Timestamp,         // Creation timestamp
  updatedAt: Timestamp          // Last update timestamp
}
```

### Future Collections
- `maps/{mapId}/markers` - Map markers
- `maps/{mapId}/shapes` - Drawn shapes and areas
- `maps/{mapId}/comments` - Map comments
- `users` - User profiles and settings

## Troubleshooting

- **Firebase errors**: Check that all environment variables are correctly set
- **Authentication issues**: Verify that Email/Password is enabled in Firebase Auth
- **Permission denied**: Check that Firestore security rules are correctly configured
- **Invalid API key**: Make sure you're using the web API key, not server keys

Once configured, you'll be able to:
- Create and store maps in Firestore
- Load existing maps from the database
- See your maps in the "My Maps" page
- Share maps using secure hash IDs
