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
 * Gemini Image Provider
 *
 * NOTE: This implementation uses a generic adapter pattern for Gemini's image generation API.
 * The actual API endpoint and response format may vary depending on your Gemini setup.
 *
 * To customize for your specific Gemini API:
 * 1. Update buildRequestBody() to match your API's request format
 * 2. Update parseResponse() to match your API's response format
 * 3. Update the endpoint URL in generateImage() if needed
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
    return 'Gemini';
  }

  isConfigured(): boolean {
    return !!this.config.apiKey && !!this.config.baseUrl;
  }

  /**
   * Build the request body for Gemini API
   * CUSTOMIZE THIS: Adjust to match your actual Gemini image API format
   */
  private buildRequestBody(options: ImageGenerationOptions): any {
    const { width, height } = parseSize(options.size || '1024x1024');

    // Example format - adjust based on your actual API
    return {
      model: this.config.model,
      prompt: options.prompt,
      parameters: {
        width,
        height,
        style: options.style || 'illustration',
        background: options.background || 'solid',
        format: options.format || 'png',
      },
    };
  }

  /**
   * Parse the response from Gemini API
   * CUSTOMIZE THIS: Adjust to match your actual Gemini image API response format
   */
  private parseResponse(response: any, size: string): ImageGenerationResult {
    const { width, height } = parseSize(size);

    // Try multiple possible response formats

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

    // Format 4: Nested in 'result' or 'output'
    if (response.result?.image || response.output?.image) {
      const imageData = response.result?.image || response.output?.image;
      return {
        data: imageData,
        format: imageData.startsWith('http') ? 'url' : 'base64',
        width,
        height,
      };
    }

    // Format 5: Array of images (take first)
    if (Array.isArray(response.images) && response.images.length > 0) {
      const imageData = response.images[0];
      return {
        data: typeof imageData === 'string' ? imageData : imageData.url || imageData.data,
        format: typeof imageData === 'string' && imageData.startsWith('http') ? 'url' : 'base64',
        width,
        height,
      };
    }

    throw new Error('Unable to parse image from Gemini response. Check geminiProvider.ts parseResponse()');
  }

  async generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
    if (!this.isConfigured()) {
      throw new Error('Gemini provider not configured. Set GEMINI_API_KEY and GEMINI_BASE_URL');
    }

    const requestBody = this.buildRequestBody(options);

    // Construct the API endpoint
    // CUSTOMIZE THIS: Adjust the endpoint path based on your actual Gemini API
    const endpoint = `${this.config.baseUrl}/v1/models/${this.config.model}:generateImage`;

    logger.debug('Gemini API request:', { endpoint, body: requestBody });

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          // Alternative auth header format (uncomment if needed):
          // 'x-goog-api-key': this.config.apiKey,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Gemini API error:', errorText);
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      logger.debug('Gemini API response:', data);

      return this.parseResponse(data, options.size || '1024x1024');
    } catch (error) {
      logger.error('Failed to generate image with Gemini:', error);
      throw new Error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
