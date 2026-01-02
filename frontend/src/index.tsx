
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Root element not found");

// Register Service Worker for PWA Installation
// Using an absolute URL relative to the current location to prevent origin mismatch in sandboxed environments
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
  window.addEventListener('load', () => {
    const swUrl = new URL('./sw.js', window.location.href);
    
    navigator.serviceWorker.register(swUrl.href)
      .then(reg => console.log('Alcortex Neural Core: Service Worker Registered', reg.scope))
      .catch(err => {
        // Log as warning since Service Workers are often restricted in specific preview environments
        console.warn('Alcortex Neural Core: Service Worker Registration skipped or failed. This is expected in some sandboxed environments.', err);
      });
  });
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);