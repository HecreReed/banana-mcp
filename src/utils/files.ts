import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { safeJoinOutputs, getOutputsDir } from './paths.js';
import { logger } from './log.js';

/**
 * Generate a unique filename with timestamp and hash
 */
export function generateFilename(
  toolName: string,
  extension: string
): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const hash = crypto.randomBytes(4).toString('hex');
  return `${toolName}_${timestamp}_${hash}.${extension}`;
}

/**
 * Ensure the outputs directory exists
 */
export async function ensureOutputsDir(): Promise<void> {
  const outputsDir = getOutputsDir();
  try {
    await fs.access(outputsDir);
  } catch {
    await fs.mkdir(outputsDir, { recursive: true });
    logger.info('Created outputs directory:', outputsDir);
  }
}

/**
 * Write base64 image data to file
 */
export async function writeBase64Image(
  base64Data: string,
  filename: string
): Promise<string> {
  await ensureOutputsDir();

  // Remove data URL prefix if present
  const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, '');

  const buffer = Buffer.from(base64Clean, 'base64');
  const filePath = safeJoinOutputs(filename);

  await fs.writeFile(filePath, buffer);
  logger.info('Wrote image to:', filePath);

  return filePath;
}

/**
 * Write buffer to file
 */
export async function writeImageBuffer(
  buffer: Buffer,
  filename: string
): Promise<string> {
  await ensureOutputsDir();

  const filePath = safeJoinOutputs(filename);
  await fs.writeFile(filePath, buffer);
  logger.info('Wrote image to:', filePath);

  return filePath;
}

/**
 * Download image from URL and save to file
 */
export async function downloadImage(
  url: string,
  filename: string
): Promise<string> {
  await ensureOutputsDir();

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  return writeImageBuffer(buffer, filename);
}

/**
 * Get MIME type from file extension
 */
export function getMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    png: 'image/png',
    webp: 'image/webp',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
  };

  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}

/**
 * Parse size string to width and height
 */
export function parseSize(size: string): { width: number; height: number } {
  const [width, height] = size.split('x').map(Number);
  return { width, height };
}
