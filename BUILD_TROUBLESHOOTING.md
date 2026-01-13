# Build Troubleshooting Guide

## Windows Permission Error (EPERM)

If you encounter `EPERM: operation not permitted` errors when building, follow these steps:

### Solution 1: Use the Clean Script (Recommended)

```bash
npm run clean
npm run build
```

Or use the combined command:
```bash
npm run build
```

This will automatically clean the `.next` folder before building.

### Solution 2: Manual Cleanup

1. **Close all processes:**
   - Close VS Code
   - Close any terminal windows
   - Stop any running dev servers (`npm run dev`)
   - Close Chrome/Edge if it has the app open

2. **Delete .next folder manually:**
   - Open File Explorer
   - Navigate to your project folder
   - Delete the `.next` folder
   - If it says "file is in use", restart your computer

3. **Try building again:**
   ```bash
   npm run build
   ```

### Solution 3: Run as Administrator

1. Right-click on your terminal/Git Bash
2. Select "Run as administrator"
3. Navigate to your project
4. Run `npm run build`

### Solution 4: Disable Antivirus Temporarily

Sometimes antivirus software locks files:
1. Temporarily disable Windows Defender or your antivirus
2. Run the build
3. Re-enable antivirus

### Solution 5: Use PowerShell Instead of Git Bash

Sometimes Git Bash has permission issues. Try using PowerShell:
```powershell
cd C:\Users\Joseph Apenten\Desktop\GasWeb
npm run build
```

### Solution 6: Check File Permissions

1. Right-click on the `.next` folder
2. Select "Properties" → "Security" tab
3. Make sure your user has "Full control"
4. Click "Apply" and "OK"

### Solution 7: Pre-create Trace File (Current Fix)

The build script now automatically pre-creates the trace file with proper permissions before building. This prevents the EPERM error.

If you still see the error, try:

**Option A: Disable Next.js Telemetry Globally**
```bash
npx next telemetry disable
```

**Option B: Manual Fix**
1. Close all processes (VS Code, terminals)
2. Delete `.next` folder manually
3. Run `npm run build` again

### Solution 8: Disable Next.js Telemetry (Alternative)

The trace file is used for Next.js telemetry. You can disable it:

**Option A: Use the build script (already configured):**
```bash
npm run build
```
The build script now automatically disables telemetry.

**Option B: Set environment variable manually:**
```bash
# Windows (Git Bash/PowerShell)
set NEXT_TELEMETRY_DISABLED=1 && npm run build

# Or add to .env.local file:
NEXT_TELEMETRY_DISABLED=1
```

**Option C: Disable globally:**
```bash
npx next telemetry disable
```

This is the recommended solution as it prevents the trace file from being created.

## Common Build Issues

### Issue: "Cannot find module 'next-pwa'"

**Solution:**
```bash
npm install
```

### Issue: Service worker not generating

**Solution:**
- Make sure you're building in production mode
- Check that `next-pwa` is installed
- Verify `next.config.js` has `withPWA` configured

### Issue: Build succeeds but PWA doesn't work

**Solution:**
1. Check that icons are generated in `public` folder
2. Verify `manifest.json` is accessible
3. Test in production mode: `npm run build && npm start`
4. Check browser console for errors

## Still Having Issues?

1. Check the [Next.js documentation](https://nextjs.org/docs)
2. Check the [next-pwa GitHub issues](https://github.com/shadowwalker/next-pwa/issues)
3. Make sure Node.js and npm are up to date:
   ```bash
   node --version  # Should be 18+
   npm --version   # Should be 9+
   ```

