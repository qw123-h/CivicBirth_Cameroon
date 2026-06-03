import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Download, FileBadge, Plus } from 'lucide-react';
import api from '../../lib/api';

export default function CertificatesPage() {
  const [page, setPage] = useState(1);
  const limit = 25;

  const { data: certificatesData, isLoading } = useQuery({
    queryKey: ['certificates', page],
    queryFn: async () => {
      const response = await api.get(`/certificates?page=${page}&limit=${limit}`);
      return response.data;
    },
  });

  const { data: registrationsData } = useQuery({
    queryKey: ['registrations-for-cert'],
    queryFn: async () => {
      const response = await api.get('/registrations?status=VALIDATED&limit=100');
      return response.data;
    },
  });

  const generateMutation = useMutation({
    mutationFn: (registrationId: string) => api.post(`/certificates/${registrationId}/generate`),
  });

  const handleGenerateCertificate = (registrationId: string) => {
    generateMutation.mutate(registrationId);
  };

  if (isLoading) return <div className="card"><p>Loading certificates...</p></div>;

  const certificates = certificatesData?.data || [];
  const totalPages = certificatesData?.totalPages || 1;
  const hasMore = certificatesData?.hasMore || false;

  return (
    <div className="space-y-6">
      <div className="page-hero">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-3 text-primary">
            <FileBadge size={24} />
          </div>
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-primary">Certificate Explorer</p>
            <h1 className="text-3xl font-bold">Birth Certificates</h1>
            <p className="section-subtitle mt-1">Manage and generate official certificates.</p>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="section-title">Generate New Certificate</h2>
            <p className="text-sm text-gray-600">Select a validated registration to generate a certificate.</p>
          </div>
          <span className="badge badge-success">{registrationsData?.data?.length || 0} eligible</span>
        </div>

        {registrationsData?.data && registrationsData.data.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {registrationsData.data.slice(0, 5).map((reg: any) => (
              <div
                key={reg.id}
                className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50/70 p-3 transition-colors hover:border-primary/25 hover:bg-primary/5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-gray-900">{reg.childName}</p>
                  <p className="text-xs font-mono text-gray-500">{reg.referenceNumber}</p>
                </div>
                <button
                  onClick={() => handleGenerateCertificate(reg.id)}
                  disabled={generateMutation.isPending}
                  className="btn btn-primary"
                >
                  <Plus size={16} />
                  Generate
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No validated registrations available.</div>
        )}
      </motion.div>

      <div className="table-shell">
        <div className="table-toolbar">
          <div>
            <h2 className="section-title">Issued Certificates</h2>
            <p className="text-sm text-gray-500">{certificatesData?.total || 0} certificates issued</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3 text-left">Reference</th>
                <th className="px-4 py-3 text-left">Child Name</th>
                <th className="px-4 py-3 text-left">Issued Date</th>
                <th className="px-4 py-3 text-left">Downloads</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {certificates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10">
                    <div className="empty-state">No certificates issued yet.</div>
                  </td>
                </tr>
              ) : (
                certificates.map((cert: any) => (
                  <tr key={cert.id} className="table-row">
                    <td className="px-4 py-3">
                      <code className="rounded-md bg-gray-100 px-2 py-1 text-xs">
                        {cert.registration?.referenceNumber}
                      </code>
                    </td>
                    <td className="px-4 py-3 font-semibold">{cert.registration?.childName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(cert.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge badge-info">{cert.downloadCount || 0}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                        <Download size={16} />
                        Download
                      </button>
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
    </div>
  );
}
