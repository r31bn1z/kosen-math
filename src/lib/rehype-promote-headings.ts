type HastNode = {
  type: string;
  tagName?: string;
  children?: HastNode[];
};

const HEADING = /^h([1-6])$/;

function collectHeadings(node: HastNode, found: HastNode[]): void {
  if (node.type === 'element' && node.tagName && HEADING.test(node.tagName)) {
    found.push(node);
  }
  for (const child of node.children ?? []) {
    collectHeadings(child, found);
  }
}

/** Promote ###-only markdown so the page outline is h1 (layout) then h2. */
export function rehypePromoteHeadings() {
  return (tree: HastNode) => {
    const headings: HastNode[] = [];
    collectHeadings(tree, headings);
    if (headings.length === 0) {
      return;
    }

    const levels = headings.map((node) => Number(node.tagName?.slice(1)));
    const min = Math.min(...levels);
    if (min <= 2) {
      return;
    }

    const shift = min - 2;
    for (const heading of headings) {
      const next = Number(heading.tagName?.slice(1)) - shift;
      heading.tagName = `h${Math.min(6, Math.max(1, next))}`;
    }
  };
}
