# Image Beautifier MCP Server

A Model Context Protocol (MCP) server that provides AI-powered image generation and UI beautification tools for agents and applications. Built with Node.js and TypeScript, this server enables Claude and other MCP-compatible clients to generate images, icons, hero banners, and beautify UI screenshots.

**Powered by Google's Gemini Nano Banana** - Uses the official Gemini 2.5 Flash Image API (codename "Nano Banana") for fast, high-quality image generation.

## Features

- **generate_image**: Generate custom images from text prompts with style, size, and format options
- **generate_icon**: Create icons with different themes (minimal, playful, corporate)
- **generate_hero**: Generate hero/banner images for products and websites
- **beautify_screenshot**: Analyze and provide suggestions for UI improvements (stub implementation)

## Architecture

- **Provider-based design**: Easily swap between different image generation backends (Gemini, OpenAI, Replicate, local Stable Diffusion)
- **Security-first**: Path validation, rate limiting, and safe file operations
- **Stdio transport**: Compatible with Claude Desktop, Claude Code, and other MCP hosts
- **Type-safe**: Full TypeScript implementation with Zod validation

## Installation

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- A Gemini API key (or configure a different provider)

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd banana-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your API credentials:
```env
GEMINI_API_KEY=your_api_key_here
GEMINI_BASE_URL=https://generativelanguage.googleapis.com
GEMINI_MODEL=gemini-2.5-flash-image
LOG_LEVEL=info
RATE_LIMIT_PER_MINUTE=20
```

4. Build the project:
```bash
npm run build
```

5. Run the server:
```bash
npm start
```

## Getting Your Gemini API Key

This server uses Google's **Gemini 2.5 Flash Image** (codename "Nano Banana") for image generation.

1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy your API key
5. Add it to your `.env` file as `GEMINI_API_KEY`

**Available Models:**
- `gemini-2.5-flash-image` - Nano Banana (fast, optimized for speed)
- `gemini-3-pro-image-preview` - Nano Banana Pro (professional quality, enterprise)

**API Documentation:**
- [Official Gemini Image Generation Docs](https://ai.google.dev/gemini-api/docs/image-generation)
- [Nano Banana Guide](https://www.cometapi.com/how-to-use-nano-banana-via-api/)

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Your Gemini API key | (required) |
| `GEMINI_BASE_URL` | Gemini API base URL | `https://generativelanguage.googleapis.com` |
| `GEMINI_MODEL` | Model name for image generation | `gemini-2.5-flash-image` |
| `LOG_LEVEL` | Logging level (debug, info, warn, error) | `info` |
| `RATE_LIMIT_PER_MINUTE` | Max requests per minute per tool | `20` |
| `OUTPUT_DIR` | Directory for generated images | `./outputs` |

### MCP Host Configuration

#### Claude Desktop

Add to your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "image-beautifier": {
      "command": "node",
      "args": ["/absolute/path/to/banana-mcp/dist/index.js"],
      "env": {
        "GEMINI_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

#### Claude Code

Add to your MCP settings:

```json
{
  "mcpServers": {
    "image-beautifier": {
      "command": "node",
      "args": ["/absolute/path/to/banana-mcp/dist/index.js"]
    }
  }
}
```

Make sure your `.env` file is properly configured in the project directory.

## Tools Reference

### generate_image

Generate an image from a text prompt with customizable options.

**Input:**
```json
{
  "prompt": "A cute cartoon banana wearing sunglasses",
  "style": "illustration",
  "size": "1024x1024",
  "background": "solid",
  "output_format": "png",
  "output_path": "my_image.png"
}
```

**Parameters:**
- `prompt` (required): Text description (1-2000 characters)
- `style`: `illustration` | `3d` | `flat` | `photoreal` | `anime` | `pixel` (default: `illustration`)
- `size`: `1024x1024` | `1024x1536` | `1536x1024` (default: `1024x1024`)
- `background`: `transparent` | `solid` (default: `solid`)
- `output_format`: `png` | `webp` (default: `png`)
- `output_path` (optional): Custom filename (must be in outputs/ directory)

**Output:**
```json
{
  "ok": true,
  "file_path": "outputs/generate_image_2026-02-10T12-30-45_a1b2c3d4.png",
  "mime_type": "image/png",
  "width": 1024,
  "height": 1024
}
```

### generate_icon

Generate an icon from a concept with customizable theme.

**Input:**
```json
{
  "concept": "A rocket ship launching into space",
  "theme": "minimal",
  "size": "512x512",
  "output_format": "png"
}
```

**Parameters:**
- `concept` (required): Icon concept description (1-2000 characters)
- `theme`: `minimal` | `playful` | `corporate` (default: `minimal`)
- `size`: `256x256` | `512x512` (default: `512x512`)
- `output_format`: `png` | `webp` (default: `png`)

**Output:**
```json
{
  "ok": true,
  "file_path": "outputs/generate_icon_2026-02-10T12-31-20_e5f6g7h8.png",
  "mime_type": "image/png",
  "width": 512,
  "height": 512
}
```

### generate_hero

Generate a hero/banner image for a product or website.

**Input:**
```json
{
  "product_name": "BananaMCP",
  "tagline": "The sweetest MCP server for image generation",
  "vibe": "modern",
  "size": "1536x1024",
  "output_format": "png"
}
```

**Parameters:**
- `product_name` (required): Product or website name (1-200 characters)
- `tagline` (required): Product tagline (1-500 characters)
- `vibe` (optional): Mood/vibe description (max 200 characters)
- `size`: `1024x1024` | `1024x1536` | `1536x1024` (default: `1536x1024`)
- `output_format`: `png` | `webp` (default: `png`)

**Output:**
```json
{
  "ok": true,
  "file_path": "outputs/generate_hero_2026-02-10T12-32-15_i9j0k1l2.png",
  "mime_type": "image/png",
  "width": 1536,
  "height": 1024
}
```

If provider is not configured:
```json
{
  "ok": false,
  "suggested_prompt": "Hero banner image for \"BananaMCP\"...",
  "message": "Image provider not configured. Configure GEMINI_API_KEY to generate images."
}
```

### beautify_screenshot

Analyze a screenshot and provide UI improvement suggestions (stub implementation).

**Input:**
```json
{
  "input_image_path": "outputs/screenshot.png",
  "goal": "Make the UI more modern and clean",
  "output_format": "png"
}
```

**Parameters:**
- `input_image_path` (required): Path to screenshot (must be in outputs/ directory)
- `goal` (required): Beautification goal (1-1000 characters)
- `output_format`: `png` | `webp` (default: `png`)

**Output:**
```json
{
  "ok": true,
  "message": "Beautify screenshot is currently a stub implementation",
  "suggested_steps": [
    "Increase whitespace and padding for a cleaner look",
    "Use a consistent color palette throughout the UI",
    "Improve typography hierarchy with varied font sizes",
    "..."
  ],
  "note": "To implement image editing, integrate an image manipulation API or library"
}
```

## Testing

Run the test suite to verify the server is working:

```bash
npm run test
```

This will test all four tools and show example outputs. If `GEMINI_API_KEY` is not configured, tests will show what would happen with a configured provider.

## Output Files

All generated images are saved to the `outputs/` directory with automatically generated filenames:

```
outputs/
  generate_image_2026-02-10T12-30-45_a1b2c3d4.png
  generate_icon_2026-02-10T12-31-20_e5f6g7h8.png
  generate_hero_2026-02-10T12-32-15_i9j0k1l2.png
```

To clean up generated files:
```bash
rm outputs/*.png outputs/*.webp
```

## About the Gemini Nano Banana Provider

This server uses the **official Gemini API format** for image generation. The implementation is based on Google's documented API structure:

**API Details:**
- **Endpoint**: `/v1beta/models/{model}:generateContent`
- **Authentication**: `x-goog-api-key` header
- **Request Format**: Official `contents` + `generationConfig` structure
- **Response Format**: `candidates[0].content.parts[].inline_data.data`

**Key Features:**
- Automatic aspect ratio detection (1:1, 16:9, 3:2, etc.)
- Image size optimization (1K, 2K, 4K)
- Style enhancement via prompt engineering
- Base64 image data in responses

**No customization needed** - the provider works out-of-the-box with the official Gemini API. Just add your API key!

### Advanced: Switching Models

To use **Nano Banana Pro** (higher quality):

```env
GEMINI_MODEL=gemini-3-pro-image-preview
```

### Troubleshooting API Issues

If you encounter API errors:

1. **Enable debug logging**:
   ```env
   LOG_LEVEL=debug
   ```

2. **Check your API key**: Visit [Google AI Studio](https://aistudio.google.com/apikey)

3. **Verify model availability**: Some models may require enterprise access

4. **Review API quotas**: Check your usage limits in Google AI Studio

## Adding New Providers

To add support for OpenAI, Replicate, or other image generation services:

1. Create a new provider file in `src/providers/`:
```typescript
// src/providers/openaiProvider.ts
import { ImageProvider, ImageGenerationOptions, ImageGenerationResult } from './imageProvider.js';

export class OpenAIProvider implements ImageProvider {
  // Implement the interface methods
}
```

2. Update `src/mcp/server.ts` to use your provider:
```typescript
const imageProvider: ImageProvider = new OpenAIProvider();
```

3. Add necessary environment variables to `.env.example`

## Security Features

- **Path validation**: All file operations are restricted to the `outputs/` directory
- **Rate limiting**: Configurable per-minute request limits (default: 20)
- **Input validation**: Prompt length limits (max 2000 characters)
- **Error sanitization**: API keys and sensitive data are never exposed in error messages
- **Safe filename generation**: Automatic filename generation prevents path traversal attacks

## Troubleshooting

### "Provider not configured" error

Make sure `GEMINI_API_KEY` is set in your `.env` file or passed via environment variables in your MCP host configuration.

### "Rate limit exceeded" error

Reduce the frequency of requests or increase `RATE_LIMIT_PER_MINUTE` in your `.env` file.

### "Invalid output path" error

Ensure `output_path` (if provided) is a simple filename without directory separators. The file will automatically be saved to the `outputs/` directory.

### Images not generating

1. Check your API key is valid
2. Verify the `GEMINI_BASE_URL` and `GEMINI_MODEL` match your API setup
3. Enable debug logging: `LOG_LEVEL=debug` in `.env`
4. Check the logs for API error messages

### TypeScript compilation errors

Make sure you're using Node.js 18+ and have installed all dependencies:
```bash
node --version  # Should be >= 18.0.0
npm install
npm run build
```

## Development

### Project Structure

```
banana-mcp/
├── src/
│   ├── index.ts              # Server entry point
│   ├── mcp/
│   │   ├── server.ts         # MCP server and tool handlers
│   │   └── schema.ts         # Tool schemas
│   ├── providers/
│   │   ├── imageProvider.ts  # Provider interface
│   │   └── geminiProvider.ts # Gemini implementation
│   └── utils/
│       ├── files.ts          # File operations
│       ├── paths.ts          # Path validation
│       ├── validate.ts       # Input validation
│       └── log.ts            # Logging
├── scripts/
│   └── test.ts               # Test suite
├── outputs/                  # Generated images
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

### Building

```bash
npm run build
```

### Running in Development

```bash
npm run dev
```

### Cleaning Build Artifacts

```bash
npm run clean
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## Support

For issues and questions, please open an issue on the GitHub repository.
