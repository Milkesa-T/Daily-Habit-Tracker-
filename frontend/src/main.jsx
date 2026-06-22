import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import {
  registerServiceWorker,
  requestNotificationPermission,
  restoreScheduledNotifications,
} from "./services/notifications.js";

// Register service worker and request notification permission
registerServiceWorker().then(() => {
  requestNotificationPermission().then(() => {
    restoreScheduledNotifications();
  });
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
