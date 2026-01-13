/**
 * Pre-build script to prevent trace file permission issues
 * Creates .next directory and trace file with proper permissions
 */

const fs = require('fs');
const path = require('path');

const nextDir = path.join(__dirname, '..', '.next');
const traceFile = path.join(nextDir, 'trace');

// Ensure .next directory exists
if (!fs.existsSync(nextDir)) {
  try {
    fs.mkdirSync(nextDir, { recursive: true });
    console.log('✅ Created .next directory');
  } catch (err) {
    console.warn(`⚠️  Could not create .next directory: ${err.message}`);
  }
}

// Create trace file with write permissions to prevent EPERM errors
if (!fs.existsSync(traceFile)) {
  try {
    // Create an empty trace file with write permissions
    fs.writeFileSync(traceFile, '', { flag: 'w' });
    console.log('✅ Created trace file with write permissions');
  } catch (err) {
    // If we can't create it, that's okay - Next.js will try to create it
    console.warn(`⚠️  Could not pre-create trace file: ${err.message}`);
  }
} else {
  // If trace file exists, make sure it's writable
  try {
    fs.chmodSync(traceFile, 0o666); // Read/write for all
    console.log('✅ Updated trace file permissions');
  } catch (err) {
    console.warn(`⚠️  Could not update trace file permissions: ${err.message}`);
  }
}

console.log('✨ Pre-build setup complete');

