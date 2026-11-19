import mongoose from 'mongoose';

/**
 * Stores browser push subscriptions for online (college) students.
 * One student can have multiple devices (browser tabs / phones).
 * Stale subscriptions are cleaned up automatically when a push fails.
 */
const pushSubscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    endpoint: { type: String, required: true },
    keys: {
      p256dh: { type: String, required: true },
      auth:   { type: String, required: true },
    },
  },
  { timestamps: true }
);

// One endpoint can only belong to one user; endpoint is unique globally
pushSubscriptionSchema.index({ endpoint: 1 }, { unique: true });
// Fast lookup: give me all subscriptions of this student
pushSubscriptionSchema.index({ userId: 1 });

export default mongoose.model('PushSubscription', pushSubscriptionSchema);
