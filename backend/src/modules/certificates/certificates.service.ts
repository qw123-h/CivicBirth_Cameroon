import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { logInfo } from '../../config/logger';
import QRCode from 'qrcode';
import { config } from '../../config/env';
import { BaseService } from '../../core/base.service';

export class CertificatesService extends BaseService {
  constructor(prismaClient = prisma) {
    super(prismaClient);
  }

  async generateCertificate(registrationId: string, userId: string) {
    const registration = await this.prisma.birthRegistration.findUnique({
      where: { id: registrationId },
      include: { region: true, certificate: true },
    });

    if (!registration) {
      throw new AppError(404, 'Registration not found');
    }

    if (registration.status !== 'VALIDATED') {
      throw new AppError(
        400,
        'Cannot generate certificate for non-validated registration',
      );
    }

    if (registration.certificate) {
      return registration.certificate;
    }

    // Generate QR code data
    const qrData = `${config.CERTIFICATE_VERIFY_BASE_URL}/${registration.referenceNumber}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrData);

    // In a real implementation, upload PDF to Supabase Storage
    const pdfStoragePath = `certificates/${registration.referenceNumber}.pdf`;

    const certificate = await this.prisma.certificate.create({
      data: {
        registrationId: registration.id,
        issuedById: userId,
        pdfStoragePath,
        qrCodeData: qrCodeDataUrl,
      },
    });

    // Update registration status
    await this.prisma.birthRegistration.update({
      where: { id: registrationId },
      data: { status: 'CERTIFICATE_ISSUED' },
    });

    logInfo(
      `Certificate generated for registration ${registrationId} by user ${userId}`,
    );

    return certificate;
  }

  async getCertificate(id: string) {
    const certificate = await this.prisma.certificate.findUnique({
      where: { id },
      include: {
        registration: true,
        issuedBy: { select: { name: true, email: true } },
      },
    });

    if (!certificate) {
      throw new AppError(404, 'Certificate not found');
    }

    return certificate;
  }

  async listCertificates(page: number = 1, limit: number = 25) {
    const total = await this.prisma.certificate.count();
    const skip = (page - 1) * limit;

    const certificates = await this.prisma.certificate.findMany({
      skip,
      take: limit,
      orderBy: { issuedAt: 'desc' },
      include: {
        registration: true,
        issuedBy: { select: { name: true, email: true } },
      },
    });

    return {
      data: certificates,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async recordDownload(id: string) {
    const certificate = await this.prisma.certificate.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    });

    return certificate;
  }
}

export const certificatesService = new CertificatesService();
