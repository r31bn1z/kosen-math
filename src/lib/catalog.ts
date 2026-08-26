import { getCollection, type CollectionEntry } from 'astro:content';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { filterPublished, sortByOrder, type Year } from './math1';

export type ChapterMeta = { id: string; title: string; order: number };
export type ProblemEntry = {
  id: string;
  chapter: string;
  problem: string;
  title: string;
  order: number;
  draft?: boolean;
  entry: CollectionEntry<'problems'> | CollectionEntry<'problems2'>;
};

export type Catalog = {
  chapters: ChapterMeta[];
  problemsByChapter: Record<string, ProblemEntry[]>;
};

const YEAR_CONFIG = {
  1: { collection: 'problems' as const, root: 'content/math1' },
  2: { collection: 'problems2' as const, root: 'content/math2' },
};

function parseProblemId(id: string): { chapter: string; problem: string } | null {
  const parts = id.split('/');
  if (parts.length < 2) return null;
  const chapter = parts[0]!;
  const file = parts[parts.length - 1]!;
  const problem = file.replace(/\.mdx?$/, '');
  if (!chapter.startsWith('ch') || !problem.startsWith('q')) {
    return null;
  }
  return { chapter, problem };
}

async function readMeta(filePath: string): Promise<{ title: string; order: number }> {
  const raw = await readFile(filePath, 'utf8');
  const data = JSON.parse(raw) as { title?: string; order?: number };
  if (typeof data.title !== 'string' || typeof data.order !== 'number') {
    throw new Error(`Invalid meta at ${filePath}`);
  }
  return { title: data.title, order: data.order };
}

export async function getCatalog(year: Year = 1): Promise<Catalog> {
  const config = YEAR_CONFIG[year];
  const collection = await getCollection(config.collection);
  const mapped = collection.map((entry) => {
    const parsed = parseProblemId(entry.id);
    if (!parsed) {
      throw new Error(`Unexpected problem id: ${entry.id}`);
    }
    return {
      id: entry.id,
      chapter: parsed.chapter,
      problem: parsed.problem,
      title: entry.data.title,
      order: entry.data.order,
      draft: entry.data.draft,
      entry,
    } satisfies ProblemEntry;
  });
  const published = filterPublished(mapped);

  const problemsByChapter: Record<string, ProblemEntry[]> = {};
  for (const problem of published) {
    problemsByChapter[problem.chapter] ??= [];
    problemsByChapter[problem.chapter]!.push(problem);
  }
  for (const key of Object.keys(problemsByChapter)) {
    problemsByChapter[key] = sortByOrder(problemsByChapter[key]!);
  }

  const contentRoot = path.join(process.cwd(), config.root);
  const chapterDirs = (await readdir(contentRoot, { withFileTypes: true }))
    .filter((d) => d.isDirectory() && d.name.startsWith('ch'))
    .map((d) => d.name);

  const chapters: ChapterMeta[] = [];
  for (const chapterId of chapterDirs) {
    if (!problemsByChapter[chapterId]?.length) continue;
    const chapterMeta = await readMeta(path.join(contentRoot, chapterId, 'meta.json'));
    chapters.push({ id: chapterId, title: chapterMeta.title, order: chapterMeta.order });
  }

  return {
    chapters: sortByOrder(chapters),
    problemsByChapter,
  };
}

export function getChapterProblems(catalog: Catalog, chapter: string): ProblemEntry[] {
  return catalog.problemsByChapter[chapter] ?? [];
}
