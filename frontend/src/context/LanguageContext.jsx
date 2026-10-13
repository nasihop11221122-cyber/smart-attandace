import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

export const translations = {
  en: {
    // Navigation
    overview: 'Overview',
    principal: 'Principal',
    admin: 'Admin',
    teachers: 'Teachers',
    students: 'Students',
    classes: 'Classes',
    holidays: 'Holidays',
    history: 'History',
    attendance: 'Attendance',
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Log out',

    // Roles
    super_admin: 'Super Admin',
    principal_role: 'Principal',
    admin_role: 'Admin',
    teacher_role: 'Teacher',
    student_role: 'Student',

    // Settings
    systemSettings: 'System Settings & Control',
    systemSettingsSubtitle: 'Ultra master controls for emergency lockdown, global templates & design themes.',
    emergencyMode: 'Emergency Mode (Kill Switch)',
    emergencyDesc: 'When activated, all dashboards and screens are instantly locked with a secure hacker terminal screen.',
    emergencyActive: 'EMERGENCY LOCKDOWN ACTIVE',
    emergencyInactive: 'SYSTEM NORMAL / OPERATIONAL',
    turnOnEmergency: 'Activate Emergency Lockdown',
    turnOffEmergency: 'Deactivate Emergency',
    emergencyMessageLabel: 'Lockdown Display Message',
    saveSettings: 'Save Settings',
    previewEmergency: 'Preview Lockdown Screen',
    
    // Templates
    templatesTitle: 'Global Templates (10 Ultra-Wonderful Themes)',
    templatesSubtitle: 'Switching a template transforms all dashboards, inner pages, and components system-wide.',
    activeBadge: 'ACTIVE',
    selectTemplate: 'Apply Template',
    appearanceMode: 'Appearance Mode',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',

    // Profile
    preferredLanguage: 'System Language',
    languageSaved: 'Language preference saved successfully',
    name: 'Name',
    email: 'Email',
    password: 'Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    update: 'Update',
    save: 'Save',
    cancel: 'Cancel',
    role: 'Role',
    pleaseWait: 'Please wait…',

    // Emergency screen
    systemLocked: 'SYSTEM IS OFF BY SUPER ADMIN',
    lockdownSub: 'Security lockdown protocol has been initiated. All operations temporarily suspended.',
    systemCode: 'SECURITY PROTOCOL: LOCKDOWN-99',
    superAdminUnlock: 'Super Admin Override Unlock',
    confirmUnlock: 'Deactivate Lockdown',
    backToDashboard: 'Back to Dashboard',
  },

  ar: {
    // Navigation
    overview: 'نظرة عامة',
    principal: 'المدير',
    admin: 'المسؤول',
    teachers: 'المعلمون',
    students: 'الطلاب',
    classes: 'الفصول',
    holidays: 'العطلات',
    history: 'السجل',
    attendance: 'الحضور',
    profile: 'الملف الشخصي',
    settings: 'الإعدادات',
    logout: 'تسجيل الخروج',

    // Roles
    super_admin: 'المشرف العام',
    principal_role: 'المدير',
    admin_role: 'المسؤول',
    teacher_role: 'المعلم',
    student_role: 'الطالب',

    // Settings
    systemSettings: 'إعدادات النظام والتحكم العام',
    systemSettingsSubtitle: 'لوحة التحكم الشاملة لوضع الطوارئ واختيار القوالب العشرة والمظهر.',
    emergencyMode: 'وضع الطوارئ (الإغلاق الفوري)',
    emergencyDesc: 'عند التفعيل، يتم حظر وتعتيم جميع الشاشات فوراً وتحويلها لشاشة أمنية مظلمة.',
    emergencyActive: 'إغلاق الطوارئ مفعل حالياً',
    emergencyInactive: 'النظام يعمل بشكل طبيعي',
    turnOnEmergency: 'تفعيل إغلاق الطوارئ',
    turnOffEmergency: 'إلغاء وضع الطوارئ',
    emergencyMessageLabel: 'رسالة شاشة الطوارئ',
    saveSettings: 'حفظ الإعدادات',
    previewEmergency: 'معاينة شاشة الطوارئ',

    // Templates
    templatesTitle: 'قوالب النظام (10 تصاميم خارقة)',
    templatesSubtitle: 'اختيار أي قالب يغير نمط جميع لوحات التحكم والصفحات في النظام بالكامل.',
    activeBadge: 'مفعّل',
    selectTemplate: 'تطبيق القالب',
    appearanceMode: 'نمط المظهر',
    darkMode: 'الوضع الليلي',
    lightMode: 'الوضع النهاري',

    // Profile
    preferredLanguage: 'لغة الواجهة',
    languageSaved: 'تم حفظ تفضيل اللغة بنجاح',
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    currentPassword: 'كلمة المرور الحالية',
    newPassword: 'كلمة المرور الجديدة',
    update: 'تحديث',
    save: 'حفظ',
    cancel: 'إلغاء',
    role: 'الدور / الصلاحية',
    pleaseWait: 'يرجى الانتظار…',

    // Emergency screen
    systemLocked: 'تم إيقاف النظام بواسطة المشرف العام',
    lockdownSub: 'تم تفعيل بروتوكول الإغلاق الأمني الشامل. تم تعليق كافة العمليات مؤقتاً.',
    systemCode: 'بروتوكول الأمان: الإغلاق الشامل-99',
    superAdminUnlock: 'تجاوز القفل (للمشرف العام)',
    confirmUnlock: 'إلغاء القفل واستئناف العمل',
    backToDashboard: 'العودة للوحة التحكم',
  },

  ur: {
    // Navigation
    overview: 'جائزہ',
    principal: 'پرنسپل',
    admin: 'ایڈمن',
    teachers: 'اساتذہ',
    students: 'طلباء',
    classes: 'کلاسز',
    holidays: 'تعطیلات',
    history: 'ہسٹری',
    attendance: 'حاضری',
    profile: 'پروفائل',
    settings: 'ترتیبات',
    logout: 'لاگ آؤٹ',

    // Roles
    super_admin: 'سپر ایڈمن',
    principal_role: 'پرنسپل',
    admin_role: 'ایڈمن',
    teacher_role: 'استاد',
    student_role: 'طالب علم',

    // Settings
    systemSettings: 'سسٹم کنٹرول اور ترتیبات',
    systemSettingsSubtitle: 'ایمرجنسی لاک ڈاؤن، 10 خوبصورت ٹیمپلیٹس اور سسٹم ڈیزائن کے اختیارات۔',
    emergencyMode: 'ایمرجنسی موڈ (سسٹم لاک ڈاؤن)',
    emergencyDesc: 'آن کرنے پر پورے سسٹم کے تمام ڈیش بورڈز فوراً بند ہو کر ہیکر سیکیورٹی اسکرین میں تبدیل ہو جائیں گے۔',
    emergencyActive: 'ایمرجنسی لاک ڈاؤن فعال ہے',
    emergencyInactive: 'سسٹم بالکل نارمل ہے',
    turnOnEmergency: 'ایمرجنسی لاک ڈاؤن آن کریں',
    turnOffEmergency: 'لاک ڈاؤن بند کریں',
    emergencyMessageLabel: 'لاک ڈاؤن پیغام',
    saveSettings: 'ترتیبات محفوظ کریں',
    previewEmergency: 'لاک ڈاؤن اسکرین کا جائزہ لیں',

    // Templates
    templatesTitle: 'سسٹم کے 10 شاندار ٹیمپلیٹس',
    templatesSubtitle: 'کوئی بھی ٹیمپلیٹ منتخب کریں، تمام ڈیش بورڈز اور اندرونی صفحات خود بخود بدل جائیں گے۔',
    activeBadge: 'فعال',
    selectTemplate: 'ٹیمپلیٹ منتخب کریں',
    appearanceMode: 'ظاہری موڈ',
    darkMode: 'ڈارک موڈ',
    lightMode: 'لائٹ موڈ',

    // Profile
    preferredLanguage: 'سسٹم کی زبان',
    languageSaved: 'زبان کی تبدیلی کامیابی سے محفوظ ہو گئی',
    name: 'نام',
    email: 'ای میل',
    password: 'پاس ورڈ',
    currentPassword: 'موجودہ پاس ورڈ',
    newPassword: 'نیا پاس ورڈ',
    update: 'تبدیل کریں',
    save: 'محفوظ کریں',
    cancel: 'منسوخ',
    role: 'عہدہ',
    pleaseWait: 'براہ کرم انتظار کریں…',

    // Emergency screen
    systemLocked: 'سسٹم کو سپر ایڈمن نے بند کر دیا ہے',
    lockdownSub: 'سیکیورٹی لاک ڈاؤن پروٹوکول آن کر دیا گیا ہے۔ تمام سرگرمیاں عارضی طور پر معطل ہیں۔',
    systemCode: 'سیکیورٹی کوڈ: سیکیور-لاک ڈاؤن-99',
    superAdminUnlock: 'سپر ایڈمن ان لاک',
    confirmUnlock: 'سسٹم بحال کریں',
    backToDashboard: 'ڈیش بورڈ پر واپس جائیں',
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const { user } = useAuth();
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('smart_lang') || user?.language || 'en';
  });

  // Sync language with user if user logs in with saved preference
  useEffect(() => {
    if (user?.language && !localStorage.getItem('smart_lang')) {
      setLanguageState(user.language);
    }
  }, [user?.language]);

  const setLanguage = async (newLang) => {
    if (!['en', 'ar', 'ur'].includes(newLang)) return;
    setLanguageState(newLang);
    localStorage.setItem('smart_lang', newLang);

    // Sync with backend profile if authenticated
    try {
      if (user) {
        await api.put('/auth/profile', { language: newLang });
      }
    } catch {
      // ignore network errors for language sync
    }
  };

  const isRTL = language === 'ar' || language === 'ur';
  const dir = isRTL ? 'rtl' : 'ltr';

  // Apply direction and lang attributes to html root
  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [dir, language]);

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

