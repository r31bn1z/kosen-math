import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = path.join(process.cwd(), 'content/math3');

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

const EXPECTED: Record<string, number[]> = {
  ch01: range(1, 32),
  ch02: range(1, 13),
  ch03: range(1, 27),
  ch04: range(1, 18),
  ch05: [...range(1, 9), ...range(11, 44)],
  ch06: range(1, 24),
  ch07: range(1, 32),
  ch08: range(1, 27),
  ch09: range(1, 33),
  ch10: range(1, 27),
  ch11: range(1, 34),
};

function parseFrontmatter(raw: string): Record<string, string> {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) {
    throw new Error('missing frontmatter');
  }
  const data: Record<string, string> = {};
  for (const line of match[1]!.split('\n')) {
    const sep = line.indexOf(':');
    data[line.slice(0, sep).trim()] = line.slice(sep + 1).trim();
  }
  return data;
}

function readProblem(chapter: string, file: string): string {
  return readFileSync(path.join(ROOT, chapter, file), 'utf8');
}

describe('math3 problem files', () => {
  const chapters = readdirSync(ROOT)
    .filter((name) => /^ch\d+$/.test(name))
    .sort();

  it('has chapters 1 through 11', () => {
    expect(chapters).toEqual(Object.keys(EXPECTED));
  });

  it('has the expected problem files and published frontmatter', () => {
    for (const [chapter, numbers] of Object.entries(EXPECTED)) {
      const n = Number(chapter.slice(2));
      const files = readdirSync(path.join(ROOT, chapter))
        .filter((name) => /^q\d+\.md$/.test(name))
        .sort();
      expect(files).toEqual(numbers.map((num) => `q${String(num).padStart(2, '0')}.md`));
      for (const order of numbers) {
        const file = `q${String(order).padStart(2, '0')}.md`;
        const raw = readProblem(chapter, file);
        const data = parseFrontmatter(raw);
        expect(data.title).toBe(`"${n}.${order}"`);
        expect(data.order).toBe(String(order));
        expect(data.draft).toBeUndefined();
        expect(raw).not.toContain('draft: true');
        expect(raw).not.toContain('</content>');
      }
    }
  });

  it('applies known math corrections', () => {
    expect(readProblem('ch03', 'q12.md')).toContain('\\dfrac{4}{(1-x)^3}');
    expect(readProblem('ch03', 'q12.md')).not.toContain('\\dfrac{6}{(1-x)^3}');
  });

  it('does not open fenced display math with $$meta on the same line', () => {
    for (const chapter of Object.keys(EXPECTED)) {
      const files = readdirSync(path.join(ROOT, chapter)).filter((name) => /^q\d+\.md$/.test(name));
      for (const file of files) {
        for (const [index, line] of readProblem(chapter, file).split('\n').entries()) {
          const dollars = line.match(/\$\$/g) ?? [];
          if (line.startsWith('$$') && line !== '$$' && dollars.length === 1) {
            throw new Error(`${chapter}/${file}:${index + 1} opens $$ with meta: ${line}`);
          }
        }
      }
    }
  });
});
