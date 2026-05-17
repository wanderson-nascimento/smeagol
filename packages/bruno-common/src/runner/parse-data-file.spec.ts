import { describe, expect, it } from '@jest/globals';
import {
  parseCsvContent,
  parseCsvLine,
  parseDataFileContent,
  parseJsonContent
} from './parse-data-file';

describe('parseCsvLine', () => {
  it('parses simple fields', () => {
    expect(parseCsvLine('a,b,c')).toEqual(['a', 'b', 'c']);
  });

  it('parses quoted fields with commas', () => {
    expect(parseCsvLine('"John, Jr.",dev')).toEqual(['John, Jr.', 'dev']);
  });

  it('parses escaped quotes', () => {
    expect(parseCsvLine('"He said ""hi""",x')).toEqual(['He said "hi"', 'x']);
  });
});

describe('parseCsvContent', () => {
  it('parses header and rows', () => {
    const csv = `name,job
John,Engineer
Jane,PM`;
    expect(parseCsvContent(csv)).toEqual([
      { name: 'John', job: 'Engineer' },
      { name: 'Jane', job: 'PM' }
    ]);
  });

  it('throws without data rows', () => {
    expect(() => parseCsvContent('name,job')).toThrow(/at least one data row/);
  });
});

describe('parseJsonContent', () => {
  it('parses array of objects', () => {
    const json = `[{"name":"A","n":1},{"name":"B"}]`;
    expect(parseJsonContent(json)).toEqual([
      { name: 'A', n: '1' },
      { name: 'B' }
    ]);
  });

  it('throws for non-array', () => {
    expect(() => parseJsonContent('{"a":1}')).toThrow(/array of objects/);
  });
});

describe('parseDataFileContent', () => {
  it('dispatches by type', () => {
    const result = parseDataFileContent('id\n1', 'csv');
    expect(result.sourceType).toBe('csv');
    expect(result.rows).toHaveLength(1);
  });
});
