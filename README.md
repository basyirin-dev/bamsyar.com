# bamsyar.com

Personal research site and blog showcasing academic work and technical writing. Built with modern web technologies for optimal performance and developer experience.

**Live site**: https://bamsyar.pages.dev

## 🎓 Research Focus

This site serves as a platform for sharing research on:

- **Schema Coherence in AI Training** - The H-Bar Model framework
- **Physics-Informed Machine Learning** - PIRL (Physics-Informed Residual Learning)
- **Compositional Generalization** - Formal models of agent knowledge development
- **AI Curriculum Design** - Structured approaches to training AI systems

## 🚀 Features

- **Blazing Fast**: Astro 5 with partial hydration for optimal performance
- **Beautiful Typography**: Tailwind CSS v4 with @tailwindcss/typography
- **Mathematical Content**: Full LaTeX support with remark-math + rehype-katex
- **Interactive Research**: Embedded React components for data visualization
- **Academic Standards**: Proper citation support and BibTeX generation
- **Responsive Design**: Mobile-first approach with modern CSS
- **SEO Optimized**: Built-in sitemap generation and semantic HTML
- **Fast Deployment**: Cloudflare Pages with automatic deployments

## 🛠 Tech Stack

- **Framework**: [Astro 5](https://astro.build) - Modern static site generator
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) + @tailwindcss/typography
- **Math Rendering**: remark-math + rehype-katex (build-time compilation)
- **Typography**: Custom font stack with Inter and IBM Plex Mono
- **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com) - Auto-deploy from main branch
- **Package Manager**: npm
- **Content**: Astro Content Collections with Zod validation

## 📦 Installation

### Prerequisites

- Node.js >= 20.0.0
- npm (comes with Node.js)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/basyirin-dev/bamsyar.com.git
   cd bamsyar.com
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The site will be available at `http://localhost:4321`

## 🏗 Development

### Available Scripts

- `npm run dev` - Start development server with font copying
- `npm run build` - Build the site for production
- `npm run preview` - Preview the built site locally
- `npm run astro` - Run Astro CLI commands
- `npm run copy-fonts` - Copy font files to public directory
- `npm run generate:og-default` - Generate default Open Graph image

### Project Structure

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

### Content Management

Content is managed through Markdown files in `src/content/`:

#### Articles (`src/content/articles/`)
- Blog-style long-form articles
- Use `.mdx` format for React component embedding
- Include interactive figures and callouts
- Frontmatter fields: title, description, publishDate, tags, arxivId, etc.

#### Papers (`src/content/papers/`)
- Formal academic papers
- Use `.md` format (portable outside Astro)
- Include metadata: authors, venue, status, abstract, DOI, etc.
- BibTeX citations for academic referencing

#### Projects (`src/content/projects/`)
- Active research projects and initiatives
- Use `.md` format
- Link to related papers and external resources
- Status tracking and timeline information

### Font Management

Fonts are automatically copied from npm packages during build:

- **Inter**: System font for body text
- **IBM Plex Mono**: Monospace font for code

To manually copy fonts:
```bash
npm run copy-fonts
```

### Adding New Content

#### New Article
1. Create a new `.mdx` file in `src/content/articles/`
2. Add frontmatter with required fields:
   ```markdown
   ---
   title: "Your Article Title"
   description: "Brief description"
   publishDate: 2026-03-20
   tags: ["AI Training", "Schema Coherence"]
   ---
   ```
3. Write your content using Markdown and JSX components

#### New Paper
1. Create a new `.md` file in `src/content/papers/`
2. Add frontmatter with required fields:
   ```markdown
   ---
   title: "Paper Title"
   authors: ["Your Name"]
   year: 2026
   status: in-progress
   abstract: "Paper abstract"
   tags: ["H-Bar Model", "Formal Methods"]
   ---
   ```
3. Write the paper details in Markdown

#### New Project
1. Create a new `.md` file in `src/content/projects/`
2. Add frontmatter with required fields:
   ```markdown
   ---
   title: "Project Name"
   status: in-progress
   description: "Project description"
   details: "Detailed project narrative"
   tags: ["PIRL", "Physics-Informed Learning"]
   ---
   ```
3. Write the project details in Markdown

## 🚀 Deployment

### Cloudflare Pages

This site is configured for automatic deployment to Cloudflare Pages:

1. Connect your GitHub repository to Cloudflare Pages
2. Set build command: `npm run build`
3. Set build output directory: `dist`
4. Environment: `Production`

The site will automatically deploy on every push to the `main` branch.

### Manual Deployment

You can also deploy manually:

```bash
npm run build
# Upload the contents of the 'dist' directory to your hosting provider
```

## 📝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Content Guidelines

- Use proper academic formatting for papers
- Include relevant tags for discoverability
- Add BibTeX citations for formal papers
- Use interactive components for data visualization
- Follow the established frontmatter schema

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contact

For questions or collaboration, please reach out through the contact information on the site.

## 🔗 Related

- [Astro Documentation](https://docs.astro.build)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [H-Bar Model Research](https://bamsyar.pages.dev/articles/h-bar-model-schema-coherence-ai-training)
- [PIRL Project](https://bamsyar.pages.dev/projects)

## 📚 Research Materials

Additional research materials, data, and supplementary content can be found in:

- `research/` - Raw research data, notebooks, and supplementary materials
- `assets/` - Design assets, high-resolution figures, and presentation materials
- `docs/` - Technical documentation and project guides

## 🏆 Academic Standards

This site follows academic best practices:

- Proper citation formatting with BibTeX support
- DOI integration for published papers
- arXiv preprint linking
- Semantic HTML for accessibility
- Structured data for search engine optimization
- Open Graph and Twitter Card meta tags
