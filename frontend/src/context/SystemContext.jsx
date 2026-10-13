import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

export const TEMPLATES = [
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    accent: '#00f0ff',
    secondary: '#ff007f',
    bgDark: '#080915',
    bgLight: '#f0fdf4',
    description: 'High-tech neon cyan and magenta accents with electric cyber HUD vibes.',
    tag: 'Ultra Cyber',
  },
  {
    id: 'executive-slate',
    name: 'Executive Slate',
    accent: '#6366f1',
    secondary: '#38bdf8',
    bgDark: '#0b0f19',
    bgLight: '#f3f4f6',
    description: 'Corporate precision with indigo highlights and crisp modern borders.',
    tag: 'Professional',
  },
  {
    id: 'emerald-glass',
    name: 'Emerald Glass',
    accent: '#10b981',
    secondary: '#34d399',
    bgDark: '#03140e',
    bgLight: '#f0fdf4',
    description: 'Deep rainforest emerald with frosted mint glassmorphism.',
    tag: 'Organic Glass',
  },
  {
    id: 'obsidian-gold',
    name: 'Obsidian & Gold',
    accent: '#f59e0b',
    secondary: '#fbbf24',
    bgDark: '#09090b',
    bgLight: '#fefce8',
    description: 'Royal onyx black infused with lustrous polished gold accents.',
    tag: 'Prestige',
  },
  {
    id: 'oceanic-sapphire',
    name: 'Oceanic Sapphire',
    accent: '#3b82f6',
    secondary: '#06b6d4',
    bgDark: '#030b1c',
    bgLight: '#f0f7ff',
    description: 'Deep oceanic abyss blue with electric sapphire energy.',
    tag: 'Modern Tech',
  },
  {
    id: 'crimson-sunset',
    name: 'Crimson Sunset',
    accent: '#f43f5e',
    secondary: '#fb923c',
    bgDark: '#14050a',
    bgLight: '#fff1f2',
    description: 'Dynamic gradient of scarlet rose and twilight sunset coral.',
    tag: 'Dynamic Rose',
  },
  {
    id: 'arctic-aurora',
    name: 'Arctic Aurora',
    accent: '#14b8a6',
    secondary: '#38bdf8',
    bgDark: '#041017',
    bgLight: '#f0fdfa',
    description: 'Glacial frost tones with glowing northern lights teal.',
    tag: 'Clean Minimal',
  },
  {
    id: 'amethyst-majesty',
    name: 'Amethyst Majesty',
    accent: '#a855f7',
    secondary: '#ec4899',
    bgDark: '#0e061c',
    bgLight: '#faf5ff',
    description: 'Majestic deep purple with neon violet & lilac highlights.',
    tag: 'Royal Glow',
  },
  {
    id: 'carbon-monolith',
    name: 'Carbon Monolith',
    accent: '#f5f5f5',
    secondary: '#737373',
    bgDark: '#0a0a0a',
    bgLight: '#f4f4f5',
    description: 'Matte carbon minimalism with ultra-high contrast titanium accents.',
    tag: 'Architectural',
  },
  {
    id: 'retro-amber',
    name: 'Retro Amber CRT',
    accent: '#f59e0b',
    secondary: '#84cc16',
    bgDark: '#0a0802',
    bgLight: '#fefce8',
    description: 'Vintage monochrome amber terminal with glowing phosphor CRT aesthetic.',
    tag: 'Terminal Classic',
  },
];

const SystemContext = createContext(null);

export function SystemProvider({ children }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    emergencyMode: false,
    emergencyMessage: 'SYSTEM IS LOCKED BY SUPER ADMIN',
    activeTemplate: 'cyberpunk-neon',
    themeMode: 'dark',
    emergencyLockedAt: null,
  });
  const [previewEmergency, setPreviewEmergency] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch settings from server
  const fetchSettings = useCallback(async () => {
    try {
      const res = await api.get('/system/settings');
      if (res.data?.settings) {
        setSettings((prev) => ({
          ...prev,
          ...res.data.settings,
        }));
      }
    } catch {
      // Keep offline/default settings if backend error
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll settings every 5 seconds for real-time emergency sync across all clients
  useEffect(() => {
    fetchSettings();
    const interval = setInterval(fetchSettings, 5000);
    return () => clearInterval(interval);
  }, [fetchSettings]);

  // Apply template & themeMode to HTML root
  useEffect(() => {
    const template = settings.activeTemplate || 'cyberpunk-neon';
    const theme = settings.themeMode || 'dark';

    document.documentElement.setAttribute('data-template', template);
    document.documentElement.setAttribute('data-theme', theme);
  }, [settings.activeTemplate, settings.themeMode]);

  // Super Admin updates settings
  const updateSystemSettings = async (newValues) => {
    const res = await api.put('/system/settings', newValues);
    if (res.data?.settings) {
      setSettings((prev) => ({
        ...prev,
        ...res.data.settings,
      }));
    }
    return res.data;
  };

  // Toggle theme mode (Dark / Light)
  const toggleThemeMode = async () => {
    const nextMode = settings.themeMode === 'dark' ? 'light' : 'dark';
    // If super admin, save globally
    if (user?.role === 'super_admin') {
      try {
        await updateSystemSettings({ themeMode: nextMode });
      } catch {
        setSettings((prev) => ({ ...prev, themeMode: nextMode }));
      }
    } else {
      setSettings((prev) => ({ ...prev, themeMode: nextMode }));
    }
  };

  // Select active template (Super Admin)
  const setActiveTemplate = async (templateId) => {
    await updateSystemSettings({ activeTemplate: templateId });
  };

  // Toggle emergency kill switch
  const setEmergencyMode = async (enabled, customMessage) => {
    const payload = { emergencyMode: enabled };
    if (customMessage) payload.emergencyMessage = customMessage;
    await updateSystemSettings(payload);
  };

  return (
    <SystemContext.Provider
      value={{
        emergencyMode: settings.emergencyMode,
        emergencyMessage: settings.emergencyMessage,
        emergencyLockedAt: settings.emergencyLockedAt,
        activeTemplate: settings.activeTemplate || 'cyberpunk-neon',
        themeMode: settings.themeMode || 'dark',
        previewEmergency,
        setPreviewEmergency,
        updateSystemSettings,
        setActiveTemplate,
        setEmergencyMode,
        toggleThemeMode,
        loading,
        templates: TEMPLATES,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
}

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};

