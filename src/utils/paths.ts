import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the project root (two levels up from utils/)
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

// Get the outputs directory from env or use default
const OUTPUT_DIR = process.env.OUTPUT_DIR || './outputs';
const OUTPUTS_PATH = path.resolve(PROJECT_ROOT, OUTPUT_DIR);

/**
 * Safely join a filename to the outputs directory
 * Prevents path traversal attacks
 */
export function safeJoinOutputs(filename: string): string {
  // Remove any path separators and parent directory references
  const safeName = path.basename(filename);

  // Join with outputs directory
  const fullPath = path.join(OUTPUTS_PATH, safeName);

  // Verify the resolved path is still within outputs directory
  const resolvedPath = path.resolve(fullPath);
  if (!resolvedPath.startsWith(OUTPUTS_PATH)) {
    throw new Error('Invalid output path: path traversal detected');
  }

  return resolvedPath;
}

/**
 * Validate that a path is within the outputs directory
 */
export function validateOutputPath(filePath: string): string {
  const resolvedPath = path.resolve(PROJECT_ROOT, filePath);

  if (!resolvedPath.startsWith(OUTPUTS_PATH)) {
    throw new Error('Invalid output path: must be within outputs directory');
  }

  return resolvedPath;
}

/**
 * Get the outputs directory path
 */
export function getOutputsDir(): string {
  return OUTPUTS_PATH;
}

/**
 * Convert absolute path to relative path from project root
 */
export function toRelativePath(absolutePath: string): string {
  return path.relative(PROJECT_ROOT, absolutePath);
}
