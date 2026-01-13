# Setting Up Google Maps API Key on Vercel

## Your Google Maps API Key

**API Key**: `AIzaSyAJPkU3FuEKHL1qnQy9ZDK671KE33uQSEE`

## Step-by-Step: Adding to Vercel

### Method 1: Via Vercel Dashboard (Recommended)

1. **Go to Your Project on Vercel**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click on your `GasWeb` project

2. **Navigate to Settings**
   - Click on **"Settings"** tab (top navigation)
   - Click on **"Environment Variables"** (left sidebar)

3. **Add Environment Variables**
   Click **"Add New"** and add these **three** variables:

   **Variable 1:**
   - **Key**: `GOOGLE_MAP_API_KEY`
   - **Value**: `AIzaSyAJPkU3FuEKHL1qnQy9ZDK671KE33uQSEE`
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development

   **Variable 2:**
   - **Key**: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - **Value**: `AIzaSyAJPkU3FuEKHL1qnQy9ZDK671KE33uQSEE`
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development

   **Variable 3:**
   - **Key**: `NEXT_PUBLIC_GOOGLE_MAP_API_KEY`
   - **Value**: `AIzaSyAJPkU3FuEKHL1qnQy9ZDK671KE33uQSEE`
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development

4. **Save**
   - Click **"Save"** after adding each variable
   - Wait for confirmation

5. **Redeploy** (if already deployed)
   - Go to **"Deployments"** tab
   - Click the **"..."** menu on the latest deployment
   - Click **"Redeploy"**
   - Or push a new commit to trigger auto-deploy

### Method 2: Via Vercel CLI

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login
vercel login

# Link to your project (if not already linked)
vercel link

# Add environment variables
vercel env add GOOGLE_MAP_API_KEY
# When prompted, paste: AIzaSyAJPkU3FuEKHL1qnQy9ZDK671KE33uQSEE
# Select: Production, Preview, Development

vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
# When prompted, paste: AIzaSyAJPkU3FuEKHL1qnQ9ZDK671KE33uQSEE
# Select: Production, Preview, Development

vercel env add NEXT_PUBLIC_GOOGLE_MAP_API_KEY
# When prompted, paste: AIzaSyAJPkU3FuEKHL1qnQy9ZDK671KE33uQSEE
# Select: Production, Preview, Development

# Pull environment variables (optional - to verify)
vercel env pull .env.local
```

## Why Three Variables?

Your `next.config.js` checks for multiple variable names to support different setups:
- `GOOGLE_MAP_API_KEY` - Server-side usage
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Client-side (browser)
- `NEXT_PUBLIC_GOOGLE_MAP_API_KEY` - Alternative client-side name

Setting all three ensures compatibility.

## Security Best Practices

### ✅ DO:
- ✅ Add API key as environment variable in Vercel (not in code)
- ✅ Use `.env.example` file (without real keys) for reference
- ✅ Keep `.env` in `.gitignore` (already done)
- ✅ Restrict API key in Google Cloud Console (see below)

### ❌ DON'T:
- ❌ Commit `.env` file to git
- ❌ Hardcode API key in source code
- ❌ Share API key publicly

## Restricting Your API Key (Important!)

To prevent unauthorized use, restrict your API key in Google Cloud Console:

1. **Go to Google Cloud Console**
   - Visit [console.cloud.google.com](https://console.cloud.google.com)
   - Navigate to **APIs & Services** → **Credentials**

2. **Edit Your API Key**
   - Click on your API key
   - Under **"Application restrictions"**:
     - Select **"HTTP referrers (web sites)"**
     - Add your Vercel domain: `*.vercel.app/*`
     - Add your custom domain (if you have one): `yourdomain.com/*`
     - Add localhost for development: `localhost:*`

3. **API Restrictions**
   - Under **"API restrictions"**:
     - Select **"Restrict key"**
     - Enable only:
       - ✅ Maps JavaScript API
       - ✅ Places API
       - ✅ Geocoding API
       - ✅ Distance Matrix API

4. **Save**
   - Click **"Save"**
   - Wait 5 minutes for changes to propagate

## Verifying It Works

### After Deployment:

1. **Check Browser Console**
   - Open your deployed app
   - Open DevTools (F12) → Console
   - Look for Google Maps errors
   - Should see: Maps API loaded successfully

2. **Test Features**
   - ✅ Address autocomplete should work
   - ✅ Map should load on stations page
   - ✅ Map should load on tracking page
   - ✅ Location services should work

3. **Check Network Tab**
   - DevTools → Network
   - Filter by "maps.googleapis.com"
   - Requests should return 200 (not 403 Forbidden)

### Common Issues:

**Error: "This API key is not authorized"**
- ✅ Check API key is correct in Vercel
- ✅ Verify API restrictions allow your domain
- ✅ Wait 5 minutes after changing restrictions

**Error: "RefererNotAllowedMapError"**
- ✅ Add your Vercel domain to HTTP referrers
- ✅ Format: `*.vercel.app/*` (with wildcard)

**Maps not loading**
- ✅ Check browser console for errors
- ✅ Verify environment variables are set
- ✅ Check that `NEXT_PUBLIC_` prefix is used for client-side

## Quick Reference

**Your API Key**: `AIzaSyAJPkU3FuEKHL1qnQy9ZDK671KE33uQSEE`

**Variables to Add:**
1. `GOOGLE_MAP_API_KEY`
2. `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
3. `NEXT_PUBLIC_GOOGLE_MAP_API_KEY`

**All should have value**: `AIzaSyAJPkU3FuEKHL1qnQy9ZDK671KE33uQSEE`

## Need Help?

- [Vercel Environment Variables Docs](https://vercel.com/docs/concepts/projects/environment-variables)
- [Google Maps API Key Setup](https://developers.google.com/maps/documentation/javascript/get-api-key)
- [Google Maps API Restrictions](https://developers.google.com/maps/api-security-best-practices)

