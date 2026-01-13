/**
 * Clean build script for Windows
 * Removes .next folder and PWA build files
 */

const fs = require('fs');
const path = require('path');

const dirsToClean = [
  path.join(__dirname, '..', '.next'),
  path.join(__dirname, '..', 'public', 'sw.js'),
  path.join(__dirname, '..', 'public', 'sw.js.map'),
];

const filesToClean = [
  path.join(__dirname, '..', '.next', 'trace'),
];

function deleteFolderRecursive(folderPath) {
  if (!fs.existsSync(folderPath)) {
    return;
  }

  let deletedCount = 0;
  let errorCount = 0;

  try {
    const files = fs.readdirSync(folderPath);
    
    files.forEach((file) => {
      const curPath = path.join(folderPath, file);
      try {
        if (fs.lstatSync(curPath).isDirectory()) {
          deleteFolderRecursive(curPath);
        } else {
          fs.unlinkSync(curPath);
          deletedCount++;
        }
      } catch (err) {
        errorCount++;
        // Silently skip files that can't be deleted (likely locked)
      }
    });
    
    // Try to remove the directory, but don't fail if it's not empty
    try {
      fs.rmdirSync(folderPath);
      console.log(`✅ Cleaned: ${folderPath}`);
    } catch (err) {
      if (err.code === 'ENOTEMPTY') {
        // Directory not empty - some files are locked, but that's okay
        if (deletedCount > 0) {
          console.log(`⚠️  Partially cleaned: ${folderPath} (${deletedCount} files deleted, some files may be locked)`);
        }
      } else {
        throw err;
      }
    }
  } catch (err) {
    if (err.code !== 'ENOTEMPTY') {
      console.error(`❌ Error cleaning ${folderPath}: ${err.message}`);
      console.log('💡 Try closing VS Code, terminal, or any other processes using these files');
    }
  }
}

function deleteFile(filePath) {
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`✅ Cleaned: ${filePath}`);
    } catch (err) {
      console.warn(`Warning: Could not delete ${filePath}: ${err.message}`);
    }
  }
}

console.log('🧹 Cleaning build files...\n');

// Clean .next folder
deleteFolderRecursive(dirsToClean[0]);

// Clean PWA files
dirsToClean.slice(1).forEach(deleteFile);

// Clean workbox files
const publicDir = path.join(__dirname, '..', 'public');
if (fs.existsSync(publicDir)) {
  fs.readdirSync(publicDir).forEach((file) => {
    if (file.startsWith('workbox-') || file.startsWith('fallback-')) {
      deleteFile(path.join(publicDir, file));
    }
  });
}

// Clean specific files that might be locked
filesToClean.forEach(deleteFile);

console.log('\n✨ Cleanup complete! You can now run: npm run build');

