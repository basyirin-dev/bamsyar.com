# Build Scripts

This directory contains build scripts for the bamsyar.com website.

## generate-og-default.js

Generates the default Open Graph image (`public/og-default.png`) from the SVG source (`public/og-default.svg`).

### Why this script exists

Open Graph protocol requires raster images (PNG/JPEG) for social media unfurls. While `og-default.svg` serves as the editable source of truth, social platforms like Facebook, Twitter/X, LinkedIn, and Slack require a PNG for proper rendering.

### Usage

```bash
# Generate the default OG image
npm run generate:og-default

# Or run directly
node scripts/generate-og-default.js
```

### What it does

1. Reads `public/og-default.svg` (1200×630)
2. Renders it to PNG using the same Resvg pipeline as article OG images
3. Saves as `public/og-default.png` (1200×630)
4. Ensures consistency with your existing OG image generation

### When to run

- After updating the SVG design
- As part of your deployment pipeline
- When the PNG file is missing or corrupted

### Integration

The script is integrated into the main build process and referenced in `package.json` as `npm run generate:og-default`.
