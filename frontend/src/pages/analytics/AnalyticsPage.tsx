import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CheckCircle2, Clock, ShieldAlert, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnalyticsPage() {
  const { data: summaryData } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: async () => {
      const response = await api.get('/analytics/summary');
      return response.data;
    },
  });

  const { data: regionData } = useQuery({
    queryKey: ['analytics-regions'],
    queryFn: async () => {
      const response = await api.get('/analytics/by-region');
      return response.data;
    },
  });

  const { data: monthlyData } = useQuery({
    queryKey: ['analytics-monthly'],
    queryFn: async () => {
      const response = await api.get('/analytics/by-month');
      return response.data;
    },
  });

  const { data: sdgData } = useQuery({
    queryKey: ['analytics-sdg'],
    queryFn: async () => {
      const response = await api.get('/analytics/sdg-tracker');
      return response.data;
    },
  });

  const summary = summaryData || {};
  const regions = regionData || [];
  const monthlyStats = monthlyData || [];
  const sdgStats = sdgData || [];

  const COLORS = ['#00843D', '#CE1126'];

  const channelData = [
    { name: 'Field', value: summary.byChannel?.FIELD || 0 },
    { name: 'Facility', value: summary.byChannel?.FACILITY || 0 },
    { name: 'Community', value: summary.byChannel?.COMMUNITY || 0 },
    { name: 'Postal', value: summary.byChannel?.POSTAL || 0 },
  ];

  const statusData = [
    { name: 'Pending', value: summary.statusSummary?.PENDING || 0 },
    { name: 'Validated', value: summary.statusSummary?.VALIDATED || 0 },
    { name: 'Rejected', value: summary.statusSummary?.REJECTED || 0 },
    { name: 'Issued', value: summary.statusSummary?.CERTIFICATE_ISSUED || 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="page-hero">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">Performance Explorer</p>
        <h1 className="text-3xl font-bold">Analytics & Reports</h1>
        <p className="section-subtitle mt-2">Monitor birth registration performance and regional trends.</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="metric-card">
          <p className="text-sm text-gray-600">Total Registered</p>
          <p className="text-3xl font-bold">{summary.allTime || 0}</p>
          <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-green-600"><TrendingUp size={14} /> All time</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }} className="metric-card">
          <p className="text-sm text-gray-600">Validated</p>
          <p className="text-3xl font-bold">{summary.statusSummary?.VALIDATED || 0}</p>
          <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-green-600"><CheckCircle2 size={14} /> Processed</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="metric-card">
          <p className="text-sm text-gray-600">Pending Review</p>
          <p className="text-3xl font-bold">{summary.statusSummary?.PENDING || 0}</p>
          <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-yellow-600"><Clock size={14} /> In queue</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="metric-card">
          <p className="text-sm text-gray-600">Male / Female %</p>
          <p className="text-3xl font-bold">
            {summary.genderPercentage?.male?.toFixed(0) || 0}% / {summary.genderPercentage?.female?.toFixed(0) || 0}%
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-blue-600"><ShieldAlert size={14} /> Distribution</p>
        </motion.div>
      </div>

      {/* Monthly Trend */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Monthly Registration Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#00843D" strokeWidth={3} dot={{ r: 4 }} name="Registrations" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Status Distribution */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Registration Channel */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Registration Channel</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={channelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#00843D" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Regional Performance Table */}
      <div className="table-shell">
        <div className="table-toolbar">
          <h2 className="text-xl font-semibold">Regional Performance</h2>
          <span className="badge badge-info">10 regions</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-head">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Region</th>
                <th className="text-center py-3 px-4 font-semibold">Registered</th>
                <th className="text-center py-3 px-4 font-semibold">Target</th>
                <th className="text-center py-3 px-4 font-semibold">Achievement %</th>
                <th className="text-center py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {regions.slice(0, 10).map((region: any, idx: number) => {
                const achievement = region.target ? (region.count / region.target) * 100 : 0;
                const status = achievement >= 100 ? 'Complete' : achievement >= 75 ? 'On Track' : 'At Risk';
                const statusColor = achievement >= 100 ? 'text-green-600' : achievement >= 75 ? 'text-blue-600' : 'text-red-600';

                return (
                  <tr key={idx} className="table-row">
                    <td className="py-3 px-4 font-medium">{region.name}</td>
                    <td className="py-3 px-4 text-center">{region.count}</td>
                    <td className="py-3 px-4 text-center">{region.target}</td>
                    <td className="py-3 px-4 text-center">{achievement.toFixed(1)}%</td>
                    <td className={`py-3 px-4 text-center text-sm font-semibold ${statusColor}`}>
                      {status}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SDG 16.9 Tracker */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold">SDG 16.9 Progress Tracker</h2>
          <TrendingUp size={20} className="text-primary" />
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Universal Legal Identity by 2030 - Birth Registration Coverage
        </p>

        <div className="space-y-3">
          {sdgStats.slice(0, 5).map((region: any, idx: number) => {
            const progress = region.sdgProgress || 0;
            return (
              <div key={idx}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{region.regionName}</span>
                  <span className="text-sm text-gray-600">{progress.toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-2 rounded-full bg-primary"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>SDG Target:</strong> Achieve 100% birth registration coverage by 2030 in all regions
          </p>
        </div>
      </div>
    </div>
  );
}
