import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import type { CollectionEntry } from '../types/content';

// ═══════════════════════════════════════════
// SHARED VALIDATORS
// Reusable Zod refinements used across multiple schemas.
// Define once here rather than duplicating in each collection.
// ═══════════════════════════════════════════

/**
 * arXiv identifier validator.
 *
 * The arXiv identifier format changed in April 2007.
 * Post-2007 format: YYMM.NNNNN (4 digits year-month, 5-digit sequence number)
 * Examples: "2603.01234", "2412.99999"
 * Old format (pre-2007): subject-class/YYMMNNN — not relevant for your work.
 *
 * The regex below enforces the post-2007 format strictly.
 * Using z.string().regex() rather than z.string() prevents a field populated
 * with a DOI, URL, or freeform text from silently passing as a valid arXiv ID.
 */
const arxivIdSchema = z
  .string()
  .regex(
    /^\d{4}\.\d{4,5}$/,
    'arXiv ID must be in post-2007 format: YYMM.NNNNN (e.g., "2603.01234")'
  )
  .optional();

/**
 * URL validator with an explicit error message.
 * z.string().url() produces a cryptic default message; this makes build
 * errors readable when a URL field is malformed.
 */
const urlSchema = z
  .string()
  .url('Must be a fully qualified URL including https://')
  .optional();

/**
 * Tag array validator.
 * Tags must be non-empty strings; no empty string tags.
 * Minimum 1 tag required — prevents untagged entries which break
 * the tag-filter functionality on the articles index page.
 */
const tagsSchema = z
  .array(z.string().min(1, 'Tag cannot be an empty string'))
  .min(1, 'At least one tag is required');


// ═══════════════════════════════════════════
// ARTICLES COLLECTION
//
// Covers: blog-style long-form articles published on the site.
// Primary entry: the H-Bar Model article.
// Secondary entries: future articles on PIRL, schema coherence,
// delegation gradient, AI training, etc.
//
// File format: .mdx (MDX required, not .md, because articles
// embed React island components — the interactive delegation gradient
// figure and the Callout component require MDX's JSX support).
// ═══════════════════════════════════════════
const articles = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/articles' }),
  schema: z.object({

    // ── REQUIRED CORE FIELDS ──────────────────────────────────────────

    /**
     * Full article title as it appears in the <h1>, browser tab, and
     * Open Graph card. No length limit enforced here — keep it under
     * 70 characters by convention so it does not truncate in search results.
     * The BaseLayout receives this as the `title` prop.
     */
    title: z.string().min(1),

    /**
     * One or two sentences. This is the meta description, the OG description,
     * and the article card subtitle on the articles index.
     * Target: 120–160 characters for search snippet optimisation.
     * Not enforced by length here — enforced by authoring discipline.
     */
    description: z.string().min(1),

    /**
     * z.coerce.date() accepts ISO 8601 strings from frontmatter YAML
     * ("2026-03-20") and coerces them to JavaScript Date objects.
     * Without .coerce, z.date() requires an actual Date, which YAML
     * cannot represent — it would always fail at build time.
     * Stored as a Date; formatted to string in page components using
     * .toLocaleDateString() or a custom formatter.
     */
    publishDate: z.coerce.date(),

    /**
     * Required array of at least one string tag.
     * Tags are used for filtering on the articles index page and for
     * the Open Graph og:article:tag property.
     * Canonical tag values for this project:
     *   "AI Training", "Schema Coherence", "H-Bar Model",
     *   "Compositional Generalization", "PIRL", "Delegation Gradient",
     *   "Curriculum Learning", "Formal Methods", "Continual Learning"
     * Consistency matters: "schema coherence" and "Schema Coherence"
     * are two separate tags in a case-sensitive comparison.
     * Use title case throughout.
     */
    tags: tagsSchema,

    // ── OPTIONAL FIELDS ──────────────────────────────────────────────

    /**
     * The date the article was last substantially revised.
     * Displayed in the article header as "Updated: [date]" when present.
     * Google uses this for freshness signals. Omit for new articles;
     * add when a correction or major expansion is made.
     */
    updatedDate: z.coerce.date().optional(),

    /**
     * arXiv preprint ID linked to this article.
     * When present, the article page renders an arXiv badge linking to
     * https://arxiv.org/abs/{arxivId}. Also populates the
     * citation_arxiv_id Google Scholar meta tag in the BaseLayout.
     *
     * Populate this field the moment the H-Bar preprint goes live.
     * The field is optional (undefined) until then — do not use a
     * placeholder string like "pending", which would pass z.string()
     * but fail the regex validator and produce a useful build error.
     */
    arxivId: arxivIdSchema,

    /**
     * Controls whether this article appears in collection queries.
     * draft: true → excluded from getCollection() in page components
     *   via the standard filter: ({ data }) => !data.draft
     * draft: false (default) → included in all queries.
     *
     * Use this during the authoring process in Stage 5. Push draft
     * articles to the `drafts` branch and review at the Cloudflare
     * Pages preview URL without publishing to main.
     */
    draft: z.boolean().default(false),


    /**
     * A custom hero/OG image path relative to the `public/` directory.
     * When present, overrides the site-wide fallback OG image.
     * Example: "/og/h-bar-model.png"
     *
     * Not implemented in Stage 1 (site-wide fallback is used).
     * Add per-article OG images in Stage 7. The field is defined
     * now so Stage 7 does not require a schema change.
     */
    ogImage: z.string().optional(),

    /**
     * Feature flag: should this article appear in the "Featured" slot
     * on the home page? At most one article should have this set to true
     * at any given time. The home page component picks the first
     * featured article found — no deduplication logic required.
     */
    featured: z.boolean().default(false),

    /**
     * Reading time in minutes, automatically calculated from article content.
     * This field is populated by the remark-reading-time plugin and should
     * not be manually set in frontmatter.
     */
    readingTime: z.number().optional(),
  }),
});


// ═══════════════════════════════════════════
// PAPERS COLLECTION
//
// Covers: formal academic papers — submitted, under review,
// accepted, or published. One file per paper.
//
// File format: .md (not .mdx). Paper entries do not embed
// React components; they are data records rendered by a
// page template, not self-rendering documents.
// Keeping them as .md makes them portable and editable
// outside the Astro context (e.g., in Obsidian).
// ═══════════════════════════════════════════
const papers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/papers' }),
  schema: z.object({

    // ── REQUIRED CORE FIELDS ──────────────────────────────────────────

    /**
     * Full paper title as it would appear in a citation.
     * Use the exact title submitted to the venue.
     * For the H-Bar paper, this should match the arXiv submission title
     * exactly to avoid Scholar disambiguation failures.
     */
    title: z.string().min(1),

    /**
     * Author list in citation order.
     * Format each name as "First Last" (no initials unless the
     * author always publishes with initials).
     * Your name should appear exactly as you want it indexed by
     * Google Scholar and Semantic Scholar.
     * Example: ["Basyirin Amsyar"]
     */
    authors: z.array(z.string().min(1)).min(1),

    /**
     * Submission or target year as a 4-digit integer.
     * For in-progress papers, this is the intended submission year.
     * Stored as a number for sort operations on the papers index.
     */
    year: z.number().int().min(2020).max(2035),

    /**
     * Publication status. This is the most consequential field for
     * the scholarship committee reader. The enum values are precise
     * and ordered — use the most accurate status at all times.
     *
     * "in-progress"  → Active writing; not submitted to any venue.
     *                  This is the correct value for the H-Bar paper now.
     * "submitted"    → Submitted and awaiting desk decision.
     * "under-review" → Past desk check; in peer review.
     * "accepted"     → Accepted; not yet published with DOI.
     * "published"    → Published with DOI and/or in proceedings.
     *
     * The papers index page renders a colour-coded badge per status.
     * Do not use "in-progress" to mean "I have notes about this idea."
     * It means active drafting is underway and the paper exists.
     */
    status: z.enum([
      'in-progress',
      'submitted',
      'under-review',
      'accepted',
      'published',
    ]),

    /**
     * Abstract as it appears in the submission or arXiv preprint.
     * Displayed truncated (first two sentences) on the papers index,
     * expandable to full text. Stored in full here.
     *
     * For in-progress papers: write the target abstract now.
     * This is not premature — writing the abstract before the paper
     * is complete is a standard practice in academic writing.
     * The abstract defines the contribution claim; having it in the
     * schema forces you to commit to a specific formulation.
     */
    abstract: z.string().min(1),

    /**
     * Tags are used for filtering and cross-linking between
     * the articles and papers collections (e.g., showing related
     * papers on an article page).
     * Use the same tag vocabulary as the articles collection.
     */
    tags: tagsSchema,

    // ── VENUE AND IDENTIFIER FIELDS ───────────────────────────────────

    /**
     * Publication venue — journal name, conference proceedings, or
     * workshop name. Omit for papers not yet targeted at a specific venue.
     *
     * For the H-Bar paper: "Journal of Artificial Intelligence Research"
     * For the arXiv preprint (once deposited): omit venue, use arxivId.
     *
     * Do not abbreviate unless the abbreviation is universally
     * recognised: "JAIR" is fine; "J. of AI" is not.
     */
    venue: z.string().optional(),

    /**
     * Validated arXiv ID. Same regex as the articles schema.
     * Populate this field the moment the preprint is live.
     * Used to generate the arXiv link and the Google Scholar
     * citation_arxiv_id meta tag on the individual paper page.
     */
    arxivId: arxivIdSchema,

    /**
     * Fully qualified arXiv abstract page URL.
     * Example: "https://arxiv.org/abs/2603.01234"
     * This is redundant with arxivId (the URL is derivable), but
     * storing it explicitly avoids string concatenation in templates
     * and prevents breakage if arXiv's URL structure changes.
     * If arxivId is set, set this field too.
     */
    arxivUrl: urlSchema,

    /**
     * Link to the published PDF — journal PDF, arXiv PDF, or
     * author's own hosted copy.
     * Example: "https://arxiv.org/pdf/2603.01234"
     * Add this when the preprint is live or the paper is published.
     */
    pdfUrl: urlSchema,

    /**
     * Digital Object Identifier. Add when the paper is published
     * with a DOI. Stored without the "https://doi.org/" prefix.
     * Example: "10.1613/jair.1.XXXXX"
     *
     * The page template constructs the full URL as
     * `https://doi.org/${entry.data.doi}`.
     */
    doi: z
      .string()
      .regex(/^10\.\d{4,}\/\S+$/, 'DOI must be in format 10.XXXX/identifier')
      .optional(),

    /**
     * BibTeX citation string for the paper.
     * Displayed in a <details> block on the paper page — collapsed
     * by default, expandable for copy-paste by readers.
     * For in-progress papers: write the intended BibTeX now using
     * @unpublished or @misc with note = "In preparation".
     * Update to @article or @inproceedings when published.
     *
     * This field is what makes your papers page function as an
     * academic landing page rather than a personal website.
     * Scholarship committees and collaborators will copy this.
     */
    bibtex: z.string().optional(),

    /**
     * Semantic Scholar paper ID. Optional; add if the paper is
     * indexed. Enables Semantic Scholar citation tracking.
     * Example: "204e3073870fae3d05bcbc2f6a8e263d9b72e776"
     */
    semanticScholarId: z.string().optional(),

    /**
     * Whether to feature this paper prominently on the home page
     * and papers index. Use sparingly — one paper featured at a time.
     */
    featured: z.boolean().default(false),
  }),
});


// ═══════════════════════════════════════════
// PROJECTS COLLECTION
//
// Covers: Active research projects and initiatives.
// Each project represents a distinct research direction or system.
// Projects are rendered on the projects page and can link to related papers.
//
// File format: .md (not .mdx). Project entries are data records
// rendered by the projects page template, not self-rendering documents.
// This keeps them portable and editable outside the Astro context.
// ═══════════════════════════════════════════
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({

    // ── REQUIRED CORE FIELDS ──────────────────────────────────────────

    /**
     * Full project title as it appears in the page header and links.
     * Should match the project name used throughout the site.
     */
    title: z.string().min(1),

    /**
     * Project status. This drives the StatusBadge component and
     * determines display order on the projects page.
     *
     * Status values must match the StatusBadge enum:
     *   "in-progress"  → Active development
     *   "submitted"    → Submitted for review/publication
     *   "under-review" → Under review
     *   "accepted"     → Accepted/published
     *   "published"    → Published/complete
     *
     * This ensures consistency across the site and prevents
     * hardcoded status mismatches between projects and papers.
     */
    status: z.enum([
      'in-progress',
      'submitted',
      'under-review',
      'accepted',
      'published',
    ]),

    /**
     * Short project description (1-2 sentences).
     * Displayed as the project subtitle on the projects page.
     * Should provide a concise overview of the project's purpose.
     */
    description: z.string().min(1),

    /**
     * Detailed project description in Markdown.
     * Contains the full project narrative, motivation, and scope.
     * This replaces the hardcoded HTML prose in the current projects page.
     */
    details: z.string().min(1),

    /**
     * Tags for categorization and cross-linking with articles/papers.
     * Use the same tag vocabulary as other collections for consistency.
     * Examples: "H-Bar Model", "Schema Coherence", "PIRL", etc.
     */
    tags: tagsSchema,

    // ── OPTIONAL FIELDS ──────────────────────────────────────────────

    /**
     * Project start date. Used for timeline display and sorting.
     * Format: ISO 8601 date string in frontmatter.
     */
    startDate: z.coerce.date().optional(),

    /**
     * Project end date (if completed). Used for timeline display.
     * Format: ISO 8601 date string in frontmatter.
     */
    endDate: z.coerce.date().optional(),

    /**
     * Link to related papers. Array of paper collection IDs.
     * Enables bidirectional linking between projects and their
     * associated formal publications.
     * Example: ["h-bar-model"]
     */
    relatedPapers: z.array(z.string()).optional(),

    /**
     * Whether to feature this project prominently on the projects page.
     * Use sparingly - typically for the most significant active projects.
     */
    featured: z.boolean().default(false),

    /**
     * Project URL (website, demo, or repository).
     * Optional link for external project resources.
     */
    url: urlSchema,
  }),
});


// ═══════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════
export const collections = { articles, papers, projects };
