# PWA Install Prompt Troubleshooting

## Why the Install Prompt Might Not Show

The `beforeinstallprompt` event (which triggers the install prompt) only fires when:

1. ✅ **HTTPS** - Your Vercel deployment should have this
2. ✅ **Valid manifest.json** - Check `/manifest.json` is accessible
3. ✅ **Service Worker Registered** - Check browser DevTools > Application > Service Workers
4. ✅ **Meets Installability Criteria**:
   - Has a valid manifest with:
     - `name` or `short_name`
     - `start_url`
     - `display` mode (standalone, fullscreen, or minimal-ui)
     - At least one icon (192x192 and 512x512 recommended)
   - Service worker is registered and active
   - Site is served over HTTPS
   - User has engaged with the site (visited at least once)

5. ❌ **User hasn't dismissed it before** - Browsers remember if user dismissed the prompt
6. ❌ **Already installed** - Won't show if PWA is already installed
7. ❌ **Browser doesn't support it** - Some browsers don't support `beforeinstallprompt`

## How to Test

### 1. Check Manifest
Visit: `https://your-vercel-url.vercel.app/manifest.json`
- Should return valid JSON
- Check all required fields are present

### 2. Check Service Worker
1. Open DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click **Service Workers**
4. Should see your service worker registered and active
5. Check for errors

### 3. Check Icons
Visit: `https://your-vercel-url.vercel.app/icon-192x192.png`
- Should load the icon image
- Check all icon sizes in manifest exist

### 4. Test Installability
1. Open Chrome DevTools
2. Go to **Application** tab
3. Click **Manifest** in left sidebar
4. Check for any errors or warnings
5. Look for "Add to homescreen" section

### 5. Check Console
Open browser console and look for:
- Service worker registration errors
- Manifest loading errors
- `beforeinstallprompt` event logs

## Common Issues

### Issue 1: Icons Missing
**Solution**: Generate icons and ensure they're in `/public` folder

### Issue 2: Service Worker Not Registered
**Solution**: 
- Check `next.config.js` has PWA enabled
- Check `public/sw.js` exists after build
- Check browser console for errors

### Issue 3: Manifest Not Accessible
**Solution**:
- Ensure `manifest.json` is in `/public` folder
- Check Vercel headers allow manifest access
- Verify manifest path in `app/layout.tsx`

### Issue 4: Browser Already Dismissed Prompt
**Solution**:
- Clear browser data for the site
- Use incognito/private window
- Reset browser's install prompt state

### Issue 5: Not Meeting Installability Criteria
**Solution**:
- Ensure all manifest fields are valid
- Check service worker is active
- Verify HTTPS is working
- User must have visited site at least once

## Manual Testing Steps

1. **Clear Browser Data**:
   - Chrome: Settings > Privacy > Clear browsing data > Cookies and site data
   - Or use Incognito mode

2. **Check Service Worker**:
   - DevTools > Application > Service Workers
   - Should see `sw.js` registered

3. **Check Manifest**:
   - DevTools > Application > Manifest
   - Should show all details correctly

4. **Trigger Install Prompt Manually**:
   - In Chrome DevTools Console, run:
   ```javascript
   window.dispatchEvent(new Event('beforeinstallprompt'));
   ```

5. **Check Network Tab**:
   - Ensure `manifest.json` loads with 200 status
   - Ensure `sw.js` loads with 200 status
   - Check for CORS errors

## Browser Support

- ✅ **Chrome/Edge** (Android & Desktop) - Full support
- ✅ **Safari** (iOS) - Uses different mechanism (Add to Home Screen)
- ⚠️ **Firefox** - Limited support
- ⚠️ **Safari** (Desktop) - No support

## iOS Safari (Different Behavior)

iOS Safari doesn't use `beforeinstallprompt`. Instead:
1. User taps Share button
2. Selects "Add to Home Screen"
3. No automatic prompt

Your manifest should still work for iOS, but the install prompt component won't show.

## Quick Fixes

1. **Ensure Icons Exist**: Generate all icon sizes
2. **Check Service Worker**: Verify it's registered
3. **Test in Incognito**: Fresh browser state
4. **Check Console**: Look for errors
5. **Verify HTTPS**: Must be HTTPS (not HTTP)

## Debug Code

Add this to your `InstallPrompt.tsx` to debug:

```typescript
useEffect(() => {
  console.log('Checking PWA installability...');
  
  // Check if already installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('✅ Already installed');
    return;
  }

  // Check service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      console.log('Service Workers:', registrations.length);
    });
  }

  // Listen for beforeinstallprompt
  const handler = (e: Event) => {
    console.log('✅ beforeinstallprompt event fired!');
    e.preventDefault();
    setDeferredPrompt(e);
    setShowPrompt(true);
  };

  window.addEventListener('beforeinstallprompt', handler);
  console.log('✅ Listening for beforeinstallprompt event');

  return () => {
    window.removeEventListener('beforeinstallprompt', handler);
  };
}, []);
```

