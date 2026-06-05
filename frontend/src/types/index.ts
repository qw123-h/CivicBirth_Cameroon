export enum UserRole {
  NATIONAL_ADMIN = 'NATIONAL_ADMIN',
  REGIONAL_OFFICER = 'REGIONAL_OFFICER',
  MUNICIPAL_REGISTRAR = 'MUNICIPAL_REGISTRAR',
  FIELD_AGENT = 'FIELD_AGENT',
  UNICEF_MONITOR = 'UNICEF_MONITOR',
  WORLD_BANK_OBSERVER = 'WORLD_BANK_OBSERVER',
}

export enum RecordStatus {
  PENDING = 'PENDING',
  VALIDATED = 'VALIDATED',
  REJECTED = 'REJECTED',
  CERTIFICATE_ISSUED = 'CERTIFICATE_ISSUED',
}

export enum Sex {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum RecordChannel {
  WEB = 'WEB',
  USSD = 'USSD',
  SMS = 'SMS',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  regionId: string | null;
}

export interface Region {
  id: string;
  nameFr: string;
  nameEn: string;
  code: string;
  monthlyTarget: number;
}

export interface BirthRegistration {
  id: string;
  referenceNumber: string;
  childName: string;
  childSex: Sex;
  dob: string;
  birthPlace: string;
  region: Region;
  district: string;
  village: string;
  motherName: string;
  motherPhone?: string;
  fatherName?: string;
  fatherPhone?: string;
  declarantPhone: string;
  channel: RecordChannel;
  status: RecordStatus;
  createdAt: string;
  validatedAt?: string;
  agent?: Agent;
  certificate?: Certificate;
}

export interface Certificate {
  id: string;
  registrationId: string;
  issuedAt: string;
  pdfStoragePath: string;
  qrCodeData: string;
  downloadCount: number;
}

export interface Agent {
  id: string;
  agentCode: string;
  name: string;
  phone: string;
  regionId: string;
  region: Region;
  district: string;
  village?: string;
  unicefCertified: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  registrationsCount: number;
  _count?: {
    registrations: number;
  };
  tempPassword?: string;
}

export interface Analytics {
  totalAllTime: number;
  totalThisMonth: number;
  totalThisYear: number;
  statusDistribution: {
    pending: number;
    validated: number;
    rejected: number;
    certificateIssued: number;
  };
  genderDistribution: {
    male: number;
    female: number;
    malePercentage: string;
    femalePercentage: string;
  };
  byChannel: {
    web: number;
    ussd: number;
    sms: number;
  };
  monthlyTarget: {
    target: number;
    achieved: number;
    percentage: string | number;
  };
}

export interface RegionalAnalytics {
  regionCode: string;
  nameFr: string;
  nameEn: string;
  count: number;
  target: number;
  percentage: string;
  status: 'on-track' | 'at-risk' | 'critical';
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}
