import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BarChart3, ChevronLeft, ChevronRight, Copy, Plus, RefreshCw, X } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import { Agent } from '../../types';

const statusStyles = {
  ACTIVE: 'badge-success',
  INACTIVE: 'badge-warning',
  SUSPENDED: 'badge-error',
};

export default function AgentsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [regionFilter, setRegionFilter] = useState('');
  const [showNewAgentForm, setShowNewAgentForm] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [newAgentData, setNewAgentData] = useState({
    name: '',
    phone: '',
    regionId: '',
    district: '',
    village: '',
  });
  const limit = 25;

  const { data: agentsData, isLoading, refetch } = useQuery({
    queryKey: ['agents', page, regionFilter],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (regionFilter) queryParams.set('regionId', regionFilter);

      const response = await api.get(`/agents?${queryParams.toString()}`);
      return response.data;
    },
  });

  const agents: Agent[] = agentsData?.data || [];
  const regions = useMemo(() => {
    const byId = new Map<string, Agent['region']>();
    agents.forEach((agent) => {
      if (agent.region) byId.set(agent.region.id, agent.region);
    });
    return Array.from(byId.values()).sort((a, b) => a.nameEn.localeCompare(b.nameEn));
  }, [agents]);

  const createMutation = useMutation({
    mutationFn: (data: typeof newAgentData) => api.post('/agents', data),
    onSuccess: (response) => {
      const createdAgent = response.data;
      setNewAgentData({ name: '', phone: '', regionId: '', district: '', village: '' });
      setShowNewAgentForm(false);
      refetch();
      // Show credentials to municipal office
      if (createdAgent?.tempPassword) {
        alert(`Agent created successfully!\n\nCredentials to share:\nEmail: ${createdAgent.email}\nPassword: ${createdAgent.tempPassword}\n\nPlease securely provide these to the new agent.`);
      }
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to create agent');
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Agent['status'] }) =>
      api.patch(`/agents/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      if (selectedAgent) {
        queryClient.invalidateQueries({ queryKey: ['agent-performance', selectedAgent.id] });
      }
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (id: string) => api.post(`/agents/${id}/reset-password`),
    onSuccess: (response, agentId) => {
      const result = response.data;
      // Show the new credentials
      navigator.clipboard.writeText(`Email: ${result.email}\nPassword: ${result.tempPassword}`);
      alert(`Password reset successfully!\n\nEmail: ${result.email}\nPassword: ${result.tempPassword}\n\nCredentials copied to clipboard. Provide these to the agent.`);
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to reset password');
    },
  });

  const { data: performanceData } = useQuery({
    queryKey: ['agent-performance', selectedAgent?.id],
    queryFn: async () => {
      const response = await api.get(`/agents/${selectedAgent?.id}/performance`);
      return response.data;
    },
    enabled: !!selectedAgent,
  });

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newAgentData);
  };

  if (isLoading) return <div className="card"><p>Loading agents...</p></div>;

  const totalPages = agentsData?.totalPages || 1;
  const hasMore = page < totalPages;

  return (
    <div className="space-y-6">
      <div className="page-hero">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">Rural Workforce</p>
            <h1 className="text-3xl font-bold">Field Agents</h1>
            <p className="section-subtitle mt-2">Seeded demo agents can be activated, suspended, or blocked from new rural registrations.</p>
          </div>
          <button onClick={() => setShowNewAgentForm((value) => !value)} className="btn btn-primary flex items-center gap-2">
            <Plus size={20} />
            New Agent
          </button>
        </div>
      </div>

      {showNewAgentForm && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card">
          <h2 className="section-title mb-4">Create New Agent</h2>
          <form onSubmit={handleCreateAgent} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Full Name *" value={newAgentData.name} onChange={(name) => setNewAgentData({ ...newAgentData, name })} placeholder="Agent name" />
              <Field label="Phone *" value={newAgentData.phone} onChange={(phone) => setNewAgentData({ ...newAgentData, phone })} placeholder="+237 6XX XXX XXX" />
              <div>
                <label className="mb-1 block text-sm font-medium">Region *</label>
                <select
                  value={newAgentData.regionId}
                  onChange={(e) => setNewAgentData({ ...newAgentData, regionId: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select Region</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>{region.nameEn}</option>
                  ))}
                </select>
              </div>
              <Field label="District *" value={newAgentData.district} onChange={(district) => setNewAgentData({ ...newAgentData, district })} placeholder="District Central" />
              <Field label="Village" value={newAgentData.village} onChange={(village) => setNewAgentData({ ...newAgentData, village })} placeholder="Village Test" />
            </div>

            <div className="flex gap-2">
              <button type="submit" disabled={createMutation.isPending} className="btn btn-primary">
                {createMutation.isPending ? 'Creating...' : 'Create Agent'}
              </button>
              <button type="button" onClick={() => setShowNewAgentForm(false)} className="btn btn-ghost">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="card">
        <label className="mb-2 block text-sm font-semibold">Filter by Region</label>
        <select
          value={regionFilter}
          onChange={(e) => {
            setRegionFilter(e.target.value);
            setPage(1);
          }}
          className="input"
        >
          <option value="">All Regions</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>{region.nameEn}</option>
          ))}
        </select>
      </div>

      <div className="table-shell">
        <div className="table-toolbar">
          <div>
            <h2 className="section-title">Agent Directory</h2>
            <p className="text-sm text-gray-500">{agentsData?.total || 0} seeded and created agents</p>
          </div>
          <button onClick={() => refetch()} className="btn btn-ghost">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Code</th>
                <th className="px-4 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-left font-semibold">Region</th>
                <th className="px-4 py-3 text-left font-semibold">District</th>
                <th className="px-4 py-3 text-center font-semibold">Registrations</th>
                <th className="px-4 py-3 text-center font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    <div className="empty-state">No agents found. Run the backend seed to load demo agents.</div>
                  </td>
                </tr>
              ) : (
                agents.map((agent) => (
                  <tr key={agent.id} className="table-row">
                    <td className="px-4 py-3"><code className="rounded bg-gray-100 px-2 py-1 text-xs font-mono">{agent.agentCode}</code></td>
                    <td className="px-4 py-3 font-medium">{agent.name}</td>
                    <td className="px-4 py-3">{agent.region?.nameEn}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{agent.district}</td>
                    <td className="px-4 py-3 text-center">{agent._count?.registrations ?? agent.registrationsCount ?? 0}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`badge ${statusStyles[agent.status]}`}>{agent.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <button onClick={() => setSelectedAgent(agent)} className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                          <BarChart3 size={16} />
                          View
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Reset password for ${agent.name}?`)) {
                              resetPasswordMutation.mutate(agent.id);
                            }
                          }}
                          disabled={resetPasswordMutation.isPending}
                          className="flex items-center gap-1 text-sm font-semibold text-amber-600 hover:underline"
                          title="Reset Password"
                        >
                          <Copy size={16} />
                          Reset Password
                        </button>
                        <select
                          value={agent.status}
                          onChange={(e) => statusMutation.mutate({ id: agent.id, status: e.target.value as Agent['status'] })}
                          className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold"
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                          <option value="SUSPENDED">Suspended</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 p-4">
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="btn btn-ghost">
              <ChevronLeft size={16} />
              Previous
            </button>
            <button onClick={() => setPage(page + 1)} disabled={!hasMore} className="btn btn-ghost">
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {selectedAgent && performanceData && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold">{selectedAgent.name} Performance</h2>
              <p className="text-sm text-gray-600">Agent Code: {selectedAgent.agentCode}</p>
            </div>
            <button onClick={() => setSelectedAgent(null)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Metric label="Total Registrations" value={performanceData.performance.totalRegistrations} tone="blue" />
            <Metric label="Validated" value={performanceData.performance.validatedRegistrations} tone="green" />
            <Metric label="This Month" value={performanceData.performance.thisMonth} tone="purple" />
            <Metric label="Accuracy Rate" value={`${performanceData.performance.accuracyRate}%`} tone="orange" />
          </div>
        </motion.div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input" required={label.includes('*')} />
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string | number; tone: 'blue' | 'green' | 'purple' | 'orange' }) {
  const styles = {
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    green: 'border-green-200 bg-green-50 text-green-700',
    purple: 'border-purple-200 bg-purple-50 text-purple-700',
    orange: 'border-orange-200 bg-orange-50 text-orange-700',
  };

  return (
    <div className={`rounded-lg border p-4 ${styles[tone]}`}>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
