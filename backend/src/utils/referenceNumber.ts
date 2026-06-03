import { prisma } from '../config/database';

/**
 * Generates a unique reference number in the format: CM-YYYY-NNNNNNN
 * Example: CM-2026-0000042
 */
export async function generateReferenceNumber(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();

  // Get the registration with the highest reference number for this year
  const lastRegistration = await prisma.birthRegistration.findFirst({
    where: {
      createdAt: {
        gte: new Date(year, 0, 1),
        lte: new Date(year, 11, 31),
      },
    },
    orderBy: {
      referenceNumber: 'desc',
    },
    select: {
      referenceNumber: true,
    },
  });

  let sequence = 1;

  if (lastRegistration && lastRegistration.referenceNumber) {
    const lastSequence = parseInt(
      lastRegistration.referenceNumber.split('-')[2],
      10,
    );
    sequence = lastSequence + 1;
  }

  // Pad sequence to 7 digits
  const paddedSequence = String(sequence).padStart(7, '0');

  return `CM-${year}-${paddedSequence}`;
}

/**
 * Validates the format of a reference number
 */
export function validateReferenceNumberFormat(ref: string): boolean {
  const pattern = /^CM-\d{4}-\d{7}$/;
  return pattern.test(ref);
}

/**
 * Extracts year and sequence from reference number
 */
export function parseReferenceNumber(ref: string): {
  year: number;
  sequence: number;
} | null {
  if (!validateReferenceNumberFormat(ref)) {
    return null;
  }

  const parts = ref.split('-');
  return {
    year: parseInt(parts[1], 10),
    sequence: parseInt(parts[2], 10),
  };
}
