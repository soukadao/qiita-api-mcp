import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import debug from 'debug';
import { fetchItems } from '../get-items-tool/index.js';
import { VERSION } from '../../shared/config.js';

const log = debug('mcp:qiita');

export async function fetchItemsToolWrapper(args: { page?: number | string; per_page?: number | string; created_from?: Date | string; created_to?: Date | string; tags?: string[]; additional_fields?: string[] }) {
  const params: any = { ...args };

  if (params.page !== undefined) {
    if (params.page === '' || params.page === null) {
      delete params.page;
    } else if (typeof params.page === 'string') {
      params.page = parseInt(params.page, 10);
      if (isNaN(params.page)) {
        delete params.page;
      }
    }
  }

  if (params.per_page !== undefined) {
    if (params.per_page === '' || params.per_page === null) {
      delete params.per_page;
    } else if (typeof params.per_page === 'string') {
      params.per_page = parseInt(params.per_page, 10);
      if (isNaN(params.per_page)) {
        delete params.per_page;
      }
    }
  }

  if (params.created_from !== undefined) {
    if (typeof params.created_from === 'string') {
      if (params.created_from === '') {
        delete params.created_from;
      } else {
        params.created_from = new Date(params.created_from);
      }
    }
  }
  if (params.created_to !== undefined) {
    if (typeof params.created_to === 'string') {
      if (params.created_to === '') {
        delete params.created_to;
      } else {
        params.created_to = new Date(params.created_to);
      }
    }
  }

  const result = await fetchItems(params);

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
    version: VERSION,
    capabilities: {
      resources: {},
      tools: {},
    },
  });

  // Register the "get_items" tool
  server.tool(
    "get_items",
    "Fetch Qiita items with optional pagination, date filtering, and tag filtering. By default returns: title, url, created_at. Use additional_fields to include more fields.",
    {
      page: z.coerce.number().int().min(1).max(100).optional(),
      per_page: z.coerce.number().int().min(1).max(100).optional(),
      created_from: z.coerce.date().optional().describe("Filter items created on or after this date (accepts various date formats)"),
      created_to: z.coerce.date().optional().describe("Filter items created on or before this date (accepts various date formats)"),
      tags: z.array(z.string()).optional().describe("Filter items by tags (e.g., ['Rails'] for single tag, ['Ruby', 'Rails'] for multiple tags)"),
      additional_fields: z.array(z.string()).optional().describe("Additional fields to include in response (e.g., ['id', 'tags', 'user.id'])"),
    },
    fetchItemsToolWrapper
  );

  log('MCP Server created with get_items tool');
  return server;
};