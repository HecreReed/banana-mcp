import { z } from 'zod';

// Common validation schemas
export const promptSchema = z.string().min(1).max(2000);

export const styleSchema = z.enum([
  'illustration',
  '3d',
  'flat',
  'photoreal',
  'anime',
  'pixel',
]);

export const sizeSchema = z.enum(['1024x1024', '1024x1536', '1536x1024']);

export const iconSizeSchema = z.enum(['256x256', '512x512']);

export const backgroundSchema = z.enum(['transparent', 'solid']);

export const outputFormatSchema = z.enum(['png', 'webp']);

export const themeSchema = z.enum(['minimal', 'playful', 'corporate']);

// Tool input schemas
export const generateImageInputSchema = z.object({
  prompt: promptSchema,
  style: styleSchema.default('illustration'),
  size: sizeSchema.default('1024x1024'),
  background: backgroundSchema.default('solid'),
  output_format: outputFormatSchema.default('png'),
  output_path: z.string().optional(),
});

export const generateIconInputSchema = z.object({
  concept: promptSchema,
  theme: themeSchema.default('minimal'),
  size: iconSizeSchema.default('512x512'),
  output_format: outputFormatSchema.default('png'),
});

export const generateHeroInputSchema = z.object({
  product_name: z.string().min(1).max(200),
  tagline: z.string().min(1).max(500),
  vibe: z.string().max(200).optional(),
  size: sizeSchema.default('1536x1024'),
  output_format: outputFormatSchema.default('png'),
});

export const beautifyScreenshotInputSchema = z.object({
  input_image_path: z.string().min(1),
  goal: z.string().min(1).max(1000),
  output_format: outputFormatSchema.default('png'),
});

// Tool output schema
export const imageOutputSchema = z.object({
  ok: z.boolean(),
  file_path: z.string(),
  mime_type: z.string(),
  width: z.number(),
  height: z.number(),
  message: z.string().optional(),
});

export type GenerateImageInput = z.infer<typeof generateImageInputSchema>;
export type GenerateIconInput = z.infer<typeof generateIconInputSchema>;
export type GenerateHeroInput = z.infer<typeof generateHeroInputSchema>;
export type BeautifyScreenshotInput = z.infer<typeof beautifyScreenshotInputSchema>;
export type ImageOutput = z.infer<typeof imageOutputSchema>;
