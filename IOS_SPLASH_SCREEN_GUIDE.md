# iOS Splash Screen Setup Guide

## Current Status

The app currently uses a CSS-based splash screen that shows the icon centered on the background color. This works but is not the native iOS splash screen experience.

## Native iOS Splash Screens

For the best iOS experience, you need to create splash screen images with exact device dimensions. iOS requires specific sizes for different devices.

## Quick Solution (Current Implementation)

The current implementation uses:
- CSS overlay with the icon centered
- Background color matching the manifest (#F9FAFB)
- Automatic fade-out when page loads

This works but shows a CSS overlay, not a native iOS splash screen.

## Best Solution: Generate Proper Splash Screens

### Option 1: Use Online Tools (Recommended)

1. **RealFaviconGenerator**: https://realfavicongenerator.net/
   - Upload your icon
   - Select "iOS" tab
   - Configure splash screens
   - Download and place in `/public` folder

2. **AppIcon.co**: https://www.appicon.co/#image-sets
   - Upload your icon
   - Generate splash screens
   - Download and update paths in `app/layout.tsx`

### Option 2: Use the Generator Script

1. Install sharp:
   ```bash
   npm install sharp --save-dev
   ```

2. Uncomment the image generation code in `scripts/generate-ios-splash.js`

3. Run:
   ```bash
   node scripts/generate-ios-splash.js
   ```

4. Update `app/layout.tsx` to use the generated splash screen files

## Required Splash Screen Sizes

| Device | Dimensions | File Name |
|--------|-----------|-----------|
| iPhone SE | 640x1136 | iphone-se-splash.png |
| iPhone 6/7/8 | 750x1334 | iphone-6-7-8-splash.png |
| iPhone 6/7/8 Plus | 1242x2208 | iphone-6-7-8-plus-splash.png |
| iPhone X/XS | 1125x2436 | iphone-x-xs-splash.png |
| iPhone XR | 828x1792 | iphone-xr-splash.png |
| iPhone XS Max | 1242x2688 | iphone-xs-max-splash.png |
| iPhone 12/13 mini | 1080x2340 | iphone-12-13-mini-splash.png |
| iPhone 12/13/14 | 1170x2532 | iphone-12-13-14-splash.png |
| iPhone 12/13/14 Pro Max | 1284x2778 | iphone-12-13-14-pro-max-splash.png |
| iPad | 1536x2048 | ipad-splash.png |
| iPad Pro 10.5" | 1668x2224 | ipad-pro-10-5-splash.png |
| iPad Pro 11" | 1668x2388 | ipad-pro-11-splash.png |
| iPad Pro 12.9" | 2048x2732 | ipad-pro-12-9-splash.png |

## Splash Screen Design Guidelines

1. **Background Color**: Use #F9FAFB (matches manifest)
2. **Icon Size**: Center the icon, use ~80% of the smaller dimension
3. **Icon Position**: Centered both horizontally and vertically
4. **Format**: PNG with transparency support

## Testing

1. Install the PWA on an iOS device
2. Close the app completely
3. Reopen the app
4. The splash screen should appear immediately

## Troubleshooting

- **White screen only**: Check that splash screen images exist and paths are correct
- **Icon not showing**: Verify `apple-touch-icon.png` exists in `/public`
- **Wrong size**: Ensure splash screen dimensions match device exactly
- **Not appearing**: Clear Safari cache and reinstall the PWA

## Current Meta Tags

The app already has all necessary meta tags in `app/layout.tsx`. You just need to:
1. Generate the splash screen images
2. Place them in `/public` folder
3. Update the `href` paths in the meta tags if using custom filenames

