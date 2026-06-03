import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { BirthRegistration, PaginatedResponse } from '../../types';
import { ChevronLeft, ChevronRight, FilePlus2, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BirthRecordsPage() {
  const [page, setPage] = React.useState(1);

  const { data, isLoading } = useQuery<PaginatedResponse<BirthRegistration>>({
    queryKey: ['registrations', page],
    queryFn: () => api.get(`/registrations?page=${page}&limit=25`).then((res) => res.data),
  });

  return (
    <div className="space-y-6">
      <div className="page-hero">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">Registry Explorer</p>
            <h1 className="text-3xl font-bold">Birth Records</h1>
            <p className="section-subtitle mt-2">Review declarations, validation status, and regional coverage.</p>
          </div>
          <Link to="/registrations/new" className="btn btn-primary">
            <FilePlus2 size={18} />
            New Registration
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="card">Loading records...</div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="table-shell">
          <div className="table-toolbar">
            <div>
              <h2 className="section-title">Record Explorer</h2>
              <p className="text-sm text-gray-500">{data?.total || 0} records in the registry</p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500">
              <Search size={16} />
              <span>Reference, child, or region</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-head">
                <tr>
                  <th className="px-6 py-3 text-left">Reference</th>
                  <th className="px-6 py-3 text-left">Child Name</th>
                  <th className="px-6 py-3 text-left">Region</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {data?.data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10">
                      <div className="empty-state">No birth records found.</div>
                    </td>
                  </tr>
                ) : (
                  data?.data.map((reg: BirthRegistration) => (
                    <tr key={reg.id} className="table-row">
                      <td className="px-6 py-4 text-sm font-mono">
                        <span className="rounded-md bg-gray-100 px-2 py-1">{reg.referenceNumber}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{reg.childName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{reg.region.nameFr}</td>
                      <td className="px-6 py-4">
                        <span className={`badge badge-${getStatusColor(reg.status)}`}>
                          {formatStatus(reg.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(reg.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 p-4">
            <span className="text-sm text-gray-600">
              Page {page} of {data?.totalPages}
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
                disabled={!data?.hasMore}
                className="btn btn-ghost"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ');
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'VALIDATED':
    case 'CERTIFICATE_ISSUED':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'REJECTED':
      return 'error';
    default:
      return 'info';
  }
}
