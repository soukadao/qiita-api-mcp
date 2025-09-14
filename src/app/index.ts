#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createStdioServer } from "../features/server/index.js";

const server = createStdioServer();

async function startStdioServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

startStdioServer().catch((error) => {
  console.error("Fatal error in startStdioServer():", error);
  process.exit(1);
});