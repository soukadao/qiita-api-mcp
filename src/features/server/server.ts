import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import debug from 'debug';
import { fetchItems } from '../get-items-tool/index.js';

const log = debug('mcp:qiita');

export async function fetchItemsToolWrapper(args: { page?: number; per_page?: number; query?: string; additional_fields?: string[] }) {
  const result = await fetchItems(args);

  return result.match(
    (success: any) => ({
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(success, null, 2),
        }
      ]
    }),
    (error: any) => {
      log('Fetch items error: %O', error);
      return {
        content: [
          {
            type: "text" as const,
            text: `Error: ${error.message}`,
          }
        ],
        isError: true
      };
    }
  );
}

export function createStdioServer(): McpServer {
  log('Creating MCP Server instance');

  const server = new McpServer({
    name: "qiita-api-mcp",
    version: "1.0.0",
    capabilities: {
      resources: {},
      tools: {},
    },
  });

  // Register the "get_items" tool
  server.tool(
    "get_items",
    "Fetch Qiita items with optional pagination and search. By default returns: title, url, created_at, user.name. Use additional_fields to include more fields.",
    {
      page: z.number().int().min(1).max(100).optional(),
      per_page: z.number().int().min(1).max(100).optional(),
      query: z.string().optional(),
      additional_fields: z.array(z.string()).optional().describe("Additional fields to include in response (e.g., ['id', 'tags', 'user.id'])"),
    },
    fetchItemsToolWrapper
  );

  log('MCP Server created with get_items tool');
  return server;
};