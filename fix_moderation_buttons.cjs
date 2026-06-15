const fs = require('fs');
const path = require('path');

const dashboardDir = path.join(__dirname, 'src', 'pages', 'admin');

const pages = ['BlogsPage.tsx', 'AnnexesPage.tsx', 'EventsPage.tsx', 'ServicesPage.tsx'];

const premiumCancel = 'px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-slate-900/50 hover:shadow-xl hover:shadow-slate-900/60';
const premiumConfirm = 'px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40';

pages.forEach(page => {
  const filePath = path.join(dashboardDir, page);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace Toaster Cancel Button
    content = content.replace(
      /<button\s+onClick=\{\(\) => toast\.dismiss\(t\.id\)\}\s+className=["'][^"']+["']\s*>/g,
      `<button onClick={() => toast.dismiss(t.id)} className="${premiumCancel}">`
    );
    // Some pages use hotToast
    content = content.replace(
      /<button\s+onClick=\{\(\) => hotToast\.dismiss\(t\.id\)\}\s+className=["'][^"']+["']\s*>/g,
      `<button onClick={() => hotToast.dismiss(t.id)} className="${premiumCancel}">`
    );

    // Replace Toaster Confirm Button
    content = content.replace(
      /<button\s+onClick=\{\(\) => \{\s+(?:toast|hotToast)\.dismiss\(t\.id\);\s+onConfirm\(\);\s+\}\}\s+className=["'][^"']+["']\s*>/g,
      (match) => {
        if (match.includes('toast.dismiss')) {
          return `<button onClick={() => { toast.dismiss(t.id); onConfirm(); }} className="${premiumConfirm}">`;
        } else {
          return `<button onClick={() => { hotToast.dismiss(t.id); onConfirm(); }} className="${premiumConfirm}">`;
        }
      }
    );

    // Now for the actual moderation buttons:
    // Approve
    content = content.replace(
      /<button\s+onClick=\{\(\) => handleStatusChange\([^,]+,\s*'approved'\)\}\s+className=["'][^"']+["']\s*>/g,
      (match) => {
        const idMatch = match.match(/handleStatusChange\(([^,]+),/);
        const id = idMatch ? idMatch[1] : 'id';
        return `<button onClick={() => handleStatusChange(${id}, 'approved')} className="px-6 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-105 transition-all">`;
      }
    );

    // Reject
    content = content.replace(
      /<button\s+onClick=\{\(\) => handleStatusChange\([^,]+,\s*'rejected'\)\}\s+className=["'][^"']+["']\s*>/g,
      (match) => {
        const idMatch = match.match(/handleStatusChange\(([^,]+),/);
        const id = idMatch ? idMatch[1] : 'id';
        return `<button onClick={() => handleStatusChange(${id}, 'rejected')} className="px-6 py-3 rounded-2xl bg-red-500/10 text-red-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-red-500/10 shadow-lg shadow-red-500/10 hover:shadow-xl hover:shadow-red-500/20 hover:bg-red-500/20 hover:scale-105 transition-all">`;
      }
    );

    // Revert to pending
    content = content.replace(
      /<button\s+onClick=\{\(\) => handleStatusChange\([^,]+,\s*'pending'\)\}\s+className=["'][^"']+["']\s*>/g,
      (match) => {
        const idMatch = match.match(/handleStatusChange\(([^,]+),/);
        const id = idMatch ? idMatch[1] : 'id';
        return `<button onClick={() => handleStatusChange(${id}, 'pending')} className="col-span-2 px-6 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-slate-900/50 hover:shadow-xl hover:shadow-slate-900/60 hover:bg-slate-700 hover:scale-105 transition-all">`;
      }
    );

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed buttons in', page);
  }
});
