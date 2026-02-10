import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import {
  GENERATE_IMAGE_SCHEMA,
  GENERATE_ICON_SCHEMA,
  GENERATE_HERO_SCHEMA,
  BEAUTIFY_SCREENSHOT_SCHEMA,
} from './schema.js';
import {
  generateImageInputSchema,
  generateIconInputSchema,
  generateHeroInputSchema,
  beautifyScreenshotInputSchema,
  type ImageOutput,
} from '../utils/validate.js';
import { GeminiProvider } from '../providers/geminiProvider.js';
import { ImageProvider } from '../providers/imageProvider.js';
import {
  generateFilename,
  writeBase64Image,
  downloadImage,
  getMimeType,
  parseSize,
} from '../utils/files.js';
import { safeJoinOutputs, toRelativePath, validateOutputPath } from '../utils/paths.js';
import { logger } from '../utils/log.js';

// Rate limiting
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_PER_MINUTE || '20', 10);

function checkRateLimit(toolName: string): void {
  const now = Date.now();
  const timestamps = rateLimitMap.get(toolName) || [];

  // Remove timestamps outside the window
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);

  if (validTimestamps.length >= RATE_LIMIT_MAX) {
    throw new Error(`Rate limit exceeded: max ${RATE_LIMIT_MAX} requests per minute`);
  }

  validTimestamps.push(now);
  rateLimitMap.set(toolName, validTimestamps);
}

export function createMCPServer(): Server {
  const server = new Server(
    {
      name: 'image-beautifier-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  const imageProvider: ImageProvider = new GeminiProvider();

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        GENERATE_IMAGE_SCHEMA,
        GENERATE_ICON_SCHEMA,
        GENERATE_HERO_SCHEMA,
        BEAUTIFY_SCREENSHOT_SCHEMA,
      ],
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      checkRateLimit(name);

      switch (name) {
        case 'generate_image':
          return await handleGenerateImage(args, imageProvider);
        case 'generate_icon':
          return await handleGenerateIcon(args, imageProvider);
        case 'generate_hero':
          return await handleGenerateHero(args, imageProvider);
        case 'beautify_screenshot':
          return await handleBeautifyScreenshot(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      logger.error(`Tool ${name} failed:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              ok: false,
              error: errorMessage,
            }),
          },
        ],
      };
    }
  });

  return server;
}

async function handleGenerateImage(
  args: any,
  provider: ImageProvider
): Promise<any> {
  const input = generateImageInputSchema.parse(args);

  logger.info('Generating image:', { prompt: input.prompt.slice(0, 50) + '...' });

  // Generate or validate output path
  let filename: string;
  if (input.output_path) {
    validateOutputPath(input.output_path);
    filename = input.output_path;
  } else {
    filename = generateFilename('generate_image', input.output_format);
  }

  // Generate image
  const result = await provider.generateImage({
    prompt: input.prompt,
    style: input.style,
    size: input.size,
    background: input.background,
    format: input.output_format,
  });

  // Save image
  let filePath: string;
  if (result.format === 'base64') {
    filePath = await writeBase64Image(result.data, filename);
  } else {
    filePath = await downloadImage(result.data, filename);
  }

  const output: ImageOutput = {
    ok: true,
    file_path: toRelativePath(filePath),
    mime_type: getMimeType(input.output_format),
    width: result.width,
    height: result.height,
  };

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(output, null, 2),
      },
    ],
  };
}

async function handleGenerateIcon(
  args: any,
  provider: ImageProvider
): Promise<any> {
  const input = generateIconInputSchema.parse(args);

  logger.info('Generating icon:', { concept: input.concept.slice(0, 50) + '...' });

  // Build prompt for icon generation
  const themeDescriptions = {
    minimal: 'minimalist, clean lines, simple shapes, modern',
    playful: 'fun, colorful, rounded shapes, friendly',
    corporate: 'professional, sleek, business-like, polished',
  };

  const prompt = `A ${themeDescriptions[input.theme]} icon representing: ${input.concept}. Icon design, centered, clean background.`;

  const filename = generateFilename('generate_icon', input.output_format);

  // Generate image
  const result = await provider.generateImage({
    prompt,
    style: 'flat',
    size: input.size,
    background: 'transparent',
    format: input.output_format,
  });

  // Save image
  let filePath: string;
  if (result.format === 'base64') {
    filePath = await writeBase64Image(result.data, filename);
  } else {
    filePath = await downloadImage(result.data, filename);
  }

  const { width, height } = parseSize(input.size);

  const output: ImageOutput = {
    ok: true,
    file_path: toRelativePath(filePath),
    mime_type: getMimeType(input.output_format),
    width,
    height,
  };

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(output, null, 2),
      },
    ],
  };
}

async function handleGenerateHero(
  args: any,
  provider: ImageProvider
): Promise<any> {
  const input = generateHeroInputSchema.parse(args);

  logger.info('Generating hero image:', { product: input.product_name });

  // Build prompt for hero image
  const vibeText = input.vibe ? `, ${input.vibe} vibe` : '';
  const prompt = `Hero banner image for "${input.product_name}". ${input.tagline}${vibeText}. Professional, eye-catching, suitable for website header.`;

  // Check if provider is configured
  if (!provider.isConfigured()) {
    logger.warn('Provider not configured, returning suggested prompt only');
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            ok: false,
            suggested_prompt: prompt,
            message: 'Image provider not configured. Configure GEMINI_API_KEY to generate images.',
          }, null, 2),
        },
      ],
    };
  }

  const filename = generateFilename('generate_hero', input.output_format);

  // Generate image
  const result = await provider.generateImage({
    prompt,
    style: 'photoreal',
    size: input.size,
    background: 'solid',
    format: input.output_format,
  });

  // Save image
  let filePath: string;
  if (result.format === 'base64') {
    filePath = await writeBase64Image(result.data, filename);
  } else {
    filePath = await downloadImage(result.data, filename);
  }

  const output: ImageOutput = {
    ok: true,
    file_path: toRelativePath(filePath),
    mime_type: getMimeType(input.output_format),
    width: result.width,
    height: result.height,
  };

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(output, null, 2),
      },
    ],
  };
}

async function handleBeautifyScreenshot(args: any): Promise<any> {
  const input = beautifyScreenshotInputSchema.parse(args);

  logger.info('Beautify screenshot (stub):', { path: input.input_image_path });

  // Validate input path
  try {
    validateOutputPath(input.input_image_path);
  } catch {
    throw new Error('Input image must be in outputs/ directory');
  }

  // Stub implementation - return design suggestions
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

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(output, null, 2),
      },
    ],
  };
}
