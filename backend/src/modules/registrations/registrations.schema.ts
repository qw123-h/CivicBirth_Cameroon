import { z } from 'zod';

export const createRegistrationSchema = z.object({
  childName: z.string().min(1, 'Child name is required'),
  childSex: z.enum(['MALE', 'FEMALE']),
  dob: z.string().datetime().refine((date) => new Date(date) < new Date(), {
    message: 'Date of birth cannot be in the future',
  }),
  birthPlace: z.string().min(1, 'Birth place is required'),
  regionId: z.string().uuid('Invalid region ID'),
  district: z.string().min(1, 'District is required'),
  village: z.string().min(1, 'Village is required'),
  motherName: z.string().min(1, 'Mother name is required'),
  motherPhone: z.string().optional(),
  fatherName: z.string().optional(),
  fatherPhone: z.string().optional(),
  declarantPhone: z.string().min(1, 'Declarant phone is required'),
  agentId: z.string().uuid().optional(),
  channel: z.enum(['WEB', 'USSD', 'SMS']).default('WEB'),
  notes: z.string().optional(),
});

export const updateRegistrationSchema = z.object({
  childName: z.string().min(1).optional(),
  motherName: z.string().min(1).optional(),
  motherPhone: z.string().optional(),
  fatherName: z.string().optional(),
  fatherPhone: z.string().optional(),
  declarantPhone: z.string().optional(),
  notes: z.string().optional(),
});

export const editRegistrationSchema = z.object({
  childName: z.string().min(1).optional(),
  motherName: z.string().min(1).optional(),
  motherPhone: z.string().optional(),
  fatherName: z.string().optional(),
  fatherPhone: z.string().optional(),
  declarantPhone: z.string().optional(),
  notes: z.string().optional(),
  birthPlace: z.string().optional(),
  district: z.string().optional(),
  village: z.string().optional(),
});

export const validateRegistrationSchema = z.object({
  id: z.string().uuid(),
});

export const rejectRegistrationSchema = z.object({
  reason: z.string().min(10, 'Rejection reason must be at least 10 characters'),
});

export const listRegistrationsQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('25'),
  status: z.enum(['PENDING', 'VALIDATED', 'REJECTED', 'CERTIFICATE_ISSUED']).optional(),
  regionId: z.string().uuid().optional(),
  sex: z.enum(['MALE', 'FEMALE']).optional(),
  channel: z.enum(['WEB', 'USSD', 'SMS']).optional(),
  search: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export type CreateRegistrationInput = z.infer<typeof createRegistrationSchema>;
export type UpdateRegistrationInput = z.infer<typeof updateRegistrationSchema>;
export type EditRegistrationInput = z.infer<typeof editRegistrationSchema>;
export type ListRegistrationsQuery = z.infer<typeof listRegistrationsQuerySchema>;