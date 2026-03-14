/**
 * Site configuration module
 *
 * Centralized configuration for the entire site.
 * Import from here to access configuration values throughout the application.
 */

/**
 * Site metadata configuration
 */
export const site = {
  /** Site title */
  title: 'Basyirin Amsyar',

  /** Site description */
  description: 'Research notes on schema coherence, AI agent training, and physics-informed machine learning.',

  /** Base URL of the site */
  url: 'https://bamsyar.com',

  /** Default Open Graph image path */
  defaultOgImage: '/og-default.png',

  /** Author name */
  author: 'Basyirin Amsyar',
} as const;

/**
 * Giscus comment system configuration
 *
 * Configure the Giscus comment system for articles.
 * To get these values, visit https://giscus.app and follow the setup instructions.
 */
export const giscus = {
  /** Repository in the format 'owner/repo' */
  repo: 'basyirin-dev/bamsyar.com',

  /** Repository ID from giscus.app */
  repoId: 'R_kgDORjZ2Zg',

  /** Category name for comments */
  category: 'Announcements',

  /** Category ID from giscus.app */
  categoryId: 'DIC_kwDORjZ2Zs4C4GAP',

  /** Comment mapping strategy */
  mapping: 'pathname' as const,

  /** Theme for the comment widget */
  theme: 'transparent_dark' as const,

  /** Language for the comment widget */
  lang: 'en' as const,
} as const;
