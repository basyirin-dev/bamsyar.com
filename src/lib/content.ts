import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

// ── ARTICLES ─────────────────────────────────────────────────────────

/**
 * Returns all published (non-draft) articles, sorted newest first.
 * This is the canonical query used by the articles index page,
 * the home page featured article, and the RSS feed.
 */
export async function getPublishedArticles() {
  const articles = await getCollection('articles', ({ data }) => !data.draft);
  return articles.sort(
    (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf()
  );
}

/**
 * Returns the single featured article, or undefined if none is marked featured.
 * The home page uses this for the featured article slot.
 * If multiple articles have featured: true, returns the most recent one.
 */
export async function getFeaturedArticle() {
  const articles = await getPublishedArticles();
  return articles.find(a => a.data.featured) ?? articles[0] ?? undefined;
}

/**
 * Returns all unique tags across all published articles, sorted alphabetically.
 * Used by the tag filter component on the articles index.
 */
export async function getAllArticleTags(): Promise<string[]> {
  const articles = await getPublishedArticles();
  const tagSet = new Set(articles.flatMap(a => a.data.tags));
  return [...tagSet].sort();
}

/**
 * Returns all published articles that have the specified tag.
 * Used by tag-specific pages and for server-side tag filtering.
 */
export async function getArticlesByTag(tag: string): Promise<CollectionEntry<'articles'>[]> {
  const articles = await getPublishedArticles();
  return articles.filter(a => a.data.tags.includes(tag));
}

/**
 * Returns all published articles that have any of the specified tags.
 * Used for multi-tag filtering and cross-tag navigation.
 */
export async function getArticlesByTags(tags: string[]): Promise<CollectionEntry<'articles'>[]> {
  const articles = await getPublishedArticles();
  return articles.filter(a => a.data.tags.some(t => tags.includes(t)));
}

/**
 * Returns all published articles that share at least one tag with the
 * given article. Used for "Related articles" links at the bottom of
 * each article page.
 * Excludes the article itself; returns at most `limit` results.
 */
export async function getRelatedArticles(
  entry: CollectionEntry<'articles'>,
  limit = 3
) {
  const all = await getPublishedArticles();
  const entryTags = new Set(entry.data.tags);
  return all
    .filter(a => a.id !== entry.id && a.data.tags.some(t => entryTags.has(t)))
    .slice(0, limit);
}

// ── PAPERS ────────────────────────────────────────────────────────────

/**
 * Returns all papers sorted by status priority (published first,
 * in-progress last) and then by year descending within each group.
 *
 * Status order:
 *   published → accepted → under-review → submitted → in-progress
 *
 * This ordering matches what an academic reader expects on a papers
 * page: finished work first, work-in-progress last.
 */
const STATUS_ORDER = {
  'published':    0,
  'accepted':     1,
  'under-review': 2,
  'submitted':    3,
  'in-progress':  4,
} as const;

export async function getAllPapers() {
  const papers = await getCollection('papers');
  return papers.sort((a, b) => {
    const statusDiff =
      STATUS_ORDER[a.data.status] - STATUS_ORDER[b.data.status];
    if (statusDiff !== 0) return statusDiff;
    return b.data.year - a.data.year;
  });
}

/**
 * Returns papers grouped by status.
 * Used by the papers index page to render status-separated sections.
 *
 * Returns a Map (not a plain object) to preserve iteration order —
 * the Map is populated in STATUS_ORDER sequence, so iterating it
 * renders sections in the correct display order automatically.
 */
export async function getPapersByStatus() {
  const papers = await getAllPapers();
  const groups = new Map<string, CollectionEntry<'papers'>[]>([
    ['published',    []],
    ['accepted',     []],
    ['under-review', []],
    ['submitted',    []],
    ['in-progress',  []],
  ]);
  for (const paper of papers) {
    groups.get(paper.data.status)!.push(paper);
  }
  // Remove empty groups so the template does not render empty sections.
  for (const [key, value] of groups) {
    if (value.length === 0) groups.delete(key);
  }
  return groups;
}

/**
 * Returns the featured paper, or the most recent published paper
 * if none is explicitly featured, or undefined if no papers exist.
 */
export async function getFeaturedPaper() {
  const papers = await getAllPapers();
  return (
    papers.find(p => p.data.featured) ??
    papers.find(p => p.data.status === 'published') ??
    papers[0] ??
    undefined
  );
}

// ── PROJECTS ──────────────────────────────────────────────────────────

/**
 * Returns all projects sorted by status priority (published first,
 * in-progress last) and then by featured status (featured first).
 *
 * Status order:
 *   published → accepted → under-review → submitted → in-progress
 *
 * This ordering matches what a reader expects on a projects page:
 * completed work first, work-in-progress last.
 */
export async function getAllProjects() {
  const projects = await getCollection('projects');
  return projects.sort((a, b) => {
    const statusOrder = {
      'published':    0,
      'accepted':     1,
      'under-review': 2,
      'submitted':    3,
      'in-progress':  4,
    } as const;

    const statusDiff = statusOrder[a.data.status] - statusOrder[b.data.status];
    if (statusDiff !== 0) return statusDiff;

    // Within same status, featured projects first
    if (a.data.featured !== b.data.featured) {
      return b.data.featured ? 1 : -1;
    }

    return 0;
  });
}

/**
 * Returns the featured project, or the first project if none is
 * explicitly featured, or undefined if no projects exist.
 */
export async function getFeaturedProject() {
  const projects = await getAllProjects();
  return (
    projects.find(p => p.data.featured) ??
    projects[0] ??
    undefined
  );
}

/**
 * Returns projects that are related to a specific paper by ID.
 * Used for showing related projects on paper pages.
 */
export async function getRelatedProjects(paperId: string) {
  const projects = await getAllProjects();
  return projects.filter(p => p.data.relatedPapers?.includes(paperId));
}

/**
 * Returns papers that are related to a specific project by ID.
 * Used for showing related papers on project pages.
 */
export async function getRelatedPapers(projectId: string) {
  const papers = await getAllPapers();
  return papers.filter(p => p.data.relatedProjects?.includes(projectId));
}

// ── CROSS-COLLECTION UTILITIES ────────────────────────────────────────

/**
 * Returns all articles and papers that share at least one tag with
 * the given tag list. Used for cross-linking between the two collections.
 * For example: on a paper page, show articles with overlapping tags.
 */
export async function getCrossLinkedArticles(tags: string[], excludeId?: string) {
  const tagSet = new Set(tags);
  const articles = await getPublishedArticles();
  return articles
    .filter(a => a.id !== excludeId && a.data.tags.some(t => tagSet.has(t)))
    .slice(0, 4);
}
