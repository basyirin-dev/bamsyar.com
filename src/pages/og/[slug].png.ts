/// <reference types="astro/client" />

import type { APIRoute, GetStaticPaths } from 'astro';
import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// ── Font loading ───────────────────────────────────────────────────────
const INTER_REGULAR = readFileSync(
  resolve('./node_modules/@fontsource/inter/files/inter-latin-400-normal.woff')
);
const INTER_BOLD = readFileSync(
  resolve('./node_modules/@fontsource/inter/files/inter-latin-700-normal.woff')
);

const OG_WIDTH  = 1200;
const OG_HEIGHT = 630;

// ── Static paths ───────────────────────────────────────────────────────
export const getStaticPaths: GetStaticPaths = async () => {
  const articles = await getCollection('articles');
  return articles.map((entry: CollectionEntry<'articles'>) => ({
    params: { slug: entry.id },
    props:  { entry },
  }));
};

// ── Image generation ───────────────────────────────────────────────────
// FIX 2: explicit type annotation on props destructuring
export const GET: APIRoute = async ({ props }) => {
  const { entry } = props as { entry: CollectionEntry<'articles'> };
  const { title, description, publishDate, tags } = entry.data;

  const pubDateStr = publishDate
    ? publishDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  const displayTitle = title.length > 72 ? title.slice(0, 69) + '…' : title;
  const displayDesc  = description
    ? description.length > 120 ? description.slice(0, 117) + '…' : description
    : '';

  // FIX 3: cast vnode as `any` — Satori accepts plain objects at runtime
  // but its TS types demand ReactNode. The cast is correct and safe.
  const vnode = {
    type: 'div',
    props: {
      style: {
        width:         OG_WIDTH,
        height:        OG_HEIGHT,
        background:    '#0f0f0f',
        display:       'flex',
        flexDirection: 'column',
        fontFamily:    'Inter',
        padding:       '72px 80px',
        boxSizing:     'border-box',
        position:      'relative',
      },
      children: [
        // Site domain — top right
        {
          type: 'div',
          props: {
            style: { position: 'absolute', top: 40, right: 80, fontSize: 18, color: '#404040' },
            children: 'bamsyar.pages.dev',
          },
        },
        // Violet accent bar — left edge
        {
          type: 'div',
          props: {
            style: {
              width: 6, height: OG_HEIGHT * 0.55, background: '#a78bfa',
              borderRadius: 3, position: 'absolute', left: 0, top: '22.5%',
            },
          },
        },
        // Tag pills
        {
          type: 'div',
          props: {
            style: { display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' },
            children: (tags ?? []).slice(0, 3).map((tag: string) => ({
              type: 'div',
              props: {
                style: {
                  fontSize: 14, color: '#a78bfa',
                  border: '1px solid #a78bfa44', borderRadius: 9999,
                  padding: '3px 12px', letterSpacing: '0.05em',
                },
                children: tag,
              },
            })),
          },
        },
        // Title
        {
          type: 'div',
          props: {
            style: { fontSize: 52, fontWeight: 700, color: '#f5f5f5', lineHeight: 1.15, marginBottom: 24, maxWidth: 960 },
            children: displayTitle,
          },
        },
        // Description
        {
          type: 'div',
          props: {
            style: { fontSize: 24, color: '#a3a3a3', lineHeight: 1.55, marginBottom: 'auto', maxWidth: 880 },
            children: displayDesc,
          },
        },
        // Author + date row
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center', gap: 24, marginTop: 48 },
            children: [
              {
                type: 'div',
                props: {
                  style: { width: 40, height: 40, borderRadius: 9999, background: '#262626', border: '2px solid #a78bfa', flexShrink: 0 },
                },
              },
              {
                type: 'div',
                props: {
                  style: { fontSize: 20, color: '#737373' },
                  children: `Basyirin Amsyar  ·  ${pubDateStr}`,
                },
              },
            ],
          },
        },
      ],
    },
  };

  const svg = await satori(vnode as any, { // FIX 3
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: [
      { name: 'Inter', data: INTER_REGULAR, weight: 400, style: 'normal' },
      { name: 'Inter', data: INTER_BOLD,    weight: 700, style: 'normal' },
    ],
  });

  const resvg     = new Resvg(svg, { fitTo: { mode: 'width', value: OG_WIDTH } });
  const pngData   = resvg.render();
  const pngBuffer = pngData.asPng();

  // FIX 4: Uint8Array instead of Buffer — correct BodyInit for Web API runtime
  return new Response(new Uint8Array(pngBuffer), {
    headers: {
      'Content-Type':  'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
