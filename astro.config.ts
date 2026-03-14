import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { site } from './src/config';

export default defineConfig({
  /*
    The canonical site URL. Must be set for:
    - @astrojs/sitemap to generate correct URLs
    - Astro.site to work in page components (used in BaseLayout
      for canonical URLs and OG image absolute paths)
    - The arXiv launch sequence in Stage 9 (canonical URL is
      included in the Google Scholar citation_fulltext_html_url tag)

    Update this to your final custom domain before Stage 8.
    Until then, the Cloudflare Pages preview URL is correct here.
  */
  site: site.url,

  /*
    Integration order matters:
    - mdx() must come before react() — MDX integration registers the
      .mdx file handler; react() adds JSX transform support for
      components imported inside MDX files
    - sitemap() is order-independent but conventionally last
  */
  integrations: [mdx(), react(), sitemap()],

  /*
    markdown configuration applies to ALL markdown processing in Astro,
    including .mdx files processed by @astrojs/mdx. The MDX integration
    inherits this configuration unless explicitly overridden in mdx().

    remark plugins run on the Markdown AST (before HTML conversion).
    rehype plugins run on the HTML AST (after HTML conversion).
    Both arrays are evaluated in order — sequence is significant.
  */
  markdown: {

    remarkPlugins: [
      /*
        remark-math v6 (matching package.json: "remark-math": "^6.0.0")
        Parses $...$ as inline math and $$...$$ as display math.
        Produces inlineMath and math nodes in the Markdown AST.

        No options needed for the default delimiters. Do not pass
        options for single-dollar inline math — it is already the
        default in remark-math v6.

        Important: remark-math must appear in remarkPlugins, not
        rehypePlugins. It is a remark plugin. Placing it in the
        wrong array causes a silent no-op.
      */
      remarkMath,
    ],

    rehypePlugins: [
      /*
        rehype-slug adds unique IDs to all heading elements (h1-h6).
        This enables deep-linking to specific sections and is required
        for the table of contents component to generate anchor links.
      */
      rehypeSlug,

      /*
        rehype-autolink-headings adds anchor links to all headings.
        When users hover over a heading, a link icon appears that
        allows direct linking to that section. This is standard for
        academic documentation and improves user experience.
      */
      [rehypeAutolinkHeadings, {
        behavior: 'wrap',
        properties: {
          className: ['anchor-link'],
          ariaLabel: 'Link to section',
        },
      }],

      /*
        rehype-katex v7 (matching package.json: "rehype-katex": "^7.0.1")
        Consumes math AST nodes produced by remark-math and renders
        them to HTML using the KaTeX library.

        Output mode options:
          'html'           — KaTeX renders to HTML spans only.
                             Fastest render, smallest output.
                             Requires the KaTeX CSS to be loaded
                             (already in BaseLayout).
                             Screen readers see nothing for equations
                             (accessibility limitation).
          'mathml'         — KaTeX renders to MathML only.
                             Native browser rendering, no CSS required.
                             Accessibility: MathML is readable by
                             screen readers. Visual fidelity varies
                             by browser.
          'htmlAndMathml'  — KaTeX renders both HTML (for display)
                             and MathML (hidden, for accessibility).
                             Largest output; best accessibility.
                             Recommended for academic publishing.

        Choice for this site: 'htmlAndMathml'
        Reason: academic credibility. The H-Bar article will be
        referenced by ML researchers and cited in a formal paper.
        Screen reader accessibility for equations is a reasonable
        expectation for academic content. The output size increase
        is marginal for a static site.

        throwOnError: false — production default. If a KaTeX
        expression fails to parse (e.g., unsupported macro), KaTeX
        renders an error span rather than crashing the build.
        During the notation audit below, set this to true temporarily
        so failures are loud.

        trust: false — disables \htmlClass, \htmlId, \htmlStyle, and
        \htmlData. These allow arbitrary HTML injection via KaTeX
        expressions, which is a security risk in a public-facing site.
        Keep false unless you specifically need these macros.

        macros — define once here, available in every MDX file.
        Avoids repeating \newcommand in every article frontmatter.
        These are the canonical H-Bar Model symbols as used throughout
        the paper's formal specification.
      */
      [rehypeKatex, {
        output: 'htmlAndMathml',
        throwOnError: false,
        trust: false,
        macros: {
          // ── H-BAR MODEL CORE VARIABLES ─────────────────────────────
          // Parametric depth of agent A in domain d at time t
          '\\depthA':       '\\delta_A(#1, t)',
          // Schema coherence of agent A in domain d at time t
          '\\schemaA':      '\\sigma_A(#1, t)',
          // Breadth profile of agent A at time t
          '\\breadthA':     '\\Pi_A(t)',
          // Mastery domain set of agent A
          '\\masterySet':   '\\mathcal{M}_A',
          // Domain space
          '\\domainSpace':  '\\mathcal{D}',
          // Relative depth
          '\\relDepth':     '\\delta_A^{\\text{rel}}(#1, t)',
          // Mastery gap
          '\\masteryGap':   'G_A(#1, t)',
          // Learning rate
          '\\learnRate':    '\\eta_A(#1, t)',
          // Cognitive decay constant
          '\\cogDecay':     '\\lambda_c',
          // Frontier obsolescence constant
          '\\frontDecay':   '\\lambda_f',

          // ── INTERSECTION ACTIVATION ────────────────────────────────
          // Intersection activation function
          '\\intersect':    '\\Psi_A(#1, #2, t)',
          // Intersection threshold
          '\\threshold':    '\\theta_I',

          // ── DELEGATION GRADIENT ────────────────────────────────────
          // Delegation frontier (set of delegatable skills)
          '\\delFront':     '\\mathcal{D}^*(#1, t)',
          // AI parametric depth in domain d at time t
          '\\depthAI':      '\\delta_{\\text{AI}}(#1, t)',
          // Transfer coefficient
          '\\transfer':     '\\phi_A(#1, #2)',
          // AI integration fluency
          '\\fluency':      '\\Phi_A(t)',
          // AI breadth contribution
          '\\aiContrib':    '\\Gamma_{\\text{AI}}(#1, t)',

          // ── CONVENIENCE SHORTHANDS ─────────────────────────────────
          // Shorthand for "at time t" qualifier
          '\\atT':          '(t)',
          // Effective depth (parametric + AI contribution)
          '\\depthEff':     '\\delta_{\\text{eff}}',
        },
      }],
    ],

    /*
      Shiki is Astro's built-in syntax highlighter for fenced code blocks.
      It runs at build time — no client-side JavaScript.

      theme: 'github-dark' is the baseline.
      Alternatives to consider:
        'one-dark-pro'   — popular VS Code dark theme, good contrast
        'tokyo-night'    — slightly warmer, comfortable for long reads
        'dracula'        — purple-accented, clashes with violet accent palette
        'vesper'         — minimal, muted; good for academic tone

      'github-dark' is the correct choice for this site:
      - Black background (#0d1117) closely matches the site's #0f0f0f surface
      - No accent colour that conflicts with the violet (#a78bfa) system
      - Widely recognised by ML/CS readers — familiarity reduces friction

      defaultColor: false — this opt-in was introduced in Shiki 1.x /
      Astro 4+ to prevent Shiki from injecting a default color CSS variable
      that fights Tailwind's utility system. Set it to prevent unexpected
      colour inheritance into prose code blocks.

      wrap: false — Shiki's code block wrapping. false = horizontal scroll
      on overflow (the correct behaviour for code). true = word-wrap, which
      breaks indented code alignment. Never set true.
    */
    shikiConfig: {
      theme: 'github-dark',
      defaultColor: false,
      wrap: false,
    },

    /*
      remarkRehype options — passed to the remark-rehype bridge.
      footnoteLabelTagName: 'h2' is the default and correct for
      academic articles that use footnotes. No changes needed.

      allowDangerousHtml: false (default) — must not be set to true.
      Setting it true would allow raw HTML inside MDX to bypass
      rehype-sanitize, creating XSS risk. Leave at default.
    */
  },

  vite: {
    plugins: [
      /*
        The `as any` cast was added in the scaffold to silence a
        TypeScript type mismatch between the @tailwindcss/vite plugin's
        return type and Vite's Plugin type. This is a known upstream
        typing issue in @tailwindcss/vite v4 and does not affect runtime
        behaviour. Keep the cast until the upstream type is corrected.
      */
      tailwindcss() as any,
    ],
  },
});
