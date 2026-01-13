/**
 * Script to generate PWA icons from a source image
 * 
 * Usage:
 * 1. Place a source icon (icon.png or icon.svg) in the public folder
 * 2. Install sharp: npm install --save-dev sharp
 * 3. Run: node scripts/generate-icons.js
 * 
 * Or use an online tool like https://realfavicongenerator.net/
 * or https://www.pwabuilder.com/imageGenerator
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = path.join(__dirname, '..', 'public');
const sourceIcon = path.join(publicDir, 'icon-source.png'); // You'll need to add this

async function generateIcons() {
  // Check if source icon exists
  if (!fs.existsSync(sourceIcon)) {
    console.log('⚠️  Source icon not found. Please add icon-source.png to the public folder.');
    console.log('📝 You can create one using:');
    console.log('   - Online tools: https://realfavicongenerator.net/');
    console.log('   - Or generate placeholder icons using the createPlaceholderIcons function');
    return;
  }

  console.log('🔄 Generating PWA icons...');

  for (const size of sizes) {
    try {
      const outputPath = path.join(publicDir, `icon-${size}x${size}.png`);
      await sharp(sourceIcon)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 15, g: 76, b: 129, alpha: 1 } // #0F4C81 (brand-deep-blue)
        })
        .png()
        .toFile(outputPath);
      console.log(`✅ Generated icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Error generating icon-${size}x${size}.png:`, error.message);
    }
  }

  console.log('✨ Icon generation complete!');
}

// Generate placeholder icons with brand color
async function createPlaceholderIcons() {
  console.log('🔄 Creating placeholder icons...');

  for (const size of sizes) {
    try {
      const outputPath = path.join(publicDir, `icon-${size}x${size}.png`);
      await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 15, g: 76, b: 129, alpha: 1 } // #0F4C81
        }
      })
        .composite([
          {
            input: Buffer.from(`
              <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
                <rect width="${size}" height="${size}" fill="#0F4C81"/>
                <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">G</text>
              </svg>
            `),
            top: 0,
            left: 0
          }
        ])
        .png()
        .toFile(outputPath);
      console.log(`✅ Created placeholder icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Error creating placeholder icon-${size}x${size}.png:`, error.message);
    }
  }

  console.log('✨ Placeholder icons created!');
}

// Run the appropriate function
if (fs.existsSync(sourceIcon)) {
  generateIcons();
} else {
  createPlaceholderIcons();
}

