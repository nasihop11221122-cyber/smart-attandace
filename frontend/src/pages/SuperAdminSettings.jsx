import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  ShieldAlert,
  ShieldCheck,
  Power,
  Palette,
  Eye,
  Check,
  Sun,
  Moon,
  Sparkles,
  Terminal,
  Languages,
  Sliders,
  Flame,
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { useLanguage } from '../context/LanguageContext';

export default function SuperAdminSettings() {
  const {
    emergencyMode,
    emergencyMessage,
    activeTemplate,
    themeMode,
    templates,
    updateSystemSettings,
    setActiveTemplate,
    setEmergencyMode,
    toggleThemeMode,
    setPreviewEmergency,
  } = useSystem();

  const { t, language, setLanguage, isRTL } = useLanguage();

  const [customMsg, setCustomMsg] = useState(emergencyMessage || 'SYSTEM IS OFF BY SUPER ADMIN');
  const [savingMsg, setSavingMsg] = useState(false);
  const [togglingEmergency, setTogglingEmergency] = useState(false);

  const handleToggleEmergency = async () => {
    setTogglingEmergency(true);
    try {
      const nextMode = !emergencyMode;
      await setEmergencyMode(nextMode, customMsg);
      if (nextMode) {
        toast.error('Emergency Lockdown is now ACTIVE across all systems!', {
          icon: '🚨',
        });
      } else {
        toast.success('Emergency Lockdown deactivated. System returned to normal.', {
          icon: '✅',
        });
      }
    } catch {
      toast.error('Could not communicate with system server');
    } finally {
      setTogglingEmergency(false);
    }
  };

  const handleSaveMessage = async (e) => {
    e.preventDefault();
    setSavingMsg(true);
    try {
      await updateSystemSettings({ emergencyMessage: customMsg });
      toast.success('Emergency lockdown message updated successfully');
    } catch {
      toast.error('Failed to update emergency message');
    } finally {
      setSavingMsg(false);
    }
  };

  const handleSelectTemplate = async (templateId) => {
    try {
      await setActiveTemplate(templateId);
      toast.success(`Template "${templateId}" applied across all dashboards!`, {
        icon: '🎨',
      });
    } catch {
      toast.error('Failed to apply template');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="h-6 w-6 text-[var(--primary)]" />
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-main)]">
              {t('systemSettings')}
            </h2>
          </div>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {t('systemSettingsSubtitle')}
          </p>
        </div>

        {/* Global Dark/Light Mode Switcher */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={toggleThemeMode}
            className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2 text-sm font-semibold text-[var(--text-main)] transition hover:border-[var(--border-focus)] shadow-sm"
          >
            {themeMode === 'dark' ? (
              <>
                <Sun className="h-4 w-4 text-amber-400" />
                <span>{t('lightMode')}</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-indigo-400" />
                <span>{t('darkMode')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SECTION 1: EMERGENCY KILL-SWITCH */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-2xl border-2 p-6 sm:p-8 transition-all ${
          emergencyMode
            ? 'border-red-500 bg-red-950/20 shadow-[0_0_35px_rgba(239,68,68,0.25)]'
            : 'border-[var(--border)] bg-[var(--bg-surface)]'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
                  emergencyMode
                    ? 'border-red-500 bg-red-500/20 text-red-400 animate-pulse'
                    : 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                }`}
              >
                {emergencyMode ? (
                  <ShieldAlert className="h-6 w-6" />
                ) : (
                  <ShieldCheck className="h-6 w-6" />
                )}
              </span>
              <div>
                <h3 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
                  <span>{t('emergencyMode')}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                      emergencyMode
                        ? 'bg-red-500 text-white'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {emergencyMode ? t('emergencyActive') : t('emergencyInactive')}
                  </span>
                </h3>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  {t('emergencyDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setPreviewEmergency(true)}
              className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm font-semibold text-[var(--text-main)] transition hover:border-[var(--border-focus)] hover:scale-105 active:scale-95"
            >
              <Eye className="h-4 w-4 text-[var(--primary)]" />
              <span>{t('previewEmergency')}</span>
            </button>

            <button
              onClick={handleToggleEmergency}
              disabled={togglingEmergency}
              className={`flex items-center gap-2.5 rounded-xl px-6 py-2.5 text-sm font-bold shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 ${
                emergencyMode
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/30'
                  : 'bg-red-600 text-white hover:bg-red-500 shadow-red-600/30'
              }`}
            >
              <Power className="h-4 w-4" />
              <span>
                {togglingEmergency
                  ? t('pleaseWait')
                  : emergencyMode
                  ? t('turnOffEmergency')
                  : t('turnOnEmergency')}
              </span>
            </button>
          </div>
        </div>

        {/* Emergency message configuration */}
        <form onSubmit={handleSaveMessage} className="mt-6 border-t border-[var(--border)] pt-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
            {t('emergencyMessageLabel')}
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              placeholder="e.g. SYSTEM IS OFF BY SUPER ADMIN"
              className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm text-[var(--text-main)] outline-none focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--border-focus)]/20"
            />
            <button
              type="submit"
              disabled={savingMsg}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-5 py-2.5 text-sm font-semibold text-[var(--text-main)] transition hover:border-[var(--border-focus)] disabled:opacity-50"
            >
              {savingMsg ? t('pleaseWait') : t('save')}
            </button>
          </div>
        </form>
      </motion.div>

      {/* SECTION 2: 10 ULTRA-WONDERFUL TEMPLATES */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
              <Palette className="h-5 w-5 text-[var(--primary)]" />
              <span>{t('templatesTitle')}</span>
            </h3>
            <p className="text-sm text-[var(--text-muted)]">
              {t('templatesSubtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)]">
            <span>MODE:</span>
            <span className="rounded-md bg-[var(--bg-elevated)] px-2 py-1 text-[var(--primary)] border border-[var(--border)]">
              {themeMode.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Templates Grid (10 Templates) */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {templates.map((tpl) => {
            const isActive = activeTemplate === tpl.id;
            return (
              <motion.div
                key={tpl.id}
                whileHover={{ y: -4, scale: 1.02 }}
                onClick={() => handleSelectTemplate(tpl.id)}
                className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 p-5 text-left cursor-pointer transition-all ${
                  isActive
                    ? 'border-[var(--primary)] bg-[var(--bg-elevated)] shadow-[0_0_25px_var(--glow)] ring-2 ring-[var(--primary)]/30'
                    : 'border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--border-focus)]'
                }`}
              >
                <div>
                  {/* Card Header with tag */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: `${tpl.accent}20`,
                        color: tpl.accent,
                        border: `1px solid ${tpl.accent}40`,
                      }}
                    >
                      {tpl.tag}
                    </span>

                    {isActive && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-extrabold text-white">
                        <Check className="h-3 w-3" />
                        {t('activeBadge')}
                      </span>
                    )}
                  </div>

                  <h4 className="mt-3 text-base font-bold text-[var(--text-main)]">
                    {tpl.name}
                  </h4>

                  <p className="mt-1 text-xs text-[var(--text-muted)] line-clamp-2">
                    {tpl.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--border)]">
                  {/* Swatches preview */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <div
                      className="h-4 w-4 rounded-full border border-black/20 shadow-sm"
                      style={{ backgroundColor: tpl.accent }}
                      title="Primary"
                    />
                    <div
                      className="h-4 w-4 rounded-full border border-black/20 shadow-sm"
                      style={{ backgroundColor: tpl.secondary }}
                      title="Secondary"
                    />
                    <div
                      className="h-4 w-4 rounded-full border border-black/20 shadow-sm"
                      style={{ backgroundColor: themeMode === 'dark' ? tpl.bgDark : tpl.bgLight }}
                      title="Background"
                    />
                  </div>

                  {/* Apply / Active button */}
                  <button
                    type="button"
                    className={`w-full rounded-xl py-2 text-xs font-bold transition ${
                      isActive
                        ? 'bg-[var(--primary)] text-[var(--primary-fg)] shadow-sm'
                        : 'border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-main)] hover:border-[var(--border-focus)]'
                    }`}
                  >
                    {isActive ? t('activeBadge') : t('selectTemplate')}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: SYSTEM LANGUAGE PREVIEW */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-elevated)] text-[var(--primary)] border border-[var(--border)]">
              <Languages className="h-5 w-5" />
            </span>
            <div>
              <h4 className="text-base font-bold text-[var(--text-main)]">
                {t('preferredLanguage')}
              </h4>
              <p className="text-xs text-[var(--text-muted)]">
                Users can also customize their individual language inside their Profile page.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {[
              { code: 'en', label: 'English', native: 'English' },
              { code: 'ar', label: 'Arabic', native: 'العربية' },
              { code: 'ur', label: 'Urdu', native: 'اردو' },
            ].map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => setLanguage(item.code)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  language === item.code
                    ? 'bg-[var(--primary)] text-[var(--primary-fg)] shadow-sm'
                    : 'border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-main)] hover:border-[var(--border-focus)]'
                }`}
              >
                {item.native}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

