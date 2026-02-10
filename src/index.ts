#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMCPServer } from './mcp/server.js';
import { logger } from './utils/log.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  logger.info('Starting Image Beautifier MCP Server...');

  const server = createMCPServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);

  logger.info('MCP Server running on stdio');

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    logger.info('Shutting down...');
    await server.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('Shutting down...');
    await server.close();
    process.exit(0);
  });
}

main().catch((error) => {
  logger.error('Fatal error:', error);
  process.exit(1);
});
