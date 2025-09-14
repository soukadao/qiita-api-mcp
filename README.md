# qiita-api-mcp

## Tools

### 1. `get_items`: Retrieve the list of articles

api: https://qiita.com/api/v2/docs#get-apiv2items

**parameter**

  - page
  - per_page
  - query

## NPM Setup

```json
{
  "mcpServers": {
    "qiita-api": {
      "command": "npx",
      "args": ["-y", "qiita-api-mcp"],
      "env": {
        "QIITA_API_ACCESS_TOKEN": "${QIITA_API_ACCESS_TOKEN}"
      }
    }
  }
}
```

## Local Setup

```bash
$ git clone https://github.com/soukadao/qiita-api-mcp.git
qiita-api-mcp $ npm run build
```

```json
{
  "mcpServers": {
    "qiita-api": {
      "command": "node",
      "args": ["qiita-api-mcp/dist/app/index.js"],
      "env": {
        "QIITA_API_ACCESS_TOKEN": "${QIITA_API_ACCESS_TOKEN}"
      }
    }
  }
}
```

## Inspector

```bash
$ npx @modelcontextprotocol/inspector node dist/app/index.js -e QIITA_API_ACCESS_TOKEN=xxxxxxxxxxxxxxxxxx
```