import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  CircleUserRound,
  Landmark,
  type LucideIcon,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';

export default function LoginPage() {
  useTranslation();
  const navigate = useNavigate();
  const { setUser, setTokens } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const demoAccounts = [
    { email: 'admin@civicbirth.cm', password: 'Admin@2026!', role: 'National Admin' },
    { email: 'officer@civicbirth.cm', password: 'Officer@2026!', role: 'Regional Officer' },
    { email: 'registrar@civicbirth.cm', password: 'Registrar@2026!', role: 'Municipal Registrar' },
    { email: 'agent@civicbirth.cm', password: 'Agent@2026!', role: 'Field Agent' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user } = response.data;

      setUser(user);
      setTokens(accessToken, refreshToken);
      navigate(getRoleHome(user.role));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen bg-[#eef3f1] text-[#111827]">
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden overflow-hidden bg-[#0f172a] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary via-accent to-secondary" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,132,61,0.32),transparent_38%),linear-gradient(315deg,rgba(206,17,38,0.18),transparent_42%)]" />
          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.55)_1px,transparent_1px)] [background-size:44px_44px]" />

          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="relative"
          >
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-primary shadow-xl">
                <ShieldCheck size={26} />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-white/70">National CRVS Platform</p>
                <h1 className="text-3xl font-extrabold tracking-tight">CivicBirth Cameroon</h1>
              </div>
            </div>

            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Digital civil registry</p>
              <h2 className="mt-4 text-5xl font-extrabold leading-tight tracking-tight">
                Secure birth registration from field declaration to legal identity.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/72">
                A single operational workspace for registrars, regional officers, and national CRVS stakeholders.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.45, ease: 'easeOut' }}
            className="relative grid grid-cols-3 gap-4"
          >
            <SignalCard icon={Building2} label="Coverage" value="62%" />
            <SignalCard icon={Landmark} label="Regions" value="10" />
            <SignalCard icon={CircleUserRound} label="Demo roles" value="4" />
          </motion.div>

          <div className="relative rounded-lg border border-white/10 bg-white/[0.06] p-4 text-sm text-white/72">
            UNICEF CRVS and APAI-CRVS aligned registry workflow.
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.36, ease: 'easeOut' }}
            className="w-full max-w-[460px]"
          >
            <div className="mb-7 lg:hidden">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white shadow-glow">
                <ShieldCheck size={25} />
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">CivicBirth Cameroon</p>
            </div>

            <div className="overflow-hidden rounded-lg border border-white/80 bg-white shadow-2xl shadow-slate-900/10">
              <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-secondary" />
              <div className="p-7 md:p-8">
                <div className="mb-8">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-primary/15 bg-primary/5 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                    <LockKeyhole size={14} />
                    Secure Access
                  </div>
                  <h2 className="text-3xl font-extrabold tracking-tight">Bienvenue</h2>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Système National d'Etat Civil Numérique
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
                  >
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input h-12"
                      placeholder="admin@civicbirth.cm"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">Mot de passe</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input h-12"
                      placeholder="Password"
                      required
                    />
                  </div>

                  <button type="submit" disabled={isLoading} className="btn btn-primary h-12 w-full">
                    {isLoading ? 'Connexion...' : 'Se connecter'}
                    <ArrowRight size={18} />
                  </button>
                </form>

                <div className="mt-8 border-t border-gray-100 pt-6">
                  <p className="mb-3 text-sm font-bold text-gray-700">Comptes de démo</p>
                  <div className="grid gap-2">
                    {demoAccounts.map((account) => (
                      <button
                        key={account.email}
                        type="button"
                        onClick={() => fillDemo(account.email, account.password)}
                        className="group flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/5 hover:shadow-md"
                      >
                        <span>
                          <span className="block text-sm font-bold text-gray-900">{account.role}</span>
                          <span className="block text-xs text-gray-500">{account.email}</span>
                        </span>
                        <ArrowRight size={16} className="text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}

function getRoleHome(role: UserRole | string) {
  switch (role) {
    case UserRole.FIELD_AGENT:
      return '/agent-workspace';
    case UserRole.MUNICIPAL_REGISTRAR:
      return '/agents';
    default:
      return '/dashboard';
  }
}

interface SignalCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

function SignalCard({ icon: Icon, label, value }: SignalCardProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.08] p-4 shadow-xl shadow-black/10 backdrop-blur">
      <Icon size={20} className="mb-5 text-accent" />
      <p className="text-3xl font-extrabold">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-white/55">{label}</p>
    </div>
  );
}
