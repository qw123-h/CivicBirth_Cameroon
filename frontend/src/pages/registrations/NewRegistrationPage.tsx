import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const registrationSchema = z.object({
  childName: z.string().min(2, 'Child name must be at least 2 characters'),
  sex: z.enum(['MALE', 'FEMALE'] as const),
  dob: z.string().refine((date) => new Date(date) <= new Date(), 'DOB cannot be in the future'),
  regionId: z.string().min(1, 'Region is required'),
  district: z.string().min(1, 'District is required'),
  village: z.string().min(1, 'Village is required'),
  fatherName: z.string().min(2, 'Father name is required'),
  fatherOccupation: z.string().optional(),
  motherName: z.string().min(2, 'Mother name is required'),
  motherOccupation: z.string().optional(),
  agentId: z.string().min(1, 'Agent is required'),
  channel: z.enum(['FIELD', 'FACILITY', 'COMMUNITY', 'POSTAL'] as const),
  notes: z.string().optional(),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function NewRegistrationPage() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (data: RegistrationForm) => api.post('/registrations', data),
    onSuccess: () => {
      navigate('/registrations', { replace: true });
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    mode: 'onChange',
  });

  const watchedData = watch();

  const onSubmit = (data: RegistrationForm) => {
    mutation.mutate(data);
  };

  const totalSteps = 3;
  const isLastStep = step === totalSteps;
  const isFirstStep = step === 1;

  return (
    <div className="space-y-6">
      <div className="page-hero">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-3 text-primary">
            <ClipboardList size={24} />
          </div>
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-primary">Guided Intake</p>
            <h1 className="text-3xl font-bold">New Birth Registration</h1>
            <p className="section-subtitle mt-1">Step {step} of {totalSteps}</p>
          </div>
        </div>
      </div>

      <div className="card">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className="flex-1">
                <div
                  className={`h-2 rounded-full ${
                    i < step ? 'bg-primary' : i === step - 1 ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Child Information */}
          <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step-1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-4">
              <h2 className="text-xl font-semibold">Child Information</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Child Name *</label>
                <input
                  type="text"
                  {...register('childName')}
                  placeholder="Enter child's full name"
                  className="input"
                />
                {errors.childName && (
                  <p className="text-xs text-red-600 mt-1">{errors.childName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Sex *</label>
                  <select {...register('sex')} className="input">
                    <option value="">Select</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                  {errors.sex && <p className="text-xs text-red-600 mt-1">{errors.sex.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date of Birth *</label>
                  <input type="date" {...register('dob')} className="input" />
                  {errors.dob && <p className="text-xs text-red-600 mt-1">{errors.dob.message}</p>}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Location & Parents */}
          {step === 2 && (
            <motion.div key="step-2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-4">
              <h2 className="text-xl font-semibold">Location & Parent Information</h2>

              <div>
                <label className="block text-sm font-medium mb-1">Region *</label>
                <select {...register('regionId')} className="input">
                  <option value="">Select Region</option>
                  <option value="1">Littoral</option>
                  <option value="2">North</option>
                  <option value="3">South</option>
                  <option value="4">East</option>
                  <option value="5">West</option>
                  <option value="6">Centre</option>
                </select>
                {errors.regionId && (
                  <p className="text-xs text-red-600 mt-1">{errors.regionId.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1">District *</label>
                  <input
                    type="text"
                    {...register('district')}
                    placeholder="District name"
                    className="input"
                  />
                  {errors.district && (
                    <p className="text-xs text-red-600 mt-1">{errors.district.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Village *</label>
                  <input
                    type="text"
                    {...register('village')}
                    placeholder="Village name"
                    className="input"
                  />
                  {errors.village && (
                    <p className="text-xs text-red-600 mt-1">{errors.village.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Father's Name *</label>
                <input
                  type="text"
                  {...register('fatherName')}
                  placeholder="Full name"
                  className="input"
                />
                {errors.fatherName && (
                  <p className="text-xs text-red-600 mt-1">{errors.fatherName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Mother's Name *</label>
                <input
                  type="text"
                  {...register('motherName')}
                  placeholder="Full name"
                  className="input"
                />
                {errors.motherName && (
                  <p className="text-xs text-red-600 mt-1">{errors.motherName.message}</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 3: Registration Details */}
          {step === 3 && (
            <motion.div key="step-3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-4">
              <h2 className="text-xl font-semibold">Registration Details</h2>

              <div>
                <label className="block text-sm font-medium mb-1">Agent *</label>
                <select {...register('agentId')} className="input">
                  <option value="">Select Agent</option>
                  <option value="1">Agent 001</option>
                  <option value="2">Agent 002</option>
                </select>
                {errors.agentId && (
                  <p className="text-xs text-red-600 mt-1">{errors.agentId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Channel *</label>
                <select {...register('channel')} className="input">
                  <option value="">Select Channel</option>
                  <option value="FIELD">Field</option>
                  <option value="FACILITY">Facility</option>
                  <option value="COMMUNITY">Community</option>
                  <option value="POSTAL">Postal</option>
                </select>
                {errors.channel && (
                  <p className="text-xs text-red-600 mt-1">{errors.channel.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  {...register('notes')}
                  placeholder="Additional notes (optional)"
                  className="input min-h-20"
                />
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  <strong>Review Summary:</strong>
                  <br />
                  Child: {watchedData.childName}
                  <br />
                  Region: {watchedData.regionId}
                  <br />
                  Parents: {watchedData.fatherName} & {watchedData.motherName}
                </p>
              </div>
            </motion.div>
          )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={isFirstStep}
              className="btn btn-secondary flex items-center gap-2 disabled:opacity-50"
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            {!isLastStep ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="btn btn-primary flex items-center gap-2 ml-auto"
              >
                Next
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={mutation.isPending}
                className="btn btn-primary ml-auto"
              >
                {mutation.isPending ? 'Submitting...' : 'Submit Registration'}
              </button>
            )}
          </div>
        </form>

        {mutation.isError && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
            Failed to submit registration. Please try again.
          </div>
        )}
      </div>
    </div>
  );
}
