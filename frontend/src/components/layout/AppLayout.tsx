import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Award,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Bell,
  Search,
  Radio,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function AppLayout() {
  useTranslation();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', requiredRoles: ['NATIONAL_ADMIN', 'REGIONAL_OFFICER', 'MUNICIPAL_REGISTRAR', 'UNICEF_MONITOR'] },
    { path: '/registrations', icon: FileText, label: 'Birth Records', requiredRoles: ['NATIONAL_ADMIN', 'REGIONAL_OFFICER', 'MUNICIPAL_REGISTRAR', 'UNICEF_MONITOR'] },
    { path: '/registrations/new', icon: PlusCircle, label: 'New Registration', requiredRoles: ['NATIONAL_ADMIN', 'MUNICIPAL_REGISTRAR', 'FIELD_AGENT'] },
    { path: '/certificates', icon: Award, label: 'Certificates', requiredRoles: ['NATIONAL_ADMIN', 'REGIONAL_OFFICER', 'MUNICIPAL_REGISTRAR', 'UNICEF_MONITOR'] },
    { path: '/analytics', icon: BarChart3, label: 'Analytics', requiredRoles: ['NATIONAL_ADMIN', 'REGIONAL_OFFICER', 'MUNICIPAL_REGISTRAR', 'UNICEF_MONITOR', 'WORLD_BANK_OBSERVER'] },
    { path: '/agents', icon: Users, label: 'Agents', requiredRoles: ['NATIONAL_ADMIN', 'REGIONAL_OFFICER', 'MUNICIPAL_REGISTRAR', 'UNICEF_MONITOR'] },
    { path: '/settings', icon: Settings, label: 'Settings', requiredRoles: ['NATIONAL_ADMIN'] },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const isActiveRoute = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <div className="min-h-screen bg-background text-dark md:flex">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-72 transform border-r border-white/10 bg-[#111827] text-white shadow-2xl transition-transform duration-300 md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white shadow-glow">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <p className="font-display text-2xl font-semibold leading-none">CivicBirth</p>
                  <p className="mt-1 text-xs font-medium text-gray-300">Cameroon Registry</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-2 text-gray-300 hover:bg-white/10 md:hidden"
              >
                <X size={18} />
              </button>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/[0.08] p-3 text-xs text-gray-200">
              <p className="mb-1 flex items-center gap-2 font-semibold text-white">
                <ShieldCheck size={14} /> National CRVS
              </p>
              <p>Every child counts, from village declaration to official registry.</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">
            {navItems.map((item) => {
              if (
                item.requiredRoles &&
                !item.requiredRoles.includes(user?.role || '')
              ) {
                return null;
              }

              const isActive = isActiveRoute(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`group relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-glow'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="active-nav-pill"
                      className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-accent"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <item.icon size={18} className="shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-4">
            {user && (
              <div className="mb-3 rounded-lg border border-white/10 bg-white/[0.08] p-3">
                <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                <p className="truncate text-xs text-gray-300">{user.role}</p>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg bg-secondary/15 px-4 py-3 text-sm font-semibold text-red-100 transition-colors hover:bg-secondary/25"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col md:ml-0">
        <header className="sticky top-0 z-10 border-b border-white/70 bg-white/85 px-4 py-3 backdrop-blur-xl md:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg border border-gray-200 bg-white p-2 text-gray-700 md:hidden"
              >
                <Menu size={18} />
              </button>
              <div>
                <h1 className="text-xl font-display md:text-2xl">CivicBirth CM</h1>
                <p className="text-xs font-medium text-gray-500">Civil registration control center</p>
              </div>
            </div>

            <div className="hidden flex-1 items-center justify-end gap-3 md:flex">
              <div className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 shadow-sm">
                <Search size={16} />
                <span>Search records, agents, certificates</span>
              </div>
              <button className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 shadow-sm hover:border-primary/30 hover:text-primary">
                <Bell size={18} />
              </button>
              <div className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">
                {user?.email}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
