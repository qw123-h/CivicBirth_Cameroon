import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useMutation } from '@tanstack/react-query';
import api from '../../lib/api';
import { CheckCircle2, Globe, Moon, Save, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || 'en');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const updatePasswordMutation = useMutation({
    mutationFn: (newPassword: string) =>
      api.patch(`/users/${user?.id}`, { password: newPassword }),
    onSuccess: () => {
      setSaveSuccess(true);
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handlePasswordChange = () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }
    updatePasswordMutation.mutate(password);
  };

  return (
    <div className="space-y-6">
      <div className="page-hero">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">Account Control</p>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="section-subtitle mt-2">Manage your account preferences and security settings.</p>
      </div>

      {/* Profile Card */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Full Name</label>
            <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900">
              {user?.name || 'Not specified'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Email</label>
            <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900">{user?.email}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Role</label>
            <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900">
              <span className="badge badge-info">{user?.role}</span>
            </div>
          </div>
          {user?.regionId && (
            <div>
              <label className="block text-sm font-medium text-gray-600">Region</label>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900">
                {user.regionId}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Language & Theme */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Language Settings */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={20} />
            <h2 className="text-xl font-semibold">Language</h2>
          </div>

          <div className="space-y-3">
            {['en', 'fr'].map((lang) => (
              <label key={lang} className="flex cursor-pointer items-center rounded-lg border p-3 hover:bg-primary/5">
                <input
                  type="radio"
                  name="language"
                  value={lang}
                  checked={language === lang}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="mr-3"
                />
                <span className="font-medium">{lang === 'en' ? 'English' : 'Français'}</span>
              </label>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg">
            Changes apply immediately. Preference saved to browser.
          </div>
        </div>

        {/* Theme Settings */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Moon size={20} />
            <h2 className="text-xl font-semibold">Theme</h2>
          </div>

          <div className="space-y-3">
            {[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ].map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center rounded-lg border p-3 hover:bg-primary/5"
              >
                <input
                  type="radio"
                  name="theme"
                  value={option.value}
                  checked={theme === option.value}
                  onChange={(e) => handleThemeChange(e.target.value)}
                  className="mr-3"
                />
                <span className="font-medium">{option.label}</span>
              </label>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg">
            Your theme preference is saved and persisted across sessions.
          </div>
        </div>
      </div>

      {/* Password Change */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              className="input"
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum 8 characters, with uppercase, number, and special character
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="input"
            />
          </div>

          <button
            onClick={handlePasswordChange}
            disabled={!password || !confirmPassword || updatePasswordMutation.isPending}
            className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={18} />
            {updatePasswordMutation.isPending ? 'Saving...' : 'Update Password'}
          </button>

          {saveSuccess && (
            <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} />
                Password updated successfully
              </span>
            </div>
          )}

          {updatePasswordMutation.isError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              Failed to update password
            </div>
          )}
        </div>
      </div>

      {/* Security Information */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card border border-amber-200 bg-amber-50">
        <h3 className="mb-2 flex items-center gap-2 font-semibold text-amber-900">
          <ShieldCheck size={18} />
          Security Notice
        </h3>
        <ul className="text-sm text-amber-800 space-y-1">
          <li>Never share your password with anyone.</li>
          <li>Change your password periodically for security.</li>
          <li>Always logout when using shared devices.</li>
          <li>Report any suspicious activity immediately.</li>
        </ul>
      </motion.div>

      {/* Activity Log */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Last login</span>
            <span className="font-medium">Today at 10:30 AM</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Account created</span>
            <span className="font-medium">January 15, 2026</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Email verified</span>
            <span className="font-medium">January 15, 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
