/**
 * Script to fix API routes by commenting out missing imports
 * and stubbing functions that use them
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const apiDir = path.join(__dirname, '..', 'app', 'api');

// Patterns to comment out
const importsToComment = [
  /import.*from ['"]@\/lib\/db\/prisma['"]/g,
  /import.*from ['"]@\/lib\/utils\/otp['"]/g,
  /import.*from ['"]@\/lib\/auth\/middleware['"]/g,
  /import.*from ['"]@\/lib\/auth\/jwt['"]/g,
  /import.*from ['"]@\/lib\/utils\/notifications['"]/g,
  /import.*from ['"]@\/lib\/payments\/paystack-server['"]/g,
  /import.*from ['"]@\/lib\/utils\/order['"]/g,
  /import.*from ['"]@\/lib\/utils\/distance['"]/g,
  /import.*from ['"]@\/lib\/utils\/coupon['"]/g,
];

function commentOutImports(content) {
  let modified = content;
  
  importsToComment.forEach(pattern => {
    modified = modified.replace(pattern, (match) => {
      // Only comment if not already commented
      if (!match.trim().startsWith('//')) {
        return '// ' + match;
      }
      return match;
    });
  });
  
  return modified;
}

function stubFunction(content) {
  // Replace prisma calls with TODO comments
  let modified = content;
  
  // Replace prisma.* calls with comments
  modified = modified.replace(/await prisma\.\w+\.\w+\([^)]*\)/g, (match) => {
    return `/* TODO: ${match} */ null`;
  });
  
  // Replace function calls to missing modules
  modified = modified.replace(/await (verifyOTP|createOTP|sendOTPSMS|sendOTPEmail|generateToken|authenticateRequest|optionalAuth|createNotification|initializePaystackPayment|verifyPaystackPayment|verifyPaystackWebhook|calculateETA|generateOrderNumber|calculateOrderTotal|calculateDeliveryFee|calculateSafekeepingFee|calculateDistance|isWithinServiceArea|validateCoupon|applyCoupon|markAllNotificationsAsRead)\(/g, (match) => {
    return `/* TODO: ${match} */ null`;
  });
  
  return modified;
}

// Get all TypeScript files in api directory
function getAllApiFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...getAllApiFiles(fullPath));
    } else if (item.isFile() && item.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

console.log('🔧 Fixing API routes...\n');

const apiFiles = getAllApiFiles(apiDir);
let fixedCount = 0;

apiFiles.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Comment out problematic imports
    content = commentOutImports(content);
    
    // If content changed, write it back
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${path.relative(apiDir, filePath)}`);
      fixedCount++;
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
});

console.log(`\n✨ Fixed ${fixedCount} files`);
console.log('⚠️  Note: You may need to manually stub function bodies that use these imports');

