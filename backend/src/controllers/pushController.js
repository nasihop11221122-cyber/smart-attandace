import PushSubscription from '../models/PushSubscription.js';
import { env } from '../config/env.js';

/**
 * GET /api/push/vapid-public-key
 * Returns the VAPID public key so the browser can build a subscription.
 */
export const getVapidKey = (_req, res) => {
  if (!env.vapid.publicKey) {
    return res.status(503).json({ message: 'Push notifications not configured' });
  }
  res.json({ publicKey: env.vapid.publicKey });
};

/**
 * POST /api/push/subscribe
 * Body: { endpoint, keys: { p256dh, auth } }
 * Saves or updates the subscription for the logged-in student.
 */
export const subscribe = async (req, res) => {
  const { endpoint, keys } = req.body;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ message: 'Invalid subscription object' });
  }

  await PushSubscription.findOneAndUpdate(
    { endpoint },
    { userId: req.user._id, endpoint, keys },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(201).json({ message: 'Subscribed successfully' });
};

/**
 * DELETE /api/push/unsubscribe
 * Body: { endpoint }
 * Removes a specific subscription (e.g. when user revokes permission).
 */
export const unsubscribe = async (req, res) => {
  const { endpoint } = req.body;
  if (!endpoint) return res.status(400).json({ message: 'Endpoint required' });

  await PushSubscription.deleteOne({ userId: req.user._id, endpoint });
  res.json({ message: 'Unsubscribed' });
};
