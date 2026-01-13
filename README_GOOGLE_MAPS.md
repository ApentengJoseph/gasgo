# Google Maps Integration Setup

## Overview
The app uses Google Maps Places API for address autocomplete to provide a better user experience when entering delivery addresses.

## Setup Instructions

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Places API** (required for address autocomplete)
   - **Maps JavaScript API** (optional, for future map features)
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy your API key

### 2. Configure API Key Restrictions (Recommended)

For security, restrict your API key:

1. Click on your API key in Google Cloud Console
2. Under "API restrictions", select "Restrict key"
3. Choose:
   - **Places API**
   - **Maps JavaScript API** (if using maps)
4. Under "Application restrictions", you can:
   - Restrict to HTTP referrers (for web)
   - Add your domain (e.g., `localhost:3000`, `yourdomain.com`)

### 3. Add API Key to Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### 4. Fallback Behavior

If no API key is provided, the app will:
- Show a regular textarea for manual address entry
- Still function normally, just without autocomplete
- Display a message to enter address manually

## Features

- ✅ Address autocomplete as user types
- ✅ Restricted to Ghana addresses (`country: 'gh'`)
- ✅ Captures both address string and coordinates (lat/lng)
- ✅ Graceful fallback if API key is missing
- ✅ Loading states and error handling

## Usage

The `AddressAutocomplete` component is used in:
- `/app/profile/addresses/add` - Add new address page
- Can be used anywhere address input is needed

## Cost Considerations

Google Maps Places API has a free tier:
- **$200 free credit per month** (covers most small apps)
- Autocomplete requests: $2.83 per 1,000 requests
- After free tier: Pay-as-you-go pricing

Monitor usage in Google Cloud Console to avoid unexpected charges.

## Security Notes

- ⚠️ Never commit `.env.local` to git
- ⚠️ API key is exposed in client-side code (this is normal for Maps API)
- ✅ Use API key restrictions in Google Cloud Console
- ✅ Monitor usage regularly

