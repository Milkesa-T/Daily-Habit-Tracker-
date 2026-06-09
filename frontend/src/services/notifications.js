/**
 * Notification Service
 * Registers the service worker and provides helpers to schedule / cancel
 * timed notifications for tasks and habits.
 */

let swRegistration = null;

/** Register the service worker once at app startup */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers not supported in this browser.');
    return false;
  }
  try {
    swRegistration = await navigator.serviceWorker.register('/sw.js');
    console.log('✅ Service Worker registered:', swRegistration.scope);
    return true;
  } catch (err) {
    console.error('Service Worker registration failed:', err);
    return false;
  }
}

/** Request notification permission from the browser/OS */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  const result = await Notification.requestPermission();
  return result;
}

/**
 * Schedule a notification to fire at a specific datetime.
 * @param {object} opts
 * @param {string|number} opts.id       - Unique ID (task/habit id) for dedup
 * @param {string}        opts.title    - Notification headline
 * @param {string}        opts.body     - Notification body text
 * @param {string}        opts.date     - YYYY-MM-DD
 * @param {string}        opts.time     - HH:MM (24-hour)
 */
export function scheduleNotification({ id, title, body, date, time }) {
  if (!date || !time) return;
  if (Notification.permission !== 'granted') return;

  // Build a timestamp for today (or the given date) at the given time
  const [hours, minutes] = time.split(':').map(Number);
  const scheduledDate = new Date(date);
  scheduledDate.setHours(hours, minutes, 0, 0);
  const scheduledAt = scheduledDate.getTime();

  if (scheduledAt <= Date.now()) {
    console.log('Scheduled time is in the past — skipping notification.');
    return;
  }

  const sw = swRegistration?.active || navigator.serviceWorker.controller;
  if (!sw) {
    console.warn('No active service worker to post message to.');
    return;
  }

  sw.postMessage({
    type: 'SCHEDULE_NOTIFICATION',
    payload: { id, title, body, scheduledAt },
  });

  console.log(`🔔 Notification scheduled for ${date} at ${time} — "${title}"`);
}

/** Cancel a scheduled notification by ID */
export function cancelNotification(id) {
  const sw = swRegistration?.active || navigator.serviceWorker.controller;
  if (!sw) return;
  sw.postMessage({ type: 'CANCEL_NOTIFICATION', payload: { id } });
}
