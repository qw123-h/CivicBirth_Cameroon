import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../lib/api';

export default function VerifyPage() {
  const { referenceNumber: paramRef } = useParams<{ referenceNumber: string }>();
  const [reference, setReference] = useState(paramRef || '');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    setError('');
    setResult(null);
    setIsLoading(true);

    try {
      const response = await api.get(`/registrations/verify/${reference}`);
      setResult(response.data);
    } catch (err: any) {
      setError('Registration not found');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-primary-light flex items-center justify-center p-4">
      <div className="card max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-2">CivicBirth</h1>
        <p className="text-center text-gray-600 mb-6">Verify Birth Certificate</p>

        <div className="space-y-4">
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="CM-2026-0000042"
            className="input"
          />
          <button onClick={handleVerify} disabled={isLoading} className="btn btn-primary w-full">
            {isLoading ? 'Verifying...' : 'Verify'}
          </button>
        </div>

        {error && <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}

        {result && (
          <div className="mt=6 space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="font-semibold text-green-800">✓ Verified</p>
            </div>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Child:</strong> {result.childName}
              </p>
              <p>
                <strong>DOB:</strong> {new Date(result.dob).toLocaleDateString()}
              </p>
              <p>
                <strong>Region:</strong> {result.region.nameFr}
              </p>
              <p>
                <strong>Status:</strong> {result.status}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
