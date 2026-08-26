import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { rehypePromoteHeadings } from './src/lib/rehype-promote-headings';

export default defineConfig({
  site: 'https://kosen-math.r31bn1z.com',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => {
        const { pathname } = new URL(page);
        if (pathname.includes('404')) {
          return false;
        }
        if (pathname === '/3/') {
          return false;
        }
        return true;
      },
    }),
  ],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex, rehypePromoteHeadings],
    }),
  },
});
