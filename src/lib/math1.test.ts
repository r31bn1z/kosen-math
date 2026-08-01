import { describe, expect, it } from 'vitest';
import { filterPublished, neighbors, problemHref, sortByOrder } from './math1';

describe('filterPublished', () => {
  it('excludes draft:true and keeps undefined/false', () => {
    const items = [
      { id: 'a', draft: true },
      { id: 'b' },
      { id: 'c', draft: false },
    ];
    expect(filterPublished(items).map((x) => x.id)).toEqual(['b', 'c']);
  });
});

describe('sortByOrder', () => {
  it('sorts ascending by order', () => {
    expect(sortByOrder([{ order: 2 }, { order: 1 }]).map((x) => x.order)).toEqual([1, 2]);
  });
});

describe('neighbors', () => {
  it('returns prev/next within sorted list', () => {
    const items = [{ problem: 'q01' }, { problem: 'q02' }, { problem: 'q03' }];
    expect(neighbors(items, 'q02')).toEqual({
      prev: items[0],
      next: items[2],
    });
    expect(neighbors(items, 'q01').prev).toBeNull();
    expect(neighbors(items, 'q03').next).toBeNull();
  });
});

describe('problemHref', () => {
  it('builds trailing-slash path', () => {
    expect(problemHref('ch01', 'q01')).toBe('/1/ch01/q01/');
  });
});
