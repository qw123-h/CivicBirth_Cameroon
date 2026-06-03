import { Response } from 'express';

export function generateCSV(headers: string[], rows: any[][]): string {
  const csv = [
    headers.map((h) => `"${h}"`).join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
    ),
  ].join('\n');

  return csv;
}

export function sendCSVResponse(
  res: Response,
  csv: string,
  filename: string,
): void {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8-sig');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send('\uFEFF' + csv); // BOM for Excel compatibility
}

export function generateJSON(data: any[]): string {
  return JSON.stringify(data, null, 2);
}

export function sendJSONResponse(
  res: Response,
  data: any[],
  filename: string,
): void {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.json(data);
}

export interface ExportFieldConfig {
  key: string;
  header: string;
  format?: (value: any) => string;
}

export function flattenData(
  records: any[],
  fields: ExportFieldConfig[],
): any[][] {
  return records.map((record) =>
    fields.map((field) => {
      const value = record[field.key];
      return field.format ? field.format(value) : value || '';
    }),
  );
}

export function getExportFields(): ExportFieldConfig[] {
  return [
    {
      key: 'referenceNumber',
      header: 'Reference Number',
    },
    {
      key: 'childName',
      header: 'Child Name',
    },
    {
      key: 'childSex',
      header: 'Sex',
    },
    {
      key: 'dob',
      header: 'Date of Birth',
      format: (value) => new Date(value).toLocaleDateString('fr-FR'),
    },
    {
      key: 'birthPlace',
      header: 'Birth Place',
    },
    {
      key: 'region',
      header: 'Region',
      format: (value) => value?.nameFr || '',
    },
    {
      key: 'district',
      header: 'District',
    },
    {
      key: 'motherName',
      header: 'Mother Name',
    },
    {
      key: 'fatherName',
      header: 'Father Name',
    },
    {
      key: 'channel',
      header: 'Channel',
    },
    {
      key: 'status',
      header: 'Status',
    },
    {
      key: 'createdAt',
      header: 'Submitted Date',
      format: (value) => new Date(value).toLocaleDateString('fr-FR'),
    },
    {
      key: 'validatedAt',
      header: 'Validated Date',
      format: (value) => (value ? new Date(value).toLocaleDateString('fr-FR') : '-'),
    },
  ];
}
