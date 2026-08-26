import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const problemSchema = z.object({
  title: z.string(),
  order: z.number().int().positive(),
  draft: z.boolean().optional(),
});

const problems = defineCollection({
  loader: glob({
    pattern: '**/q*.md',
    base: './content/math1',
  }),
  schema: problemSchema,
});

const problems2 = defineCollection({
  loader: glob({
    pattern: '**/q*.md',
    base: './content/math2',
  }),
  schema: problemSchema,
});

export const collections = { problems, problems2 };
