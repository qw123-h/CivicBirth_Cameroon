import { Request, Response } from 'express';
import { certificatesService } from './certificates.service';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/error.middleware';

export class CertificatesController {
  generateCertificate = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { registrationId } = req.params;
      const certificate = await certificatesService.generateCertificate(
        registrationId,
        req.user.id,
      );

      res.status(201).json(certificate);
    },
  );

  getCertificate = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;
      const certificate = await certificatesService.getCertificate(id);

      res.status(200).json(certificate);
    },
  );

  listCertificates = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 25));

      const result = await certificatesService.listCertificates(page, limit);

      res.status(200).json(result);
    },
  );

  downloadCertificate = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;

      const certificate = await certificatesService.getCertificate(id);
      await certificatesService.recordDownload(id);

      // In production, generate signed URL or stream PDF from Supabase
      res.json({
        downloadUrl: `/certificates/${certificate.registration.referenceNumber}.pdf`,
        qrCode: certificate.qrCodeData,
        issuedAt: certificate.issuedAt,
      });
    },
  );
}

export const certificatesController = new CertificatesController();
