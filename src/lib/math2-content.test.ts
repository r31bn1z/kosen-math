import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = path.join(process.cwd(), 'content/math2');

const EXPECTED: Record<string, number> = {
  ch01: 35,
  ch02: 19,
  ch03: 21,
  ch04: 20,
  ch05: 20,
  ch06: 16,
  ch07: 35,
  ch08: 14,
  ch09: 16,
  ch10: 18,
  ch11: 23,
  ch12: 20,
  ch13: 49,
  ch14: 23,
  ch15: 25,
  ch16: 24,
  ch17: 38,
  ch18: 26,
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

describe('math2 problem files', () => {
  const chapters = readdirSync(ROOT)
    .filter((name) => /^ch\d+$/.test(name))
    .sort();

  it('has chapters 1 through 18', () => {
    expect(chapters).toEqual(Object.keys(EXPECTED));
  });

  it('has the expected problem files and published frontmatter', () => {
    for (const [chapter, count] of Object.entries(EXPECTED)) {
      const n = Number(chapter.slice(2));
      const files = readdirSync(path.join(ROOT, chapter))
        .filter((name) => /^q\d+\.md$/.test(name))
        .sort();
      expect(files).toEqual(
        Array.from({ length: count }, (_, i) => `q${String(i + 1).padStart(2, '0')}.md`),
      );
      for (const [index, file] of files.entries()) {
        const order = index + 1;
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
    expect(readProblem('ch01', 'q11.md')).toContain('\\frac{1}{k(k+2)}');
    expect(readProblem('ch01', 'q11.md')).not.toContain('\\frac{1}{n(n+2)}');
    expect(readProblem('ch02', 'q14.md')).toContain('1-\\left(a-\\dfrac{2}{a}\\right)');
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
