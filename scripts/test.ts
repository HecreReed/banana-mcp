/**
 * Test script for Image Beautifier MCP Server
 *
 * This script simulates MCP tool calls for testing purposes.
 * Run with: npm run test
 */

import { GeminiProvider } from '../src/providers/geminiProvider.js';
import {
  generateFilename,
  writeBase64Image,
  parseSize,
  getMimeType,
} from '../src/utils/files.js';
import { toRelativePath } from '../src/utils/paths.js';
import { logger } from '../src/utils/log.js';
import dotenv from 'dotenv';

dotenv.config();

async function testGenerateImage() {
  console.log('\n=== Testing generate_image ===\n');

  const provider = new GeminiProvider();

  if (!provider.isConfigured()) {
    console.log('⚠️  Provider not configured. Set GEMINI_API_KEY in .env file.');
    console.log('Skipping actual image generation test.\n');
    return;
  }

  try {
    const options = {
      prompt: 'A cute cartoon banana wearing sunglasses',
      style: 'illustration',
      size: '1024x1024',
      background: 'solid',
      format: 'png',
    };

    console.log('Generating image with options:', options);

    const result = await provider.generateImage(options);

    console.log('✓ Image generated successfully');
    console.log('  Format:', result.format);
    console.log('  Size:', `${result.width}x${result.height}`);

    // Save the image
    const filename = generateFilename('test_image', 'png');
    let filePath: string;

    if (result.format === 'base64') {
      filePath = await writeBase64Image(result.data, filename);
    } else {
      // For URL format, you'd download it
      console.log('  URL:', result.data);
      filePath = 'outputs/' + filename;
    }

    console.log('✓ Image saved to:', toRelativePath(filePath));

    const output = {
      ok: true,
      file_path: toRelativePath(filePath),
      mime_type: getMimeType('png'),
      width: result.width,
      height: result.height,
    };

    console.log('\nOutput:', JSON.stringify(output, null, 2));
  } catch (error) {
    console.error('✗ Test failed:', error instanceof Error ? error.message : error);
  }
}

async function testGenerateIcon() {
  console.log('\n=== Testing generate_icon ===\n');

  const provider = new GeminiProvider();

  if (!provider.isConfigured()) {
    console.log('⚠️  Provider not configured. Skipping test.\n');
    return;
  }

  try {
    const concept = 'A rocket ship launching into space';
    const theme = 'minimal';
    const size = '512x512';

    const prompt = `A ${theme} icon representing: ${concept}. Icon design, centered, clean background.`;

    console.log('Generating icon with concept:', concept);
    console.log('Theme:', theme);

    const result = await provider.generateImage({
      prompt,
      style: 'flat',
      size,
      background: 'transparent',
      format: 'png',
    });

    console.log('✓ Icon generated successfully');

    const filename = generateFilename('test_icon', 'png');
    let filePath: string;

    if (result.format === 'base64') {
      filePath = await writeBase64Image(result.data, filename);
    } else {
      console.log('  URL:', result.data);
      filePath = 'outputs/' + filename;
    }

    console.log('✓ Icon saved to:', toRelativePath(filePath));

    const { width, height } = parseSize(size);
    const output = {
      ok: true,
      file_path: toRelativePath(filePath),
      mime_type: getMimeType('png'),
      width,
      height,
    };

    console.log('\nOutput:', JSON.stringify(output, null, 2));
  } catch (error) {
    console.error('✗ Test failed:', error instanceof Error ? error.message : error);
  }
}

async function testGenerateHero() {
  console.log('\n=== Testing generate_hero ===\n');

  const provider = new GeminiProvider();

  if (!provider.isConfigured()) {
    console.log('⚠️  Provider not configured.');
    console.log('Returning suggested prompt only.\n');

    const prompt = 'Hero banner image for "BananaMCP". The sweetest MCP server for image generation, modern vibe. Professional, eye-catching, suitable for website header.';

    console.log('Suggested prompt:', prompt);
    console.log('\nOutput:', JSON.stringify({
      ok: false,
      suggested_prompt: prompt,
      message: 'Image provider not configured.',
    }, null, 2));

    return;
  }

  try {
    const productName = 'BananaMCP';
    const tagline = 'The sweetest MCP server for image generation';
    const vibe = 'modern';

    const prompt = `Hero banner image for "${productName}". ${tagline}, ${vibe} vibe. Professional, eye-catching, suitable for website header.`;

    console.log('Generating hero image for:', productName);

    const result = await provider.generateImage({
      prompt,
      style: 'photoreal',
      size: '1536x1024',
      background: 'solid',
      format: 'png',
    });

    console.log('✓ Hero image generated successfully');

    const filename = generateFilename('test_hero', 'png');
    let filePath: string;

    if (result.format === 'base64') {
      filePath = await writeBase64Image(result.data, filename);
    } else {
      console.log('  URL:', result.data);
      filePath = 'outputs/' + filename;
    }

    console.log('✓ Hero image saved to:', toRelativePath(filePath));

    const output = {
      ok: true,
      file_path: toRelativePath(filePath),
      mime_type: getMimeType('png'),
      width: result.width,
      height: result.height,
    };

    console.log('\nOutput:', JSON.stringify(output, null, 2));
  } catch (error) {
    console.error('✗ Test failed:', error instanceof Error ? error.message : error);
  }
}

async function testBeautifyScreenshot() {
  console.log('\n=== Testing beautify_screenshot (stub) ===\n');

  const input = {
    input_image_path: 'outputs/test.png',
    goal: 'Make the UI more modern and clean',
  };

  console.log('Input:', input);

  const suggestions = [
    'Increase whitespace and padding for a cleaner look',
    'Use a consistent color palette throughout the UI',
    'Improve typography hierarchy with varied font sizes',
    'Add subtle shadows or borders to define sections',
    'Ensure proper alignment of all elements',
    'Consider using rounded corners for a modern feel',
    'Optimize button sizes and spacing for better UX',
  ];

  const output = {
    ok: true,
    message: 'Beautify screenshot is currently a stub implementation',
    suggested_steps: suggestions,
    note: 'To implement image editing, integrate an image manipulation API or library',
  };

  console.log('\nOutput:', JSON.stringify(output, null, 2));
}

async function runTests() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  Image Beautifier MCP Server - Test Suite             ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  await testGenerateImage();
  await testGenerateIcon();
  await testGenerateHero();
  await testBeautifyScreenshot();

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║  Tests Complete                                        ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
}

runTests().catch((error) => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
