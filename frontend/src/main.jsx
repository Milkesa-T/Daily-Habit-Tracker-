import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerServiceWorker, requestNotificationPermission } from './services/notifications.js'

// Register service worker and request notification permission
registerServiceWorker().then(() => {
  requestNotificationPermission();
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
