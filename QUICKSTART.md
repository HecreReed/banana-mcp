# Quick Start Guide

## Installation & Setup

```bash
# 1. Clone the repository
git clone https://github.com/HecreReed/banana-mcp.git
cd banana-mcp

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# 4. Build the project
npm run build

# 5. Test the server
npm run test
```

## Quick Test Commands

### Test without API key (shows stub behavior)
```bash
npm run test
```

### Test with API key (generates actual images)
```bash
# Make sure GEMINI_API_KEY is set in .env
npm run test
```

### Run the MCP server
```bash
npm start
```

## Using with Claude Desktop

1. Build the project: `npm run build`

2. Add to Claude Desktop config:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

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

3. Restart Claude Desktop

4. Test by asking Claude:
   - "Generate an image of a cute banana wearing sunglasses"
   - "Create a minimal icon for a rocket ship"
   - "Generate a hero image for my product called 'BananaMCP'"

## Example Tool Calls

### Generate Image
```json
{
  "tool": "generate_image",
  "arguments": {
    "prompt": "A cute cartoon banana wearing sunglasses",
    "style": "illustration",
    "size": "1024x1024",
    "output_format": "png"
  }
}
```

### Generate Icon
```json
{
  "tool": "generate_icon",
  "arguments": {
    "concept": "A rocket ship launching into space",
    "theme": "minimal",
    "size": "512x512"
  }
}
```

### Generate Hero
```json
{
  "tool": "generate_hero",
  "arguments": {
    "product_name": "BananaMCP",
    "tagline": "The sweetest MCP server for image generation",
    "vibe": "modern"
  }
}
```

## Troubleshooting

### Build fails
```bash
# Clean and rebuild
npm run clean
npm run build
```

### "Provider not configured" error
- Make sure `GEMINI_API_KEY` is set in `.env`
- Or pass it via environment variable: `GEMINI_API_KEY=xxx npm start`

### Check logs
```bash
# Enable debug logging
LOG_LEVEL=debug npm start
```

## Output Files

All generated images are saved to `outputs/` directory:
```bash
ls -lh outputs/
```

Clean up generated files:
```bash
rm outputs/*.png outputs/*.webp
```

## Development

### Watch mode (rebuild on changes)
```bash
# Terminal 1: Watch TypeScript
npx tsc --watch

# Terminal 2: Run server
npm start
```

### Run specific test
```bash
# Build first
npm run build

# Then run test
node dist/scripts/test.js
```

## Next Steps

1. **Customize Gemini Provider**: See README.md "Customizing the Gemini Provider" section
2. **Add New Provider**: Implement `ImageProvider` interface for OpenAI, Replicate, etc.
3. **Extend Tools**: Add more image manipulation capabilities
4. **Deploy**: Run on a server for team-wide access

## Resources

- Full documentation: [README.md](README.md)
- GitHub repository: https://github.com/HecreReed/banana-mcp
- MCP documentation: https://modelcontextprotocol.io
