import { describe, expect, it } from 'vitest';
import {
  SITE_NAME,
  articleJsonLd,
  assetUrl,
  breadcrumbJsonLd,
  canonicalUrl,
  chapterDescription,
  pageTitle,
  problemDescription,
  stringifyJsonLd,
  withTrailingSlash,
} from './seo';

describe('withTrailingSlash', () => {
  it('keeps the site root as /', () => {
    expect(withTrailingSlash('/')).toBe('/');
  });

  it('adds a trailing slash to directory paths', () => {
    expect(withTrailingSlash('/1/ch01/q01')).toBe('/1/ch01/q01/');
    expect(withTrailingSlash('/1/ch01/q01/')).toBe('/1/ch01/q01/');
  });

  it('does not alter file-like paths', () => {
    expect(withTrailingSlash('/og.png')).toBe('/og.png');
  });
});

describe('canonicalUrl', () => {
  it('builds absolute custom-domain URLs', () => {
    expect(canonicalUrl('/1/ch01/q01')).toBe('https://kosen-math.r31bn1z.com/1/ch01/q01/');
    expect(canonicalUrl('/')).toBe('https://kosen-math.r31bn1z.com/');
  });
});

describe('pageTitle', () => {
  it('does not duplicate the site name on the homepage', () => {
    expect(pageTitle(SITE_NAME)).toBe(SITE_NAME);
  });

  it('appends the site name on inner pages', () => {
    expect(pageTitle('第1章 1.1')).toBe('第1章 1.1 | 高専の数学解説');
  });
});

describe('descriptions', () => {
  it('mentions the textbook, chapter, and original commentary', () => {
    expect(problemDescription('第1章', '1.1')).toContain('第1章 1.1');
    expect(problemDescription('第1章', '1.1')).toContain('独自解説');
    expect(chapterDescription('第16章')).toContain('第16章');
  });
});

describe('json-ld', () => {
  it('emits BreadcrumbList with absolute item URLs', () => {
    const data = breadcrumbJsonLd([
      { name: '高専の数学解説', path: '/' },
      { name: '高専の数学1', path: '/1/' },
      { name: '1.1' },
    ]);
    expect(data['@type']).toBe('BreadcrumbList');
    const items = data.itemListElement as Array<Record<string, unknown>>;
    expect(items[0]?.item).toBe('https://kosen-math.r31bn1z.com/');
    expect(items[2]?.item).toBeUndefined();
  });

  it('emits Article markup with author and image', () => {
    const data = articleJsonLd('第1章 1.1', '/1/ch01/q01/', 'desc');
    expect(data['@type']).toBe('Article');
    expect(data.image).toBe(assetUrl('/og.png'));
    expect((data.author as Record<string, unknown>).name).toBe('r31bn1z');
  });

  it('escapes < in JSON-LD', () => {
    expect(stringifyJsonLd({ name: 'a<b' })).toContain('\\u003c');
    expect(stringifyJsonLd({ name: 'a<b' })).not.toContain('<');
  });
});
