import {
  ImageProvider,
  ImageGenerationOptions,
  ImageGenerationResult,
} from './imageProvider.js';
import { logger } from '../utils/log.js';
import { parseSize } from '../utils/files.js';

interface GeminiConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

/**
 * Gemini Nano Banana Image Provider
 *
 * This implementation uses the official Gemini API format for image generation.
 * Based on Google's Gemini 2.5 Flash Image (Nano Banana) API.
 *
 * API Documentation:
 * - https://ai.google.dev/gemini-api/docs/image-generation
 * - Model: gemini-2.5-flash-image (Nano Banana)
 * - Endpoint: /v1beta/models/{model}:generateContent
 * - Auth: x-goog-api-key header
 */
export class GeminiProvider implements ImageProvider {
  private config: GeminiConfig;

  constructor() {
    this.config = {
      apiKey: process.env.GEMINI_API_KEY || '',
      baseUrl: process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com',
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash-image',
    };
  }

  getName(): string {
    return 'Gemini Nano Banana';
  }

  isConfigured(): boolean {
    return !!this.config.apiKey && !!this.config.baseUrl;
  }

  /**
   * Build the request body for Gemini Nano Banana API
   * Uses the official generateContent format
   */
  private buildRequestBody(options: ImageGenerationOptions): any {
    const { width, height } = parseSize(options.size || '1024x1024');

    // Build the prompt with style and background preferences
    let enhancedPrompt = options.prompt;

    if (options.style && options.style !== 'illustration') {
      const styleDescriptions: Record<string, string> = {
        '3d': '3D rendered style',
        'flat': 'flat design style',
        'photoreal': 'photorealistic style',
        'anime': 'anime art style',
        'pixel': 'pixel art style',
      };
      enhancedPrompt = `${styleDescriptions[options.style] || options.style}, ${enhancedPrompt}`;
    }

    if (options.background === 'transparent') {
      enhancedPrompt += ', transparent background';
    }

    // Determine aspect ratio from size
    const aspectRatio = this.getAspectRatio(width, height);

    // Official Gemini API format
    return {
      contents: [{
        parts: [
          { text: enhancedPrompt }
        ]
      }],
      generationConfig: {
        responseModalities: ['IMAGE'],
        imageConfig: {
          aspectRatio: aspectRatio,
          // Note: Gemini uses predefined sizes, not exact dimensions
          // Available: 1K, 2K, 4K
          imageSize: this.getImageSize(width, height)
        }
      }
    };
  }

  /**
   * Convert width/height to Gemini aspect ratio format
   */
  private getAspectRatio(width: number, height: number): string {
    if (width === height) return '1:1';
    if (width > height) {
      // Landscape
      const ratio = width / height;
      if (ratio >= 1.4 && ratio <= 1.6) return '3:2';
      if (ratio >= 1.7) return '16:9';
      return '4:3';
    } else {
      // Portrait
      const ratio = height / width;
      if (ratio >= 1.4 && ratio <= 1.6) return '2:3';
      if (ratio >= 1.7) return '9:16';
      return '3:4';
    }
  }

  /**
   * Convert dimensions to Gemini image size
   */
  private getImageSize(width: number, height: number): string {
    const maxDim = Math.max(width, height);
    if (maxDim <= 1024) return '1K';
    if (maxDim <= 2048) return '2K';
    return '4K';
  }

  /**
   * Parse the response from Gemini Nano Banana API
   * Official format: candidates[0].content.parts[].inline_data.data
   */
  private parseResponse(response: any, size: string): ImageGenerationResult {
    const { width, height } = parseSize(size);

    // Official Gemini response format
    if (response.candidates && Array.isArray(response.candidates)) {
      for (const candidate of response.candidates) {
        if (candidate.content?.parts) {
          for (const part of candidate.content.parts) {
            // Image data in inline_data
            if (part.inline_data?.data) {
              return {
                data: part.inline_data.data,
                format: 'base64',
                width,
                height,
              };
            }
          }
        }
      }
    }

    // Fallback: Try alternative formats for compatibility

    // Format 1: Direct base64 in 'image' field
    if (response.image && typeof response.image === 'string') {
      return {
        data: response.image,
        format: response.image.startsWith('http') ? 'url' : 'base64',
        width,
        height,
      };
    }

    // Format 2: Base64 in 'data' field
    if (response.data && typeof response.data === 'string') {
      return {
        data: response.data,
        format: response.data.startsWith('http') ? 'url' : 'base64',
        width,
        height,
      };
    }

    // Format 3: URL in 'url' field
    if (response.url && typeof response.url === 'string') {
      return {
        data: response.url,
        format: 'url',
        width,
        height,
      };
    }

    logger.error('Unable to parse Gemini response:', JSON.stringify(response, null, 2));
    throw new Error('Unable to parse image from Gemini response. Expected format: candidates[0].content.parts[].inline_data.data');
  }

  async generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
    if (!this.isConfigured()) {
      throw new Error('Gemini provider not configured. Set GEMINI_API_KEY in your .env file');
    }

    const requestBody = this.buildRequestBody(options);

    // Official Gemini API endpoint for Nano Banana
    const endpoint = `${this.config.baseUrl}/v1beta/models/${this.config.model}:generateContent`;

    logger.debug('Gemini Nano Banana API request:', { endpoint, model: this.config.model });
    logger.debug('Request body:', JSON.stringify(requestBody, null, 2));

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Official Gemini API uses x-goog-api-key header
          'x-goog-api-key': this.config.apiKey,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Gemini API error:', errorText);
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      logger.debug('Gemini API response received');

      return this.parseResponse(data, options.size || '1024x1024');
    } catch (error) {
      logger.error('Failed to generate image with Gemini:', error);
      throw new Error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
