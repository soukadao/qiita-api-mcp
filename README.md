# qiita-api-mcp

## ツール

### 1. `get_items`: 記事の一覧を返す

api: https://qiita.com/api/v2/docs#get-apiv2items

**パラメーター**

  - page
  - per_page
  - created_from
  - created_to
  - additional_fields

## NPMセットアップ

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

## ローカルセットアップ

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