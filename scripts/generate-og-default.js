#!/usr/bin/env node

/**
 * Generate og-default.png from og-default.svg using the same Satori/Resvg pipeline
 * as the article OG image generator.
 *
 * This ensures consistency with your existing OG image generation and produces
 * a 1200×630 PNG that meets Open Graph requirements for social media platforms.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

async function generateDefaultOgImage() {
  try {
    console.log('🎨 Generating default OG image from SVG source...');

    // Read the SVG file content
    const svgPath = resolve('./public/og-default.svg');
    const svgContent = readFileSync(svgPath, 'utf-8');

    console.log('✅ Read SVG source file');

    // Create a simple wrapper that embeds the SVG content
    // Satori can render SVG content directly in the vnode
    const vnode = {
      type: 'svg',
      props: {
        width: OG_WIDTH,
        height: OG_HEIGHT,
        viewBox: '0 0 1200 630',
        dangerouslySetInnerHTML: {
          __html: svgContent.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
        }
      }
    };

    console.log('📝 Preparing SVG for rendering...');

    // Render SVG to PNG using Resvg directly (more reliable for SVG input)
    const resvg = new Resvg(svgContent, {
      fitTo: { mode: 'width', value: OG_WIDTH }
    });

    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    console.log('✅ Rendered SVG to PNG');

    // Write the PNG file
    const outputPath = resolve('./public/og-default.png');
    writeFileSync(outputPath, pngBuffer);

    console.log('✅ Generated og-default.png');
    console.log(`📁 Output: ${outputPath}`);
    console.log(`📏 Dimensions: ${OG_WIDTH}×${OG_HEIGHT}px`);
    console.log(`📊 File size: ${(pngBuffer.length / 1024).toFixed(2)} KB`);

    // Verify the file was created successfully
    const fs = await import('node:fs');
    if (fs.existsSync(outputPath)) {
      console.log('🎉 Default OG image successfully generated!');
      console.log('');
      console.log('Next steps:');
      console.log('1. Test the image by sharing your site URL on social media');
      console.log('2. Run "npm run build" to ensure it works in production');
      console.log('3. Commit the generated PNG to your repository');
    } else {
      throw new Error('Failed to create output file');
    }

  } catch (error) {
    console.error('❌ Error generating default OG image:', error.message);
    process.exit(1);
  }
}

// Run the script
generateDefaultOgImage();
