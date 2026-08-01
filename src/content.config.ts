import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const problems = defineCollection({
  loader: glob({
    pattern: '**/q*.md',
    base: './content/math1',
  }),
  schema: z.object({
    title: z.string(),
    order: z.number().int().positive(),
    draft: z.boolean().optional(),
  }),
});

export const collections = { problems };
