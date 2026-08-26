import type { Year } from './math1';

export const SITE_NAME = '高専の数学解説';
export const SITE_ORIGIN = 'https://kosen-math.r31bn1z.com';
export const DEFAULT_DESCRIPTION =
  '『高専の数学1』『高専の数学2』『高専の数学3』に準拠した独自解説サイト。問題文は掲載せず、章・問番号で指します。';
export const OG_IMAGE_PATH = '/og.png';
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const OG_IMAGE_ALT = '高専の数学解説';

export type JsonLd = Record<string, unknown>;

export type BreadcrumbEntry = {
  name: string;
  path?: string;
};

export function withTrailingSlash(pathname: string): string {
  const prefixed = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (prefixed === '/') {
    return '/';
  }
  const last = prefixed.split('/').pop() ?? '';
  if (last.includes('.')) {
    return prefixed;
  }
  return prefixed.endsWith('/') ? prefixed : `${prefixed}/`;
}

export function canonicalUrl(pathname: string): string {
  return new URL(withTrailingSlash(pathname), SITE_ORIGIN).href;
}

export function assetUrl(path: string): string {
  return new URL(path, SITE_ORIGIN).href;
}

export function pageTitle(title: string): string {
  return title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
}

export function breadcrumbJsonLd(entries: BreadcrumbEntry[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: entries.map((entry, index) => {
      const item: Record<string, unknown> = {
        '@type': 'ListItem',
        position: index + 1,
        name: entry.name,
      };
      if (entry.path) {
        item.item = canonicalUrl(entry.path);
      }
      return item;
    }),
  };
}

export function websiteJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: canonicalUrl('/'),
    inLanguage: 'ja',
    description: DEFAULT_DESCRIPTION,
    publisher: {
      '@type': 'Person',
      name: 'r31bn1z',
      url: canonicalUrl('/developer/'),
    },
  };
}

export function organizationJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: canonicalUrl('/'),
    description: DEFAULT_DESCRIPTION,
    inLanguage: 'ja',
  };
}

export function collectionPageJsonLd(name: string, path: string, description: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    url: canonicalUrl(path),
    description,
    inLanguage: 'ja',
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: canonicalUrl('/'),
    },
  };
}

export function articleJsonLd(headline: string, path: string, description: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    url: canonicalUrl(path),
    description,
    inLanguage: 'ja',
    author: {
      '@type': 'Person',
      name: 'r31bn1z',
      url: canonicalUrl('/developer/'),
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: canonicalUrl('/'),
    },
    image: assetUrl(OG_IMAGE_PATH),
    mainEntityOfPage: canonicalUrl(path),
  };
}

export function profilePageJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: canonicalUrl('/developer/'),
    inLanguage: 'ja',
    mainEntity: {
      '@type': 'Person',
      name: 'r31bn1z',
      url: canonicalUrl('/developer/'),
      description: '高専の数学解説の執筆・運営',
    },
  };
}

export function problemDescription(
  chapterTitle: string,
  problemTitle: string,
  year: Year = 1,
): string {
  return `『高専の数学${year}』${chapterTitle} ${problemTitle}の独自解説。問題文は掲載せず、考え方と途中式をまとめています。`;
}

export function chapterDescription(chapterTitle: string, year: Year = 1): string {
  return `『高専の数学${year}』${chapterTitle}の問題解説一覧。各問は独自の解説です。`;
}

export function stringifyJsonLd(data: JsonLd | JsonLd[]): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
