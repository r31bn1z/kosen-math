import { getCollection, type CollectionEntry } from 'astro:content';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { filterPublished, sortByOrder } from './math1';

export type ChapterMeta = { id: string; title: string; order: number };
export type SectionMeta = { id: string; title: string; order: number; chapterId: string };
export type ProblemEntry = {
  id: string;
  chapter: string;
  section: string;
  problem: string;
  title: string;
  order: number;
  draft?: boolean;
  entry: CollectionEntry<'problems'>;
};

export type Catalog = {
  chapters: ChapterMeta[];
  sectionsByChapter: Record<string, SectionMeta[]>;
  problemsBySection: Record<string, ProblemEntry[]>;
};

const CONTENT_ROOT = path.join(process.cwd(), 'content/math1');

function sectionKey(chapter: string, section: string): string {
  return `${chapter}/${section}`;
}

function parseProblemId(id: string): { chapter: string; section: string; problem: string } | null {
  const parts = id.split('/');
  if (parts.length < 3) return null;
  const chapter = parts[0]!;
  const section = parts[1]!;
  const file = parts[parts.length - 1]!;
  const problem = file.replace(/\.mdx?$/, '');
  if (!chapter.startsWith('ch') || !section.startsWith('s') || !problem.startsWith('q')) {
    return null;
  }
  return { chapter, section, problem };
}

async function readMeta(filePath: string): Promise<{ title: string; order: number }> {
  const raw = await readFile(filePath, 'utf8');
  const data = JSON.parse(raw) as { title?: string; order?: number };
  if (typeof data.title !== 'string' || typeof data.order !== 'number') {
    throw new Error(`Invalid meta at ${filePath}`);
  }
  return { title: data.title, order: data.order };
}

export async function getCatalog(): Promise<Catalog> {
  const collection = await getCollection('problems');
  const published = filterPublished(
    collection.map((entry) => {
      const parsed = parseProblemId(entry.id);
      if (!parsed) {
        throw new Error(`Unexpected problem id: ${entry.id}`);
      }
      return {
        id: entry.id,
        chapter: parsed.chapter,
        section: parsed.section,
        problem: parsed.problem,
        title: entry.data.title,
        order: entry.data.order,
        draft: entry.data.draft,
        entry,
      } satisfies ProblemEntry;
    }),
  );

  const problemsBySection: Record<string, ProblemEntry[]> = {};
  for (const problem of published) {
    const key = sectionKey(problem.chapter, problem.section);
    problemsBySection[key] ??= [];
    problemsBySection[key].push(problem);
  }
  for (const key of Object.keys(problemsBySection)) {
    problemsBySection[key] = sortByOrder(problemsBySection[key]!);
  }

  const chapterDirs = (await readdir(CONTENT_ROOT, { withFileTypes: true }))
    .filter((d) => d.isDirectory() && d.name.startsWith('ch'))
    .map((d) => d.name);

  const chapters: ChapterMeta[] = [];
  const sectionsByChapter: Record<string, SectionMeta[]> = {};

  for (const chapterId of chapterDirs) {
    const chapterMeta = await readMeta(path.join(CONTENT_ROOT, chapterId, 'meta.json'));
    const sectionDirs = (
      await readdir(path.join(CONTENT_ROOT, chapterId), { withFileTypes: true })
    )
      .filter((d) => d.isDirectory() && d.name.startsWith('s'))
      .map((d) => d.name);

    const sections: SectionMeta[] = [];
    for (const sectionId of sectionDirs) {
      const key = sectionKey(chapterId, sectionId);
      if (!problemsBySection[key]?.length) continue;
      const sectionMeta = await readMeta(
        path.join(CONTENT_ROOT, chapterId, sectionId, 'meta.json'),
      );
      sections.push({
        id: sectionId,
        title: sectionMeta.title,
        order: sectionMeta.order,
        chapterId,
      });
    }

    if (sections.length === 0) continue;
    chapters.push({ id: chapterId, title: chapterMeta.title, order: chapterMeta.order });
    sectionsByChapter[chapterId] = sortByOrder(sections);
  }

  return {
    chapters: sortByOrder(chapters),
    sectionsByChapter,
    problemsBySection,
  };
}

export function getSectionProblems(
  catalog: Catalog,
  chapter: string,
  section: string,
): ProblemEntry[] {
  return catalog.problemsBySection[sectionKey(chapter, section)] ?? [];
}
