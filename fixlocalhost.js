const fs = require('fs');
const path = require('path');

const clientSrcPath = path.join(__dirname, 'frontend/src/components');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  
  // Replace various localhost patterns
  const patterns = [
    ['http://localhost:5001', ''],
    ['https://localhost:5001', ''],
    ['localhost:5001', '']
  ];
  
  patterns.forEach(([find, replace]) => {
    if (content.includes(find)) {
      content = content.replace(new RegExp(find, 'g'), replace);
      updated = true;
    }
  });
  
  if (updated) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${path.relative(__dirname, filePath)}`);
    return true;
  }
  
  return false;
}

function scanDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  let fixedCount = 0;
  
  items.forEach(item => {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      fixedCount += scanDirectory(fullPath);
    } else if (item.endsWith('.js') || item.endsWith('.jsx')) {
      if (fixFile(fullPath)) {
        fixedCount++;
      }
    }
  });
  
  return fixedCount;
}

console.log('🚀 Fixing localhost:5001 references...');
const totalFixed = scanDirectory(clientSrcPath);
console.log(`✅ Fixed ${totalFixed} files!`);