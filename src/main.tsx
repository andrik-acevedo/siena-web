// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// ---------------- Mount React ----------------
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// ---------------- PWA: Service Worker registration ----------------
// Avoid registering on StackBlitz/WebContainer and only register when supported.
// Also require secure context (https) unless on localhost.
const isSupported = 'serviceWorker' in navigator && window.isSecureContext;
const isUnsupportedHost =
  typeof location !== 'undefined' &&
  /stackblitz|webcontainer|local-credentialless/i.test(location.hostname);
const isLocalhost =
  typeof location !== 'undefined' &&
  (location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1' ||
    location.hostname.endsWith('.local'));

// Only register in production or localhost (dev) and when not on unsupported hosts.
if (isSupported && !isUnsupportedHost && (import.meta.env.PROD || isLocalhost)) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        // If a new SW is installed, ask it to activate immediately.
        reg.addEventListener('updatefound', () => {
          const newSW = reg.installing;
          if (!newSW) return;
          newSW.addEventListener('statechange', () => {
            if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
              reg.waiting?.postMessage('SKIP_WAITING');
            }
          });
        });
      })
      .catch((err) => {
        console.info('Service Worker registration failed or was skipped:', err);
      });
  });

  // Reload the page exactly once when the new SW takes control.
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
} else {
  console.info('SW not registered (dev/unsupported host). This is expected on StackBlitz/WebContainer.');
}
