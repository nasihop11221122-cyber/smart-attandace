import webpush from 'web-push';
import { env } from '../config/env.js';
import PushSubscription from '../models/PushSubscription.js';

// Configure VAPID once at module load
if (env.vapid.publicKey && env.vapid.privateKey) {
  webpush.setVapidDetails(
    env.vapid.subject,
    env.vapid.publicKey,
    env.vapid.privateKey
  );
}

/**
 * Send a push notification to ALL subscribed browsers of a user.
 *
 * @param {string|ObjectId} userId   - The User._id of the recipient
 * @param {{ title: string, body: string, icon?: string, url?: string }} payload
 */
export const sendPushToUser = async (userId, payload) => {
  if (!env.vapid.publicKey) return; // VAPID not configured — skip silently

  const subscriptions = await PushSubscription.find({ userId });
  if (!subscriptions.length) return;

  const notification = JSON.stringify({
    title: payload.title,
    body:  payload.body,
    icon:  payload.icon  || '/logo192.png',
    badge: '/logo192.png',
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
        // 410 Gone = subscription expired/revoked → remove it
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
 * Convenience: send absent alert to a student.
 * @param {string|ObjectId} userId
 * @param {{ name: string, courseName?: string, date: string }} info
 */
export const sendAbsentAlert = (userId, info) =>
  sendPushToUser(userId, {
    title: '⚠️ Absent Alert',
    body:  `${info.name}, you were marked absent${info.courseName ? ` in ${info.courseName}` : ''} on ${info.date}.`,
    url:   '/student/attendance',
  });
