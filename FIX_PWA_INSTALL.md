# Fix PWA Install Prompt - Missing Icons

## Problem
The install prompt isn't showing because **PWA icons are missing**. The manifest references icon files that don't exist in `/public`.

## Solution: Generate Icons

### Option 1: Use the Script (Recommended)

1. **Create a source icon** (512x512 PNG):
   - Create or find a 512x512 PNG image
   - Save it as `public/icon-source.png`

2. **Install sharp** (if not already installed):
   ```bash
   npm install --save-dev sharp
   ```

3. **Run the icon generator**:
   ```bash
   node scripts/generate-icons.js
   ```

### Option 2: Manual Generation

You need to create these icon files in `/public`:
- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png`
- `icon-192x192.png` ⭐ **Required**
- `icon-384x384.png`
- `icon-512x512.png` ⭐ **Required**

**Minimum Required**: 192x192 and 512x512 (marked with ⭐)

### Option 3: Use Online Tool

1. Go to https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator
2. Upload your icon (512x512 recommended)
3. Download generated icons
4. Place them in `/public` folder

## After Adding Icons

1. **Commit and push**:
   ```bash
   git add public/icon-*.png
   git commit -m "Add PWA icons"
   git push
   ```

2. **Redeploy on Vercel** (should auto-deploy)

3. **Test**:
   - Visit your deployed site
   - Open DevTools > Application > Manifest
   - Check all icons load without errors
   - Clear browser data or use incognito
   - The install prompt should appear

## Quick Test Checklist

After adding icons, verify:

- [ ] All icon files exist in `/public`
- [ ] Manifest loads: `https://your-site.vercel.app/manifest.json`
- [ ] Icons load: `https://your-site.vercel.app/icon-192x192.png`
- [ ] Service worker registered (DevTools > Application > Service Workers)
- [ ] No console errors
- [ ] Test in incognito/private window

## Why Icons Are Required

Browsers use these criteria to determine if a site is "installable":
1. ✅ Valid manifest
2. ✅ Service worker registered
3. ✅ Served over HTTPS
4. ✅ **Icons present** ← You're missing this
5. ✅ User engagement

Without icons, the browser won't fire the `beforeinstallprompt` event.

## Temporary Workaround

If you need to test immediately, you can:
1. Create simple placeholder icons (colored squares)
2. Use an online icon generator
3. Or use the script in `scripts/generate-icons.js`

The icons don't need to be perfect - they just need to exist for the install prompt to work.

