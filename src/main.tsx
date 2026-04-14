import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

console.log('React and App imported');
const rootElement = document.getElementById('root');
console.log('Root element found:', !!rootElement);

if (rootElement) {
  console.log('Starting render...');
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  console.log('App rendered successfully');
} else {
  console.error('CRITICAL: Root element NOT found in DOM!');
}
