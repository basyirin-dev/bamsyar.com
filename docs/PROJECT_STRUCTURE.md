# Project Structure

This document describes the structure and organization of the bamsyar.com research site.

## Directory Structure

```
bamsyar.com/
├── src/                    # Source code
│   ├── components/         # React/Astro components
│   ├── content/           # Research content
│   │   ├── articles/      # Blog-style articles (.mdx)
│   │   ├── papers/        # Academic papers (.md)
│   │   └── projects/      # Research projects (.md)
│   ├── layouts/           # Page layouts
│   ├── lib/               # Utilities and helpers
│   ├── pages/             # Route definitions
│   ├── styles/            # CSS and styling
│   ├── types/             # TypeScript type definitions
│   └── config/            # Configuration files
├── scripts/               # Build and utility scripts
├── public/                # Static assets
│   ├── fonts/             # Font files
│   ├── figures/           # SVG illustrations
│   └── og/                # Open Graph images
├── docs/                  # Documentation
├── research/              # Raw research materials
└── assets/                # Design assets
```

## Content Organization

### Articles (`src/content/articles/`)
- Blog-style long-form articles
- Use `.mdx` format for React component embedding
- Include interactive figures and callouts
- Frontmatter fields: title, description, publishDate, tags, arxivId, etc.

### Papers (`src/content/papers/`)
- Formal academic papers
- Use `.md` format (portable outside Astro)
- Include metadata: authors, venue, status, abstract, DOI, etc.
- BibTeX citations for academic referencing

### Projects (`src/content/projects/`)
- Active research projects and initiatives
- Use `.md` format
- Link to related papers and external resources
- Status tracking and timeline information

## Development Workflow

1. **Content Creation**: Add new articles, papers, or projects to respective directories
2. **Component Development**: Create reusable components in `src/components/`
3. **Styling**: Use Tailwind CSS with custom design tokens
4. **Build**: Run `npm run build` for production
5. **Deployment**: Automatic deployment via Cloudflare Pages

## Research Materials

- `research/`: Raw research data, notebooks, and supplementary materials
- `assets/`: Design assets, high-resolution figures, and presentation materials
- `docs/`: Technical documentation and project guides

## Configuration

- `src/config/site.ts`: Site metadata and configuration
- `src/content.config.ts`: Content collection schemas and validation
- `astro.config.ts`: Astro framework configuration
- `tailwind.config.js`: Tailwind CSS configuration
