/**
 * Script to stub API route functions that use missing imports
 */

const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '..', 'app', 'api');

function stubRouteFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Check if file has commented imports but still uses the functions
  const hasCommentedImports = /\/\/ import.*@\/lib/.test(content);
  const usesPrisma = /prisma\./.test(content);
  const usesAuth = /authenticateRequest|optionalAuth/.test(content);
  const usesMissingUtils = /(verifyOTP|createOTP|sendOTPSMS|sendOTPEmail|generateToken|createNotification|initializePaystackPayment|verifyPaystackPayment|verifyPaystackWebhook|calculateETA|generateOrderNumber|calculateOrderTotal|calculateDeliveryFee|calculateSafekeepingFee|calculateDistance|isWithinServiceArea|validateCoupon|applyCoupon|markAllNotificationsAsRead)\(/.test(content);

  if (hasCommentedImports && (usesPrisma || usesAuth || usesMissingUtils)) {
    // Replace all export async function blocks with stubs
    content = content.replace(
      /export async function (GET|POST|PATCH|DELETE|PUT)\([^)]*\)\s*\{[\s\S]*?\n\s*\}/g,
      (match, method) => {
        // Extract function signature
        const signatureMatch = match.match(/export async function (GET|POST|PATCH|DELETE|PUT)\(([^)]*)\)/);
        if (!signatureMatch) return match;
        
        const params = signatureMatch[2];
        const isParams = params.includes('params');
        
        return `export async function ${method}(${params}) {
  // TODO: Implement when backend is ready
  return NextResponse.json(
    { error: 'Not implemented yet' },
    { status: 501 }
  );
}`;
      }
    );

    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

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

console.log('🔧 Stubbing API route functions...\n');

const apiFiles = getAllApiFiles(apiDir);
let stubbedCount = 0;

apiFiles.forEach(filePath => {
  try {
    if (stubRouteFile(filePath)) {
      console.log(`✅ Stubbed: ${path.relative(apiDir, filePath)}`);
      stubbedCount++;
    }
  } catch (error) {
    console.error(`❌ Error stubbing ${filePath}:`, error.message);
  }
});

console.log(`\n✨ Stubbed ${stubbedCount} files`);

