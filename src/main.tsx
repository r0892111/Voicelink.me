import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './i18n';
import App from './App.tsx';
import './index.css';
import { initializeUTMTracking } from './utils/utm';

// Handle client-side routing for GitHub Pages and similar static hosts
if (typeof window !== 'undefined') {
  const search = window.location.search;
  if (search) {
    const q = new URLSearchParams(search);
    const path = q.get('/');
    if (path) {
      const newUrl = window.location.pathname + path.replace(/~and~/g, '&') + window.location.hash;
      window.history.replaceState(null, '', newUrl);
    }
  }
}

// Initialize UTM tracking
initializeUTMTracking();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
