const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'pages', 'admin');

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  content = content.replace(/<button([^>]*?)className=["']([^"']+)["']([^>]*?)>/g, (match, p1, classes, p3) => {
    let newClasses = classes;

    // Change to pill shape
    newClasses = newClasses.replace(/\brounded-md\b/g, 'rounded-full');
    newClasses = newClasses.replace(/\brounded-xl\b/g, 'rounded-full');
    newClasses = newClasses.replace(/\brounded-2xl\b/g, 'rounded-full');
    newClasses = newClasses.replace(/\brounded-\[2\.5rem\]\b/g, 'rounded-full');

    // Make padding a bit larger (px-5 py-2 or px-5 py-2.5) to match the pill aesthetic
    newClasses = newClasses.replace(/\bpx-4\b/g, 'px-5');
    // For smaller buttons, keep py-2 but px-5 is nice for pill.
    
    // Ensure font-medium
    newClasses = newClasses.replace(/\bfont-bold\b/g, 'font-medium');
    newClasses = newClasses.replace(/\bfont-black\b/g, 'font-medium');

    return `<button${p1}className="${newClasses}"${p3}>`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', path.basename(filePath));
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      updateFile(fullPath);
    }
  }
}

processDirectory(directoryPath);
console.log('Done.');
