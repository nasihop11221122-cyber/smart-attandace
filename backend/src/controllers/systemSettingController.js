import SystemSetting from '../models/SystemSetting.js';

// Get current system settings (open to all authenticated or client checks)
export const getSettings = async (req, res) => {
  try {
    let settings = await SystemSetting.findOne();
    if (!settings) {
      settings = await SystemSetting.create({
        emergencyMode: false,
        emergencyMessage: 'SYSTEM IS LOCKED BY SUPER ADMIN',
        activeTemplate: 'cyberpunk-neon',
        themeMode: 'dark',
      });
    }
    res.json({ settings });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving system settings', error: err.message });
  }
};

// Update system settings (Super Admin only)
export const updateSettings = async (req, res) => {
  try {
    const { emergencyMode, emergencyMessage, activeTemplate, themeMode } = req.body;

    let settings = await SystemSetting.findOne();
    if (!settings) {
      settings = new SystemSetting();
    }

    if (emergencyMode !== undefined) {
      const modeBool = Boolean(emergencyMode);
      if (modeBool && !settings.emergencyMode) {
        settings.emergencyLockedAt = new Date();
      } else if (!modeBool) {
        settings.emergencyLockedAt = null;
      }
      settings.emergencyMode = modeBool;
    }

    if (emergencyMessage !== undefined) {
      settings.emergencyMessage = String(emergencyMessage).trim() || 'SYSTEM IS LOCKED BY SUPER ADMIN';
    }

    if (activeTemplate !== undefined) {
      settings.activeTemplate = activeTemplate;
    }

    if (themeMode !== undefined) {
      settings.themeMode = themeMode;
    }

    if (req.user?._id) {
      settings.updatedBy = req.user._id;
    }

    await settings.save();

    res.json({
      message: 'System settings updated successfully',
      settings,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update system settings', error: err.message });
  }
};

