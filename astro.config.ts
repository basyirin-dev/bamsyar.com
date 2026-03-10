import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://bamsyar.pages.dev',
  integrations: [mdx(), react(), sitemap()],
  vite: {
    plugins: [tailwindcss() as any],  // ← cast silences the type mismatch
  },
  markdown: {
    remarkPlugins: ['remark-math'],
    rehypePlugins: [['rehype-katex', { output: 'html' }]],
  },
});
