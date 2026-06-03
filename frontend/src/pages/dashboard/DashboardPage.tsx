import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../lib/api';
import { Analytics, RegionalAnalytics } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FileText, Clock, Award, Users, Activity } from 'lucide-react';

export default function DashboardPage() {
  useTranslation();
  const { user } = useAuthStore();

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery<Analytics>({
    queryKey: ['analytics-summary'],
    queryFn: () => api.get('/analytics/summary').then((res) => res.data),
    refetchInterval: 30000,
  });

  const { data: regionalData, isLoading: regionalLoading } = useQuery<RegionalAnalytics[]>({
    queryKey: ['analytics-by-region'],
    queryFn: () => api.get('/analytics/by-region').then((res) => res.data),
    refetchInterval: 30000,
  });

  if (analyticsLoading || regionalLoading) {
    return (
      <div className="soft-panel flex h-[60vh] items-center justify-center">
        <p className="text-gray-600">Loading data...</p>
      </div>
    );
  }

  const chartColors = ['#00843D', '#CE1126', '#FCD116', '#378ADD'];

  const genderData = analyticsData
    ? [
        { name: 'Male', value: analyticsData.genderDistribution.male },
        { name: 'Female', value: analyticsData.genderDistribution.female },
      ]
    : [];

  const regionChartData = regionalData
    ? regionalData.slice(0, 10).map((r) => ({
        name: r.nameFr,
        count: r.count,
        target: r.target,
      }))
    : [];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.26 }}
        className="page-hero"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">Operations Explorer</p>
            <h1 className="mb-2 text-3xl text-dark">Bonjour, {user?.name}</h1>
            <p className="section-subtitle">
              Voici le résumé du jour - {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-primary/15 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary">
            <Activity size={18} />
            Live refresh every 30s
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total this month"
          value={analyticsData?.totalThisMonth || 0}
          icon={FileText}
          color="bg-blue-500"
          trend="+5%"
        />
        <KpiCard
          label="Pending"
          value={analyticsData?.statusDistribution.pending || 0}
          icon={Clock}
          color="bg-yellow-500"
          trend="-2%"
        />
        <KpiCard
          label="Certificates Issued"
          value={analyticsData?.statusDistribution.certificateIssued || 0}
          icon={Award}
          color="bg-green-500"
          trend="+12%"
        />
        <KpiCard
          label="Active Agents"
          value={analyticsData?.totalAllTime || 0}
          icon={Users}
          color="bg-purple-500"
          trend="+3%"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.3 }}
          className="card lg:col-span-2"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">Registrations by Region</h2>
            <span className="badge badge-info">Top 10</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" angle={-35} textAnchor="end" height={72} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#00843D" name="Registrations" radius={[6, 6, 0, 0]} />
              <Bar dataKey="target" fill="#CE1126" name="Target" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.3 }}
          className="card"
        >
          <h2 className="section-title mb-4">Gender Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartColors.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-title">Monthly Target Progress</h2>
          <span className="text-sm font-semibold text-gray-500">
            {analyticsData?.monthlyTarget.percentage || 0}% achieved
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(
                    100,
                    ((analyticsData?.monthlyTarget.achieved || 0) /
                      (analyticsData?.monthlyTarget.target || 1)) *
                      100
                  )}%`,
                }}
                transition={{ duration: 0.75, ease: 'easeOut' }}
                className="h-4 rounded-full bg-gradient-to-r from-primary via-accent to-secondary"
              />
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {analyticsData?.monthlyTarget.achieved} /{' '}
              {analyticsData?.monthlyTarget.target} ({analyticsData?.monthlyTarget.percentage}%)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: number;
  icon: React.ComponentType<any>;
  color: string;
  trend: string;
}

function KpiCard({ label, value, icon: Icon, color, trend }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="metric-card"
    >
      <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-gray-50 to-transparent" />
      <div className="flex items-center justify-between">
        <div className="relative">
          <p className="mb-1 text-sm font-semibold text-gray-500">{label}</p>
          <p className="text-3xl font-extrabold text-dark">{value}</p>
          <p className="mt-1 text-sm text-green-600">{trend} vs last month</p>
        </div>
        <div className={`${color} relative rounded-lg p-4 text-white shadow-md`}>
          <Icon size={24} />
        </div>
      </div>
    </motion.div>
  );
}
