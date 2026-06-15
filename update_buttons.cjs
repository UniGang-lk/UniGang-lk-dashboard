const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'pages', 'admin');

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // We want to find button classNames.
  // We can just globally replace certain tailwind classes that make buttons look "aggressive"
  // But we have to be careful not to replace them in other tags like span or div.
  // A safer way is to match <button ... className="...".
  
  content = content.replace(/<button([^>]*?)className=["']([^"']+)["']([^>]*?)>/g, (match, p1, classes, p3) => {
    let newClasses = classes;

    // Remove aggressive uppercase/tracking/text size
    newClasses = newClasses.replace(/\buppercase\b/g, '');
    newClasses = newClasses.replace(/\btracking-widest\b/g, '');
    newClasses = newClasses.replace(/\btracking-tighter\b/g, '');
    newClasses = newClasses.replace(/\btext-xs\b/g, 'text-sm');
    newClasses = newClasses.replace(/\btext-\[10px\]\b/g, 'text-sm');
    newClasses = newClasses.replace(/\btext-\[9px\]\b/g, 'text-sm');
    newClasses = newClasses.replace(/\btext-\[11px\]\b/g, 'text-sm');
    newClasses = newClasses.replace(/\bfont-black\b/g, 'font-medium');
    newClasses = newClasses.replace(/\bfont-bold\b/g, 'font-medium');

    // Remove massive paddings and roundedness for block buttons, replace with normal
    if (newClasses.includes('py-4') || newClasses.includes('py-3')) {
      newClasses = newClasses.replace(/\bpy-4\b/g, 'py-2 px-4');
      newClasses = newClasses.replace(/\bpy-3\b/g, 'py-2 px-4');
    }

    // Replace rounded-2xl, rounded-xl with rounded-md
    newClasses = newClasses.replace(/\brounded-2xl\b/g, 'rounded-md');
    newClasses = newClasses.replace(/\brounded-xl\b/g, 'rounded-md');

    // Remove shadows for a flatter clean look
    newClasses = newClasses.replace(/\bshadow-lg\b/g, '');
    newClasses = newClasses.replace(/\bshadow-\S+\/20\b/g, '');

    // The toaster 'Cancel' button has bg-white/5 which is too dark. Make it a visible outline or secondary.
    if (newClasses.includes('bg-white/5') && newClasses.includes('text-slate-300')) {
      newClasses = newClasses.replace(/\bbg-white\/5\b/g, 'bg-slate-800');
      newClasses = newClasses.replace(/\bhover:bg-white\/10\b/g, 'hover:bg-slate-700');
    }

    // Replace hover:scale-[1.02] because standard buttons don't scale wildly
    newClasses = newClasses.replace(/\bhover:scale-\[1\.02\]\b/g, '');

    // Cleanup extra spaces
    newClasses = newClasses.replace(/\s+/g, ' ').trim();

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
