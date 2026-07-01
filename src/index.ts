interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Markdown utilities MCP.
 *
 * Keyless, offline: convert Markdown to readable plain text, extract links, and
 * extract the heading outline. Regex-based (not a full CommonMark parser) — good
 * for cleaning Markdown before feeding it to a model. No API, no key.
 */


function toText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, (b) => b.replace(/```[^\n]*\n?/g, '').replace(/```/g, ''))
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s*([-*+]|\d+\.)\s+/gm, '• ')
    .replace(/^\s*([-*_]\s*){3,}\s*$/gm, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const tools: McpToolExport['tools'] = [
  {
    name: 'markdown_to_text',
    description: 'Convert Markdown to readable plain text (keyless, offline): strips headings, emphasis, code fences, and turns links/images into their text/alt. Ideal for de-formatting Markdown.',
    inputSchema: { type: 'object', properties: { markdown: { type: 'string', description: 'The Markdown text.' } }, required: ['markdown'] },
  },
  {
    name: 'extract_links',
    description: 'Extract all Markdown links [text](url) (and bare autolinks) as {text, url} pairs (keyless, offline).',
    inputSchema: { type: 'object', properties: { markdown: { type: 'string', description: 'The Markdown text.' } }, required: ['markdown'] },
  },
  {
    name: 'extract_headings',
    description: 'Extract the ATX heading outline (# … ######) as {level, text} entries (keyless, offline).',
    inputSchema: { type: 'object', properties: { markdown: { type: 'string', description: 'The Markdown text.' } }, required: ['markdown'] },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const md = reqStr(args, 'markdown', '"# Title\\nHello"');
  switch (name) {
    case 'markdown_to_text': {
      const text = toText(md);
      return { text, length: text.length };
    }
    case 'extract_links': {
      const links: { text: string; url: string }[] = [];
      const re = /\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
      let m; while ((m = re.exec(md)) && links.length < 500) links.push({ text: m[1], url: m[2] });
      const auto = /<((?:https?|mailto):[^>]+)>/g;
      while ((m = auto.exec(md)) && links.length < 500) links.push({ text: m[1], url: m[1] });
      return { count: links.length, links };
    }
    case 'extract_headings': {
      const headings: { level: number; text: string }[] = [];
      for (const line of md.split('\n')) {
        const m = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
        if (m) headings.push({ level: m[1].length, text: m[2].trim() });
      }
      return { count: headings.length, headings };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function reqStr(args: Record<string, unknown>, key: string, ex: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.length) throw new Error(`Required argument "${key}" is missing. Pass a string like ${ex}.`);
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
