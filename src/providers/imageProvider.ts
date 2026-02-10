export interface ImageGenerationOptions {
  prompt: string;
  style?: string;
  size?: string;
  background?: string;
  format?: string;
}

export interface ImageGenerationResult {
  data: string; // base64 or URL
  format: 'base64' | 'url';
  width: number;
  height: number;
}

export interface ImageProvider {
  /**
   * Generate an image from a text prompt
   */
  generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult>;

  /**
   * Check if the provider is properly configured
   */
  isConfigured(): boolean;

  /**
   * Get provider name
   */
  getName(): string;
}
