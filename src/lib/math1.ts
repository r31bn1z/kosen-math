export type ProblemMeta = {
  chapter: string;
  section: string;
  problem: string;
  title: string;
  order: number;
  draft?: boolean;
};

export function filterPublished<T extends { draft?: boolean }>(items: T[]): T[] {
  return items.filter((item) => item.draft !== true);
}

export function sortByOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

export function neighbors<T extends { problem: string }>(
  items: T[],
  currentProblem: string,
): { prev: T | null; next: T | null } {
  const index = items.findIndex((item) => item.problem === currentProblem);
  if (index === -1) {
    return { prev: null, next: null };
  }
  return {
    prev: index > 0 ? items[index - 1]! : null,
    next: index < items.length - 1 ? items[index + 1]! : null,
  };
}

export type Year = 1 | 2;

export function problemHref(chapter: string, problem: string, year: Year = 1): string {
  return `/${year}/${chapter}/${problem}/`;
}
