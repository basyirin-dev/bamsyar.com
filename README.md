# bamsyar.com

Personal research site and blog showcasing academic work and technical writing. Built with modern web technologies for optimal performance and developer experience.

**Live site**: https://bamsyar.pages.dev

## 🚀 Features

- **Blazing Fast**: Astro 5 with partial hydration for optimal performance
- **Beautiful Typography**: Tailwind CSS v4 with @tailwindcss/typography
- **Mathematical Content**: Full LaTeX support with remark-math + rehype-katex
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
src/
├── components/          # Reusable Astro components
├── content/            # Markdown content (articles, papers, projects)
├── layouts/            # Layout components
├── pages/              # Route definitions
├── styles/             # Global styles
└── lib/                # Utility functions

public/
├── fonts/              # Font files (auto-copied)
├── figures/            # SVG illustrations
└── og-default.png      # Default Open Graph image
```

### Content Management

Content is managed through Markdown files in `src/content/`:

- **Articles**: `src/content/articles/` - Blog posts and articles
- **Papers**: `src/content/papers/` - Academic papers
- **Projects**: `src/content/projects/` - Project descriptions

### Font Management

Fonts are automatically copied from npm packages during build:

- **Inter**: System font for body text
- **IBM Plex Mono**: Monospace font for code

To manually copy fonts:
```bash
npm run copy-fonts
```

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

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contact

For questions or collaboration, please reach out through the contact information on the site.

## 🔗 Related

- [Astro Documentation](https://docs.astro.build)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
