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

const STORAGE_KEY = 'scheduled-notifications';
const activeTimers = new Map();

function readScheduledNotifications() {
  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : {};
  } catch (error) {
    console.warn('Unable to read scheduled notifications:', error);
    return {};
  }
}

function writeScheduledNotifications(entries) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.warn('Unable to persist scheduled notifications:', error);
  }
}

function saveScheduledNotification(entry) {
  const entries = readScheduledNotifications();
  entries[String(entry.id)] = entry;
  writeScheduledNotifications(entries);
}

function removeScheduledNotification(id) {
  const entries = readScheduledNotifications();
  delete entries[String(id)];
  writeScheduledNotifications(entries);
}

function showNativeNotification({ title, body, id }) {
  const options = {
    body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: String(id),
    renotify: true,
    requireInteraction: true,
  };

  if (swRegistration?.showNotification) {
    return swRegistration.showNotification(title, options);
  }

  return new Notification(title, options);
}

function clearScheduledTimer(id) {
  const timerId = activeTimers.get(String(id));
  if (timerId) {
    clearTimeout(timerId);
    activeTimers.delete(String(id));
  }
}

function queueNotification(entry) {
  if (!entry?.id || !entry?.scheduledAt) return;

  clearScheduledTimer(entry.id);

  const delay = entry.scheduledAt - Date.now();
  if (delay <= 0) {
    activeTimers.delete(String(entry.id));
    void showNativeNotification(entry);
    removeScheduledNotification(entry.id);
    return;
  }

  const timerId = window.setTimeout(() => {
    void showNativeNotification(entry);
    activeTimers.delete(String(entry.id));
    removeScheduledNotification(entry.id);
  }, delay);

  activeTimers.set(String(entry.id), timerId);
}

/** Restore any pending notifications after a reload */
export function restoreScheduledNotifications() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const entries = readScheduledNotifications();
  Object.values(entries).forEach((entry) => queueNotification(entry));
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
    void showNativeNotification({ id, title, body });
    return;
  }

  saveScheduledNotification({ id, title, body, scheduledAt });
  queueNotification({ id, title, body, scheduledAt });

  console.log(`🔔 Notification scheduled for ${date} at ${time} — "${title}"`);
}

/** Cancel a scheduled notification by ID */
export function cancelNotification(id) {
  clearScheduledTimer(id);
  removeScheduledNotification(id);
}
