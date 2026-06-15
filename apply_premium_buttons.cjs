const fs = require('fs');
const path = require('path');

const dashboardDir = path.join(__dirname, 'src');

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Update regular <button> tags
  content = content.replace(/<button([^>]*?)className=["']([^"']+)["']([^>]*?)>/g, (match, p1, classes, p3) => {
    return `<button${p1}className="${transformClasses(classes)}"${p3}>`;
  });

  // 2. Update <motion.button> tags
  content = content.replace(/<motion\.button([^>]*?)className=["']([^"']+)["']([^>]*?)>/g, (match, p1, classes, p3) => {
    return `<motion.button${p1}className="${transformClasses(classes)}"${p3}>`;
  });

  // 3. Update Sidebar items (which might be motion.button or div)
  // Let's just do it broadly for anything that has "rounded-full" and "px-5" or similar that we changed.
  // Actually, wait, doing it inside className attributes globally is safer but might hit non-buttons.
  // Let's stick to <button and <motion.button. The sidebar uses motion.button.
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', path.basename(filePath));
  }
}

function transformClasses(classes) {
  let newClasses = classes;

  // Shape: rounded-full or rounded-md -> rounded-2xl
  newClasses = newClasses.replace(/\brounded-full\b/g, 'rounded-2xl');
  newClasses = newClasses.replace(/\brounded-md\b/g, 'rounded-2xl');

  // Text: font-medium -> font-bold uppercase tracking-wider
  if (newClasses.includes('font-medium')) {
    newClasses = newClasses.replace(/\bfont-medium\b/g, 'font-bold uppercase tracking-wider');
  } else if (!newClasses.includes('font-bold') && !newClasses.includes('font-black')) {
    newClasses += ' font-bold uppercase tracking-wider';
  } else {
    if (!newClasses.includes('uppercase')) newClasses += ' uppercase';
    if (!newClasses.includes('tracking-wider') && !newClasses.includes('tracking-widest')) newClasses += ' tracking-wider';
  }

  // Size: text-sm -> text-xs
  newClasses = newClasses.replace(/\btext-sm\b/g, 'text-xs');

  // Padding: px-5 py-2 or px-4 py-2 -> px-6 py-3
  newClasses = newClasses.replace(/\bpx-5 py-2\.5\b/g, 'px-6 py-3');
  newClasses = newClasses.replace(/\bpx-5 py-2\b/g, 'px-6 py-3');
  newClasses = newClasses.replace(/\bpx-4 py-2\b/g, 'px-6 py-3');

  // Add glowing shadow if it has a background color
  if (!newClasses.includes('shadow-lg')) {
    if (newClasses.includes('bg-blue-600')) {
      newClasses += ' shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40';
    } else if (newClasses.includes('bg-emerald-600')) {
      newClasses += ' shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/40';
    } else if (newClasses.includes('bg-red-500/10')) {
      newClasses += ' shadow-lg shadow-red-500/10 hover:shadow-xl hover:shadow-red-500/20';
    } else if (newClasses.includes('bg-slate-800')) {
      newClasses += ' shadow-lg shadow-slate-900/50 hover:shadow-xl hover:shadow-slate-900/60';
    }
  }

  // Ensure transition-all
  if (!newClasses.includes('transition-all') && !newClasses.includes('transition-colors')) {
    newClasses += ' transition-all';
  } else {
    newClasses = newClasses.replace(/\btransition-colors\b/g, 'transition-all');
  }

  // Cleanup extra spaces
  newClasses = newClasses.replace(/\s+/g, ' ').trim();

  return newClasses;
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

// Process components and pages
processDirectory(path.join(dashboardDir, 'pages', 'admin'));
processDirectory(path.join(dashboardDir, 'components', 'admin'));
console.log('Done.');
