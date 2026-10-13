import mongoose from 'mongoose';

const systemSettingSchema = new mongoose.Schema(
  {
    emergencyMode: {
      type: Boolean,
      default: false,
    },
    emergencyMessage: {
      type: String,
      default: 'SYSTEM IS LOCKED BY SUPER ADMIN',
      trim: true,
      maxlength: 300,
    },
    emergencyLockedAt: {
      type: Date,
      default: null,
    },
    activeTemplate: {
      type: String,
      enum: [
        'executive-slate',
        'cyberpunk-neon',
        'emerald-glass',
        'obsidian-gold',
        'oceanic-sapphire',
        'crimson-sunset',
        'arctic-aurora',
        'amethyst-majesty',
        'carbon-monolith',
        'retro-amber',
      ],
      default: 'cyberpunk-neon',
    },
    themeMode: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'dark',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export default mongoose.model('SystemSetting', systemSettingSchema);

