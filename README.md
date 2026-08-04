# mcp-markdown

Markdown utilities MCP.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `markdown_to_text` | Convert Markdown to readable plain text (keyless, offline): strips headings, emphasis, code fences, and turns links/images into their text/alt. Ideal for de-formatting Markdown. |
| `extract_links` | Extract all Markdown links [text](url) (and bare autolinks) as {text, url} pairs (keyless, offline). |
| `extract_headings` | Extract the ATX heading outline (# … ######) as {level, text} entries (keyless, offline). |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "markdown": {
      "url": "https://gateway.pipeworx.io/markdown/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Markdown data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
