import { z } from 'zod';

/**
 * Tool schemas for MCP server
 */

export const GENERATE_IMAGE_SCHEMA = {
  name: 'generate_image',
  description: 'Generate an image from a text prompt with customizable style, size, and format',
  inputSchema: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        description: 'Text description of the image to generate (1-2000 characters)',
        minLength: 1,
        maxLength: 2000,
      },
      style: {
        type: 'string',
        enum: ['illustration', '3d', 'flat', 'photoreal', 'anime', 'pixel'],
        description: 'Visual style of the image',
        default: 'illustration',
      },
      size: {
        type: 'string',
        enum: ['1024x1024', '1024x1536', '1536x1024'],
        description: 'Image dimensions',
        default: '1024x1024',
      },
      background: {
        type: 'string',
        enum: ['transparent', 'solid'],
        description: 'Background type',
        default: 'solid',
      },
      output_format: {
        type: 'string',
        enum: ['png', 'webp'],
        description: 'Output file format',
        default: 'png',
      },
      output_path: {
        type: 'string',
        description: 'Optional custom filename (must be in outputs/ directory)',
      },
    },
    required: ['prompt'],
  },
};

export const GENERATE_ICON_SCHEMA = {
  name: 'generate_icon',
  description: 'Generate an icon from a concept with customizable theme and size',
  inputSchema: {
    type: 'object',
    properties: {
      concept: {
        type: 'string',
        description: 'Concept or description of the icon (1-2000 characters)',
        minLength: 1,
        maxLength: 2000,
      },
      theme: {
        type: 'string',
        enum: ['minimal', 'playful', 'corporate'],
        description: 'Icon theme/style',
        default: 'minimal',
      },
      size: {
        type: 'string',
        enum: ['256x256', '512x512'],
        description: 'Icon dimensions',
        default: '512x512',
      },
      output_format: {
        type: 'string',
        enum: ['png', 'webp'],
        description: 'Output file format',
        default: 'png',
      },
    },
    required: ['concept'],
  },
};

export const GENERATE_HERO_SCHEMA = {
  name: 'generate_hero',
  description: 'Generate a hero/banner image for a product or website',
  inputSchema: {
    type: 'object',
    properties: {
      product_name: {
        type: 'string',
        description: 'Name of the product or website',
        minLength: 1,
        maxLength: 200,
      },
      tagline: {
        type: 'string',
        description: 'Product tagline or description',
        minLength: 1,
        maxLength: 500,
      },
      vibe: {
        type: 'string',
        description: 'Optional mood/vibe (e.g., "modern", "playful", "professional")',
        maxLength: 200,
      },
      size: {
        type: 'string',
        enum: ['1024x1024', '1024x1536', '1536x1024'],
        description: 'Image dimensions',
        default: '1536x1024',
      },
      output_format: {
        type: 'string',
        enum: ['png', 'webp'],
        description: 'Output file format',
        default: 'png',
      },
    },
    required: ['product_name', 'tagline'],
  },
};

export const BEAUTIFY_SCREENSHOT_SCHEMA = {
  name: 'beautify_screenshot',
  description: 'Analyze and provide suggestions for beautifying a UI screenshot (stub implementation)',
  inputSchema: {
    type: 'object',
    properties: {
      input_image_path: {
        type: 'string',
        description: 'Path to the input screenshot (must be in outputs/ directory)',
        minLength: 1,
      },
      goal: {
        type: 'string',
        description: 'Beautification goal (e.g., "more modern UI", "cleaner design")',
        minLength: 1,
        maxLength: 1000,
      },
      output_format: {
        type: 'string',
        enum: ['png', 'webp'],
        description: 'Output file format',
        default: 'png',
      },
    },
    required: ['input_image_path', 'goal'],
  },
};
