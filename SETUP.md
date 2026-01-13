# Gaso PWA Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing
3. Enable Authentication:
   - Go to Authentication → Sign-in method
   - Enable Phone authentication
   - Enable Email/Password authentication
4. Create Firestore Database:
   - Go to Firestore Database
   - Create database in production mode
   - Set up security rules (see below)
5. Get your Firebase config from Project Settings

### 4. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Orders - users can create and read their own
    match /orders/{orderId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         request.auth.token.role == 'admin' || 
         request.auth.token.role == 'rider');
      allow update: if request.auth != null && 
        (request.auth.token.role == 'admin' || 
         request.auth.token.role == 'rider');
    }
    
    // Stations - public read, admin write
    match /stations/{stationId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.role == 'admin';
    }
  }
}
```

### 5. Paystack Setup

1. Sign up at [Paystack](https://paystack.com/)
2. Get your public key from Settings → API Keys
3. Add it to `.env.local`
4. For production, you'll need to set up webhooks

### 6. Google Maps Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Maps JavaScript API
4. Enable Places API (for autocomplete)
5. Create API key and restrict it to your domain
6. Add to `.env.local`

### 7. PWA Icons

Generate PWA icons using a tool like [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator):

```bash
npx pwa-asset-generator public/icon.png public/icons --icon-only
```

Or manually create icons in these sizes:
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

Place them in `public/icons/` directory.

### 8. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📱 Testing PWA Features

### Chrome/Edge (Desktop)
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Service Workers" to see registered workers
4. Click "Manifest" to view manifest
5. Use "Add to Home screen" to test install

### Chrome (Android)
1. Open the app in Chrome
2. Tap menu (3 dots)
3. Select "Add to Home screen"
4. Test offline functionality

### Safari (iOS)
1. Open the app in Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. Test as standalone app

## 🔧 Development Tips

### Hot Reload
The app uses Next.js hot reload. Changes to components will automatically refresh.

### TypeScript
All components are typed. Check for type errors:
```bash
npm run build
```

### Linting
```bash
npm run lint
```

### Build for Production
```bash
npm run build
npm start
```

## 🐛 Common Issues

### Firebase Auth Not Working
- Check that phone authentication is enabled
- Verify API keys are correct
- Check browser console for errors

### PWA Not Installing
- Ensure you're using HTTPS (or localhost)
- Check manifest.json is accessible
- Verify service worker is registered

### Payment Not Working
- Verify Paystack public key is correct
- Check that Paystack inline JS is loaded
- Ensure callback URLs are configured

## 📚 Next Steps

1. **Complete Firebase Integration**
   - Implement phone authentication
   - Set up Firestore collections
   - Add real-time listeners

2. **Payment Integration**
   - Complete Paystack integration
   - Add payment verification
   - Handle payment callbacks

3. **Maps Integration**
   - Add Google Maps component
   - Implement address autocomplete
   - Add route tracking

4. **Real-time Features**
   - Order status updates
   - Rider location tracking
   - Push notifications

5. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests

## 🆘 Support

For issues or questions, please check:
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Paystack Documentation](https://paystack.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

