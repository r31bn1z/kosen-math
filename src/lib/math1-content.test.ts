import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = path.join(process.cwd(), 'content/math1');

const EXPECTED: Record<string, number> = {
  ch01: 44,
  ch02: 21,
  ch03: 23,
  ch04: 35,
  ch05: 35,
  ch06: 17,
  ch07: 33,
  ch08: 34,
  ch09: 20,
  ch10: 24,
  ch11: 20,
  ch12: 15,
  ch13: 28,
  ch14: 16,
  ch15: 22,
  ch16: 23,
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

describe('math1 problem files', () => {
  const chapters = readdirSync(ROOT)
    .filter((name) => /^ch\d+$/.test(name))
    .sort();

  it('has chapters 1 through 16', () => {
    expect(chapters).toEqual(Object.keys(EXPECTED));
  });

  it('has the expected problem files and draft frontmatter', () => {
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
        expect(data.draft).toBe('true');
        expect(raw).not.toContain('</content>');
      }
    }
  });

  it('applies known math corrections', () => {
    expect(readProblem('ch01', 'q20.md')).toContain('\\frac{x+2y}{x-2y}');
    expect(readProblem('ch01', 'q37.md')).toContain('x^4+2x^3+2x^2+2x+1');
    expect(readProblem('ch01', 'q39.md')).toContain('\\frac{2(2x^2-5x+5)}{(2x-3)(x-1)}');
    expect(readProblem('ch01', 'q41.md')).toContain('\\frac{y-1}{x}');
    expect(readProblem('ch03', 'q06.md')).toContain('\\left(-\\frac{3}{2}, -\\frac{1}{4}\\right)');
    expect(readProblem('ch05', 'q11.md')).toContain('-3 < x < -\\dfrac{3}{2}');
    expect(readProblem('ch05', 'q16.md')).toContain('x > 12');
    expect(readProblem('ch05', 'q16.md')).not.toContain('3x > 12');
    expect(readProblem('ch05', 'q33.md')).toContain('$x=1$ の時で最小値');
    expect(readProblem('ch08', 'q06.md')).toContain('x^2+2x & x \\leq 0');
    expect(readProblem('ch08', 'q07.md')).toContain('x<-\\sqrt{3}');
    expect(readProblem('ch14', 'q03.md')).toContain('2bc\\cos A');
    expect(readProblem('ch16', 'q20.md')).toContain('\\pm2(x+1)');
    expect(readProblem('ch16', 'q22.md')).toContain('x^2 = 4y');
  });
});
