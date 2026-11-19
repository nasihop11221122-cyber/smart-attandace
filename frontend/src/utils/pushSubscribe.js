/**
 * Smart Attendance — Push Notification Subscription Utility
 *
 * Usage (call once after student logs in):
 *   import { initPushNotifications } from '@/utils/pushSubscribe';
 *   await initPushNotifications();
 */

const PUSH_API = '/api/push';

/** Convert base64url VAPID public key to Uint8Array (browser needs this format) */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

/** Fetch the server's VAPID public key */
async function fetchVapidKey() {
  const res = await fetch(`${PUSH_API}/vapid-public-key`, {
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
  });
  if (!res.ok) throw new Error('VAPID key unavailable');
  const { publicKey } = await res.json();
  return publicKey;
}

/** Save the subscription object on the server */
async function saveSubscription(subscription) {
  const sub = subscription.toJSON();
  await fetch(`${PUSH_API}/subscribe`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify({
      endpoint: sub.endpoint,
      keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
    }),
  });
}

/**
 * Remove a subscription from the server when user revokes permission.
 * @param {string} endpoint
 */
export async function removePushSubscription(endpoint) {
  await fetch(`${PUSH_API}/unsubscribe`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify({ endpoint }),
  });
}

/**
 * Main entry point.
 * - Registers the Service Worker
 * - Requests notification permission
 * - Subscribes the browser and saves it on the server
 *
 * Safe to call multiple times — does nothing if already subscribed.
 */
export async function initPushNotifications() {
  // Push only works in browsers that support it
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  try {
    // 1. Register (or reuse) the Service Worker
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });

    // 2. Ask for permission (only shown once; afterwards returns cached answer)
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    // 3. Check if already subscribed — no need to re-subscribe
    const existing = await reg.pushManager.getSubscription();
    if (existing) {
      // Silently ensure it's saved on the server (handles page refreshes)
      await saveSubscription(existing).catch(() => {});
      return;
    }

    // 4. Get VAPID public key from our backend
    const vapidKey = await fetchVapidKey();

    // 5. Create new subscription
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });

    // 6. Save on backend
    await saveSubscription(subscription);
  } catch (err) {
    // Non-fatal — push is a bonus feature; don't crash the app
    console.warn('Push notification setup failed:', err.message);
  }
}
