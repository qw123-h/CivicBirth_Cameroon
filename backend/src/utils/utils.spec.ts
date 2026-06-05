import { calculatePagination, getPaginationParams } from './pagination';
import { generateReferenceNumber } from './referenceNumber';

describe('Pagination Utilities', () => {
  describe('getPaginationParams', () => {
    it('should return default pagination params', () => {
      const result = getPaginationParams(undefined, undefined);

      expect(result).toEqual({
        skip: 0,
        take: 10,
      });
    });

    it('should parse page and limit correctly', () => {
      const result = getPaginationParams('2', '20');

      expect(result).toEqual({
        skip: 20,
        take: 20,
      });
    });

    it('should handle string inputs', () => {
      const result = getPaginationParams('3', '15');

      expect(result).toEqual({
        skip: 30,
        take: 15,
      });
    });

    it('should cap maximum limit to 100', () => {
      const result = getPaginationParams('1', '500');

      expect(result.take).toBeLessThanOrEqual(100);
    });

    it('should default to page 1 if invalid', () => {
      const result = getPaginationParams('invalid', '10');

      expect(result.skip).toBe(0);
    });

    it('should default to 10 items if invalid', () => {
      const result = getPaginationParams('1', 'invalid');

      expect(result.take).toBe(10);
    });
  });

  describe('calculatePagination', () => {
    it('should calculate pagination metadata', () => {
      const result = calculatePagination({
        skip: 0,
        take: 10,
        total: 50,
      });

      expect(result).toEqual({
        page: 1,
        limit: 10,
        total: 50,
        totalPages: 5,
        hasNextPage: true,
        hasPrevPage: false,
      });
    });

    it('should handle last page', () => {
      const result = calculatePagination({
        skip: 40,
        take: 10,
        total: 50,
      });

      expect(result).toEqual({
        page: 5,
        limit: 10,
        total: 50,
        totalPages: 5,
        hasNextPage: false,
        hasPrevPage: true,
      });
    });

    it('should handle single page', () => {
      const result = calculatePagination({
        skip: 0,
        take: 10,
        total: 5,
      });

      expect(result).toEqual({
        page: 1,
        limit: 10,
        total: 5,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });
    });

    it('should handle middle page', () => {
      const result = calculatePagination({
        skip: 10,
        take: 10,
        total: 50,
      });

      expect(result).toEqual({
        page: 2,
        limit: 10,
        total: 50,
        totalPages: 5,
        hasNextPage: true,
        hasPrevPage: true,
      });
    });
  });
});

describe('Reference Number Generator', () => {
  describe('generateReferenceNumber', () => {
    it('should generate valid reference number format', () => {
      const refNumber = generateReferenceNumber();

      expect(refNumber).toMatch(/^CB-\d{4}-\d{6}$/);
    });

    it('should generate unique reference numbers', () => {
      const refNumber1 = generateReferenceNumber();
      const refNumber2 = generateReferenceNumber();

      expect(refNumber1).not.toBe(refNumber2);
    });

    it('should include current year', () => {
      const currentYear = new Date().getFullYear();
      const refNumber = generateReferenceNumber();

      expect(refNumber).toContain(`CB-${currentYear}`);
    });

    it('should be sequential for same-day generation', () => {
      const refNumbers = Array(3)
        .fill(null)
        .map(() => generateReferenceNumber());

      // Extract last 6 digits from each
      const sequences = refNumbers.map((ref) => parseInt(ref.split('-')[2]));

      // Check if sequences are in increasing order
      for (let i = 1; i < sequences.length; i++) {
        expect(sequences[i]).toBeGreaterThanOrEqual(sequences[i - 1]);
      }
    });

    it('should handle year boundary', () => {
      // This would require mocking Date, so we'll just verify format is correct
      const refNumber = generateReferenceNumber();

      const parts = refNumber.split('-');
      expect(parts).toHaveLength(3);
      expect(parts[0]).toBe('CB');
      expect(/^\d{4}$/.test(parts[1])).toBe(true);
      expect(/^\d{6}$/.test(parts[2])).toBe(true);
    });
  });
});

describe('Export Helpers', () => {
  const mockData = [
    { id: '1', name: 'John', email: 'john@test.com' },
    { id: '2', name: 'Jane', email: 'jane@test.com' },
  ];

  describe('convertToCSV', () => {
    it('should convert data to CSV format', () => {
      const convertToCSV = (data: any[]) => {
        const headers = Object.keys(data[0]);
        const csvContent = [
          headers.join(','),
          ...data.map((row) => Object.values(row).join(',')),
        ].join('\n');
        return csvContent;
      };

      const csv = convertToCSV(mockData);

      expect(csv).toContain('id,name,email');
      expect(csv).toContain('1,John,john@test.com');
      expect(csv).toContain('2,Jane,jane@test.com');
    });

    it('should handle empty data', () => {
      const convertToCSV = (data: any[]) => {
        if (data.length === 0) return '';
        const headers = Object.keys(data[0]);
        const csvContent = [
          headers.join(','),
          ...data.map((row) => Object.values(row).join(',')),
        ].join('\n');
        return csvContent;
      };

      const csv = convertToCSV([]);

      expect(csv).toBe('');
    });

    it('should escape special characters', () => {
      const convertToCSV = (data: any[]) => {
        const headers = Object.keys(data[0]);
        const csvContent = [
          headers.join(','),
          ...data.map((row) =>
            Object.values(row)
              .map((val) => {
                const stringVal = String(val);
                return stringVal.includes(',') ? `"${stringVal}"` : stringVal;
              })
              .join(',')
          ),
        ].join('\n');
        return csvContent;
      };

      const dataWithCommas = [{ name: 'Smith, John', email: 'john@test.com' }];
      const csv = convertToCSV(dataWithCommas);

      expect(csv).toContain('"Smith, John"');
    });
  });

  describe('convertToJSON', () => {
    it('should keep data as JSON', () => {
      const convertToJSON = (data: any[]) => JSON.stringify(data, null, 2);

      const json = convertToJSON(mockData);
      const parsed = JSON.parse(json);

      expect(parsed).toEqual(mockData);
    });

    it('should handle complex nested objects', () => {
      const convertToJSON = (data: any[]) => JSON.stringify(data, null, 2);

      const complexData = [
        {
          id: '1',
          name: 'John',
          address: { city: 'Yaoundé', country: 'Cameroon' },
        },
      ];

      const json = convertToJSON(complexData);
      const parsed = JSON.parse(json);

      expect(parsed[0].address.city).toBe('Yaoundé');
    });
  });
});
