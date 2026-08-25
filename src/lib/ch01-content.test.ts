import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const CH01 = path.join(process.cwd(), 'content/math1/ch01');

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

describe('ch01 problem files', () => {
  const files = readdirSync(CH01)
    .filter((name) => /^q\d+\.md$/.test(name))
    .sort();

  it('has q01 through q44 and no extras', () => {
    expect(files).toEqual(
      Array.from({ length: 44 }, (_, i) => `q${String(i + 1).padStart(2, '0')}.md`),
    );
  });

  it('uses expected frontmatter and remains draft', () => {
    for (const [index, file] of files.entries()) {
      const n = index + 1;
      const raw = readFileSync(path.join(CH01, file), 'utf8');
      const data = parseFrontmatter(raw);
      expect(data.title).toBe(`"1.${n}"`);
      expect(data.order).toBe(String(n));
      expect(data.draft).toBe('true');
      expect(raw).not.toContain('二次方程式');
      expect(raw).not.toContain('</content>');
    }
  });

  it('applies chapter-1 math corrections', () => {
    const q20 = readFileSync(path.join(CH01, 'q20.md'), 'utf8');
    expect(q20).toContain('\\frac{x+2y}{x-2y}');
    expect(q20).not.toContain('(x-6y)(x-y)');

    const q37 = readFileSync(path.join(CH01, 'q37.md'), 'utf8');
    expect(q37).toContain('x^4+2x^3+2x^2+2x+1');
    expect(q37).not.toContain('2x^2+2x-1');

    const q39 = readFileSync(path.join(CH01, 'q39.md'), 'utf8');
    expect(q39).toContain('\\frac{2(2x^2-5x+5)}{(2x-3)(x-1)}');
    expect(q39).not.toContain('} = 2$$');

    const q41 = readFileSync(path.join(CH01, 'q41.md'), 'utf8');
    expect(q41).toContain('\\frac{y-1}{x}');
    expect(q41).not.toContain('\\frac{1+y}{x}');
  });
});
