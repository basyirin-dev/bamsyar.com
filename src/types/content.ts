/**
 * TypeScript type definitions for content collections
 */

export interface Article {
  id: string;
  slug: string;
  body: string;
  collection: 'articles';
  data: {
    title: string;
    description: string;
    publishDate: Date;
    updatedDate?: Date;
    tags: string[];
    arxivId?: string;
    draft?: boolean;
    ogImage?: string;
    featured?: boolean;
    readingTime?: number;
  };
}

export interface Paper {
  id: string;
  slug: string;
  body: string;
  collection: 'papers';
  data: {
    title: string;
    authors: string[];
    year: number;
    status: 'in-progress' | 'submitted' | 'under-review' | 'accepted' | 'published';
    abstract: string;
    tags: string[];
    venue?: string;
    arxivId?: string;
    arxivUrl?: string;
    pdfUrl?: string;
    doi?: string;
    bibtex?: string;
    semanticScholarId?: string;
    featured?: boolean;
  };
}

export interface Project {
  id: string;
  slug: string;
  body: string;
  collection: 'projects';
  data: {
    title: string;
    status: 'in-progress' | 'submitted' | 'under-review' | 'accepted' | 'published';
    description: string;
    details: string;
    tags: string[];
    startDate?: Date;
    endDate?: Date;
    relatedPapers?: string[];
    featured?: boolean;
    url?: string;
  };
}

export type CollectionEntry = Article | Paper | Project;
