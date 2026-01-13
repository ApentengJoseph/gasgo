/**
 * Script to generate iOS splash screen images
 * 
 * iOS requires splash screens to be exact device dimensions.
 * This script helps create proper splash screen images.
 * 
 * Requirements:
 * - sharp: npm install sharp --save-dev
 * 
 * Usage:
 * node scripts/generate-ios-splash.js
 */

const fs = require('fs');
const path = require('path');

// iOS device splash screen dimensions
const splashScreens = [
  // iPhone SE (320x568)
  { width: 640, height: 1136, name: 'iphone-se-splash.png', device: 'iPhone SE' },
  // iPhone 6/7/8 (375x667)
  { width: 750, height: 1334, name: 'iphone-6-7-8-splash.png', device: 'iPhone 6/7/8' },
  // iPhone 6/7/8 Plus (414x736)
  { width: 1242, height: 2208, name: 'iphone-6-7-8-plus-splash.png', device: 'iPhone 6/7/8 Plus' },
  // iPhone X/XS (375x812)
  { width: 1125, height: 2436, name: 'iphone-x-xs-splash.png', device: 'iPhone X/XS' },
  // iPhone XR (414x896)
  { width: 828, height: 1792, name: 'iphone-xr-splash.png', device: 'iPhone XR' },
  // iPhone XS Max (414x896)
  { width: 1242, height: 2688, name: 'iphone-xs-max-splash.png', device: 'iPhone XS Max' },
  // iPhone 12/13 mini (360x780)
  { width: 1080, height: 2340, name: 'iphone-12-13-mini-splash.png', device: 'iPhone 12/13 mini' },
  // iPhone 12/13/14 (390x844)
  { width: 1170, height: 2532, name: 'iphone-12-13-14-splash.png', device: 'iPhone 12/13/14' },
  // iPhone 12/13/14 Pro Max (428x926)
  { width: 1284, height: 2778, name: 'iphone-12-13-14-pro-max-splash.png', device: 'iPhone 12/13/14 Pro Max' },
  // iPad (768x1024)
  { width: 1536, height: 2048, name: 'ipad-splash.png', device: 'iPad' },
  // iPad Pro 10.5" (834x1112)
  { width: 1668, height: 2224, name: 'ipad-pro-10-5-splash.png', device: 'iPad Pro 10.5"' },
  // iPad Pro 11" (834x1194)
  { width: 1668, height: 2388, name: 'ipad-pro-11-splash.png', device: 'iPad Pro 11"' },
  // iPad Pro 12.9" (1024x1366)
  { width: 2048, height: 2732, name: 'ipad-pro-12-9-splash.png', device: 'iPad Pro 12.9"' },
];

// Background color from manifest
const backgroundColor = '#F9FAFB';

console.log('📱 iOS Splash Screen Generator');
console.log('================================\n');

console.log('This script generates iOS splash screen images.');
console.log('For now, it creates a guide. To generate actual images, you need:');
console.log('1. Install sharp: npm install sharp --save-dev');
console.log('2. Have a source icon image (apple-touch-icon.png)');
console.log('3. Uncomment the image generation code below\n');

console.log('Required splash screen sizes:\n');
splashScreens.forEach((screen, index) => {
  console.log(`${index + 1}. ${screen.device}: ${screen.width}x${screen.height}px (${screen.name})`);
});

console.log('\n📝 Instructions:');
console.log('1. Create splash screens with the icon centered on background color #F9FAFB');
console.log('2. Save them in the /public folder');
console.log('3. Update app/layout.tsx with the correct file paths');
console.log('\n💡 Tip: Use a tool like https://www.appicon.co/#image-sets or');
console.log('   https://realfavicongenerator.net/ to generate splash screens automatically.\n');

// // Uncomment below if you have sharp installed

const sharp = require('sharp');

async function generateSplashScreens() {
  const publicDir = path.join(process.cwd(), 'public');
  const iconPath = path.join(publicDir, 'apple-touch-icon.png');
  
  if (!fs.existsSync(iconPath)) {
    console.error('❌ Error: apple-touch-icon.png not found in public folder');
    return;
  }

  console.log('🖼️  Generating splash screens...\n');

  for (const screen of splashScreens) {
    try {
      // Read the icon
      const icon = await sharp(iconPath);
      const iconMetadata = await icon.metadata();
      
      // Calculate icon size (80% of smaller dimension)
      const maxIconSize = Math.min(screen.width, screen.height) * 0.8;
      const iconSize = Math.min(maxIconSize, iconMetadata.width || 180);
      
      // Resize icon
      const resizedIcon = await icon
        .resize(Math.round(iconSize), Math.round(iconSize), {
          fit: 'contain',
          background: { r: 249, g: 250, b: 251, alpha: 0 }
        })
        .toBuffer();
      
      // Create splash screen with background color
      const splash = await sharp({
        create: {
          width: screen.width,
          height: screen.height,
          channels: 4,
          background: { r: 249, g: 250, b: 251 }
        }
      })
        .composite([{
          input: resizedIcon,
          top: Math.round((screen.height - iconSize) / 2),
          left: Math.round((screen.width - iconSize) / 2)
        }])
        .png()
        .toFile(path.join(publicDir, screen.name));
      
      console.log(`✅ Generated: ${screen.name} (${screen.device})`);
    } catch (error) {
      console.error(`❌ Error generating ${screen.name}:`, error.message);
    }
  }
  
  console.log('\n✨ Done! Splash screens generated in /public folder');
}

// Run if sharp is available
if (require.resolve('sharp')) {
  generateSplashScreens().catch(console.error);
}


