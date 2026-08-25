import { describe, expect, it } from 'vitest';
import { rehypePromoteHeadings } from './rehype-promote-headings';

describe('rehypePromoteHeadings', () => {
  it('promotes h3 to h2 when no higher heading exists', () => {
    const tree = {
      type: 'root',
      children: [
        { type: 'element', tagName: 'h3', children: [] },
        { type: 'element', tagName: 'h3', children: [] },
      ],
    };
    rehypePromoteHeadings()(tree);
    expect(tree.children.map((node) => node.tagName)).toEqual(['h2', 'h2']);
  });

  it('leaves h2 in place', () => {
    const tree = {
      type: 'root',
      children: [{ type: 'element', tagName: 'h2', children: [] }],
    };
    rehypePromoteHeadings()(tree);
    expect(tree.children[0]?.tagName).toBe('h2');
  });
});
