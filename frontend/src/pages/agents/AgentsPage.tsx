import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../lib/api';
import { Agent } from '../../types';
import { BarChart3, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AgentsPage() {
  const [page, setPage] = useState(1);
  const [regionFilter, setRegionFilter] = useState('');
  const [showNewAgentForm, setShowNewAgentForm] = useState(false);
  const [newAgentData, setNewAgentData] = useState({ name: '', email: '', regionId: '', phone: '' });
  const limit = 25;

  const { data: agentsData, isLoading, refetch } = useQuery({
    queryKey: ['agents', page, regionFilter],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append('page', String(page));
      queryParams.append('limit', String(limit));
      if (regionFilter) queryParams.append('regionId', regionFilter);

      const response = await api.get(`/agents?${queryParams.toString()}`);
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof newAgentData) =>
      api.post('/agents', {
        ...data,
        regionId: parseInt(data.regionId),
      }),
    onSuccess: () => {
      setNewAgentData({ name: '', email: '', regionId: '', phone: '' });
      setShowNewAgentForm(false);
      refetch();
    },
  });

  const [selectedAgent, setSelectedAgent] = useState<any>(null);

  const { data: performanceData } = useQuery({
    queryKey: ['agent-performance', selectedAgent?.id],
    queryFn: async () => {
      if (!selectedAgent) return null;
      const response = await api.get(`/agents/${selectedAgent.id}/performance`);
      return response.data;
    },
    enabled: !!selectedAgent,
  });

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAgentData.name && newAgentData.email && newAgentData.regionId) {
      createMutation.mutate(newAgentData);
    }
  };

  if (isLoading) return <div className="card"><p>Loading agents...</p></div>;

  const agents = agentsData?.data || [];
  const totalPages = agentsData?.totalPages || 1;
  const hasMore = agentsData?.hasMore || false;

  return (
    <div className="space-y-6">
      <div className="page-hero">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">Workforce Explorer</p>
          <h1 className="text-3xl font-bold">Field Agents</h1>
            <p className="section-subtitle mt-2">Manage field agents and their performance.</p>
        </div>
        <button
          onClick={() => setShowNewAgentForm(!showNewAgentForm)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          New Agent
        </button>
        </div>
      </div>

      {/* New Agent Form */}
      {showNewAgentForm && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card">
          <h2 className="section-title mb-4">Create New Agent</h2>
          <form onSubmit={handleCreateAgent} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newAgentData.name}
                  onChange={(e) => setNewAgentData({ ...newAgentData, name: e.target.value })}
                  placeholder="Agent name"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  value={newAgentData.email}
                  onChange={(e) => setNewAgentData({ ...newAgentData, email: e.target.value })}
                  placeholder="agent@example.com"
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">Region *</label>
                <select
                  value={newAgentData.regionId}
                  onChange={(e) => setNewAgentData({ ...newAgentData, regionId: e.target.value })}
                  className="input"
                >
                  <option value="">Select Region</option>
                  <option value="1">Littoral</option>
                  <option value="2">North</option>
                  <option value="3">South</option>
                  <option value="4">East</option>
                  <option value="5">West</option>
                  <option value="6">Centre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={newAgentData.phone}
                  onChange={(e) => setNewAgentData({ ...newAgentData, phone: e.target.value })}
                  placeholder="+237 6XX XXX XXX"
                  className="input"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="btn btn-primary"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Agent'}
              </button>
              <button type="button" onClick={() => setShowNewAgentForm(false)} className="btn btn-ghost">
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Filters */}
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
          <option value="1">Littoral</option>
          <option value="2">North</option>
          <option value="3">South</option>
          <option value="4">East</option>
          <option value="5">West</option>
          <option value="6">Centre</option>
        </select>
      </div>

      {/* Agents Table */}
      <div className="table-shell">
        <div className="table-toolbar">
          <div>
            <h2 className="section-title">Agent Directory</h2>
            <p className="text-sm text-gray-500">{agentsData?.total || 0} agents match the current view</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-head">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Code</th>
                <th className="text-left py-3 px-4 font-semibold">Name</th>
                <th className="text-left py-3 px-4 font-semibold">Email</th>
                <th className="text-left py-3 px-4 font-semibold">Region</th>
                <th className="text-center py-3 px-4 font-semibold">Registrations</th>
                <th className="text-center py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    <div className="empty-state">No agents found.</div>
                  </td>
                </tr>
              ) : (
                agents.map((agent: any) => (
                  <tr key={agent.id} className="table-row">
                    <td className="py-3 px-4">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                        {agent.agentCode}
                      </code>
                    </td>
                    <td className="py-3 px-4 font-medium">{agent.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{agent.email}</td>
                    <td className="py-3 px-4">{agent.region?.nameFr}</td>
                    <td className="py-3 px-4 text-center">{agent._count?.birthRegistrations || 0}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`badge ${agent.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>
                        {agent.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedAgent(agent)}
                        className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                      >
                        <BarChart3 size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-100 p-4">
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="btn btn-ghost"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!hasMore}
              className="btn btn-ghost"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Agent Performance Detail */}
      {selectedAgent && performanceData && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold">{selectedAgent.name} - Performance</h2>
              <p className="text-sm text-gray-600">Agent Code: {selectedAgent.agentCode}</p>
            </div>
            <button onClick={() => setSelectedAgent(null)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600">Total Registrations</p>
              <p className="text-2xl font-bold text-blue-600">{performanceData.total}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600">Validated</p>
              <p className="text-2xl font-bold text-green-600">{performanceData.validated}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-purple-600">{performanceData.thisMonth}</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-gray-600">Accuracy Rate</p>
              <p className="text-2xl font-bold text-orange-600">{performanceData.accuracy?.toFixed(1)}%</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
