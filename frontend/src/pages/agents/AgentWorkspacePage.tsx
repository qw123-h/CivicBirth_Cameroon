import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ClipboardList, Radio } from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

interface RuralRegistrationForm {
  childName: string;
  childSex: 'MALE' | 'FEMALE';
  dob: string;
  motherName: string;
  motherPhone: string;
  fatherName: string;
  fatherPhone: string;
  declarantPhone: string;
  birthPlace: string;
  notes: string;
}

const initialForm: RuralRegistrationForm = {
  childName: '',
  childSex: 'MALE',
  dob: '',
  motherName: '',
  motherPhone: '',
  fatherName: '',
  fatherPhone: '',
  declarantPhone: '',
  birthPlace: '',
  notes: '',
};

export default function AgentWorkspacePage() {
  const { user } = useAuthStore();
  const [form, setForm] = useState<RuralRegistrationForm>(initialForm);

  const registrationMutation = useMutation({
    mutationFn: async () => {
      return api.post('/registrations', {
        childName: form.childName,
        childSex: form.childSex,
        dob: new Date(form.dob).toISOString(),
        birthPlace: form.birthPlace || 'Village, Cameroon',
        regionId: user?.regionId ?? undefined,
        district: 'District Central',
        village: 'Village',
        motherName: form.motherName,
        motherPhone: form.motherPhone || undefined,
        fatherName: form.fatherName || undefined,
        fatherPhone: form.fatherPhone || undefined,
        declarantPhone: form.declarantPhone,
        channel: 'WEB',
        notes: form.notes || 'Submitted from rural field agent workspace.',
      });
    },
    onSuccess: () => {
      setForm(initialForm);
    },
  });

  const errorMessage =
    (registrationMutation.error as any)?.response?.data?.error ||
    (registrationMutation.error as Error | null)?.message;

  const firstName = user?.name?.split(' ')[0] || 'Agent';

  return (
    <div className="space-y-6">
      <div className="page-hero">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-3 text-primary">
            <Radio size={24} />
          </div>
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-primary">Agent Tasks</p>
            <h1 className="text-3xl font-bold">Hello {firstName}, Rural Birth Intake</h1>
            <p className="section-subtitle mt-1">Register births collected in villages and remote communities.</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl">
        <section className="card">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-3 text-primary">
              <ClipboardList size={22} />
            </div>
            <div>
              <h2 className="section-title">Register New Birth</h2>
              <p className="text-sm text-gray-500">Fill in the details below to register a new birth declaration.</p>
            </div>
          </div>

          {registrationMutation.isSuccess && (
            <>
              <div className="mb-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800">
                Registration submitted and is now pending validation.
              </div>
              {(registrationMutation.data as any)?.data?.isLateRegistration && (
                <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm font-semibold text-yellow-800">
                  ⚠️ This is a late registration (child is over 1 year old). It has been flagged for special review.
                </div>
              )}
            </>
          )}

          {errorMessage && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              registrationMutation.mutate();
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input label="Child Name *" value={form.childName} onChange={(childName) => setForm({ ...form, childName })} />
              <div>
                <label className="mb-1 block text-sm font-medium">Sex *</label>
                <select value={form.childSex} onChange={(e) => setForm({ ...form, childSex: e.target.value as RuralRegistrationForm['childSex'] })} className="input">
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
              <Input label="Date of Birth *" type="date" value={form.dob} onChange={(dob) => setForm({ ...form, dob })} />
              <Input label="Birth Place" value={form.birthPlace} onChange={(birthPlace) => setForm({ ...form, birthPlace })} placeholder="Village clinic or home" />
              <Input label="Mother Name *" value={form.motherName} onChange={(motherName) => setForm({ ...form, motherName })} />
              <Input label="Mother Phone" value={form.motherPhone} onChange={(motherPhone) => setForm({ ...form, motherPhone })} />
              <Input label="Father Name" value={form.fatherName} onChange={(fatherName) => setForm({ ...form, fatherName })} />
              <Input label="Father Phone" value={form.fatherPhone} onChange={(fatherPhone) => setForm({ ...form, fatherPhone })} />
              <Input label="Declarant Phone *" value={form.declarantPhone} onChange={(declarantPhone) => setForm({ ...form, declarantPhone })} />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input min-h-24" />
            </div>

            <button
              type="submit"
              disabled={registrationMutation.isPending}
              className="btn btn-primary"
            >
              {registrationMutation.isPending ? 'Submitting...' : 'Submit Rural Registration'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input"
        required={label.includes('*')}
      />
    </div>
  );
}
