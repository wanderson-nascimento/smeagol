export type IterationRow = Record<string, string>;

export type ParsedDataFile = {
  rows: IterationRow[];
  sourceType: 'csv' | 'json';
  fileName?: string;
};

const normalizeRow = (row: Record<string, unknown>): IterationRow => {
  const normalized: IterationRow = {};
  for (const [key, value] of Object.entries(row)) {
    if (value === null || value === undefined) {
      normalized[key] = '';
    } else if (typeof value === 'object') {
      normalized[key] = JSON.stringify(value);
    } else {
      normalized[key] = String(value);
    }
  }
  return normalized;
};

/**
 * Parse a single CSV line respecting quoted fields (RFC 4180 subset).
 */
export const parseCsvLine = (line: string): string[] => {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  fields.push(current);
  return fields.map((f) => f.trim());
};

export const parseCsvContent = (content: string): IterationRow[] => {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    throw new Error('CSV file must contain a header row and at least one data row');
  }

  const headers = parseCsvLine(lines[0]);
  if (!headers.length || headers.some((h) => !h)) {
    throw new Error('CSV header row must contain at least one non-empty column name');
  }

  const rows: IterationRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row: IterationRow = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] ?? '';
    });
    rows.push(row);
  }

  return rows;
};

export const parseJsonContent = (content: string): IterationRow[] => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('Invalid JSON data file');
  }

  if (!Array.isArray(parsed)) {
    throw new Error('JSON data file must be an array of objects');
  }

  if (parsed.length === 0) {
    throw new Error('JSON data file must contain at least one object');
  }

  return parsed.map((entry, index) => {
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new Error(`JSON data file entry at index ${index} must be an object`);
    }
    return normalizeRow(entry as Record<string, unknown>);
  });
};

export const parseDataFileContent = (content: string, type: 'csv' | 'json'): ParsedDataFile => {
  const rows = type === 'csv' ? parseCsvContent(content) : parseJsonContent(content);
  return { rows, sourceType: type };
};

export const parseDataFileFromPath = async (
  filePath: string,
  fs: { readFile: (path: string, encoding: string) => Promise<string> | string }
): Promise<ParsedDataFile> => {
  const lower = filePath.toLowerCase();
  let sourceType: 'csv' | 'json';

  if (lower.endsWith('.csv')) {
    sourceType = 'csv';
  } else if (lower.endsWith('.json')) {
    sourceType = 'json';
  } else {
    throw new Error('Data file must have a .csv or .json extension');
  }

  const content = await fs.readFile(filePath, 'utf8');
  const fileName = filePath.split(/[/\\]/).pop();
  const parsed = parseDataFileContent(String(content), sourceType);
  return { ...parsed, fileName };
};
