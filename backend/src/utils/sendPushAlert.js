import { env } from '../config/env.js';
import PushSubscription from '../models/PushSubscription.js';

/**
 * Lazy-load web-push so a missing/broken package never crashes the whole backend.
 * Returns null if the package is unavailable.
 */
let _webpush = null;
let _configured = false;

async function getWebPush() {
  if (_webpush) return _webpush;
  try {
    const mod = await import('web-push');
    _webpush = mod.default ?? mod;

    // Configure VAPID on first successful load
    if (!_configured && env.vapid.publicKey && env.vapid.privateKey) {
      _webpush.setVapidDetails(
        env.vapid.subject,
        env.vapid.publicKey,
        env.vapid.privateKey
      );
      _configured = true;
    }
    return _webpush;
  } catch (err) {
    console.warn('web-push unavailable — push notifications disabled:', err.message);
    return null;
  }
}

/**
 * Send a push notification to ALL subscribed browsers of a user.
 *
 * @param {string|ObjectId} userId
 * @param {{ title: string, body: string, icon?: string, url?: string }} payload
 */
export const sendPushToUser = async (userId, payload) => {
  if (!env.vapid.publicKey) return; // VAPID not configured — skip silently

  const webpush = await getWebPush();
  if (!webpush) return; // package not available — skip silently

  const subscriptions = await PushSubscription.find({ userId });
  if (!subscriptions.length) return;

  const notification = JSON.stringify({
    title: payload.title,
    body:  payload.body,
    icon:  payload.icon  || '/icon-192x192.png',
    badge: '/icon-192x192.png',
    url:   payload.url   || '/',
  });

  const staleIds = [];

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          notification
        );
      } catch (err) {
        // 410 Gone / 404 = subscription expired or revoked → clean up
        if (err.statusCode === 410 || err.statusCode === 404) {
          staleIds.push(sub._id);
        } else {
          console.error('Push send error:', err.message);
        }
      }
    })
  );

  if (staleIds.length) {
    await PushSubscription.deleteMany({ _id: { $in: staleIds } });
  }
};

/**
 * Convenience: absent alert for a student.
 * @param {string|ObjectId} userId
 * @param {{ name: string, courseName?: string, date: string }} info
 */
export const sendAbsentAlert = (userId, info) =>
  sendPushToUser(userId, {
    title: '⚠️ Absent Alert',
    body:  `${info.name}, you were marked absent${info.courseName ? ` in ${info.courseName}` : ''} on ${info.date}.`,
    url:   '/student/attendance',
  });
