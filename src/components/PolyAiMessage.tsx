/*
 * ============================================================
 * FILE: PolyAiMessage.tsx
 * PURPOSE: Parses and renders POLY AI Markdown, code, tables, and simple flowcharts without external rendering services.
 * ============================================================
 */

import { Fragment, type ReactNode } from "react";

type MessageBlock =
  | { kind: "heading"; level: number; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "quote"; text: string }
  | { kind: "bullets"; items: string[] }
  | { kind: "numbers"; items: string[] }
  | { kind: "code"; language: string; code: string }
  | { kind: "table"; headers: string[]; rows: string[][] }
  | { kind: "divider" };

const codeKeywords: Record<string, string[]> = {
  c: ["auto", "break", "case", "char", "const", "continue", "default", "do", "double", "else", "float", "for", "if", "int", "long", "return", "short", "sizeof", "static", "struct", "switch", "void", "while"],
  cpp: ["auto", "bool", "class", "const", "double", "else", "for", "if", "int", "namespace", "new", "private", "public", "return", "string", "using", "void", "while"],
  javascript: ["async", "await", "const", "else", "export", "function", "if", "import", "let", "new", "return", "throw", "try", "var", "while"],
  typescript: ["async", "await", "const", "else", "export", "function", "if", "import", "interface", "let", "new", "return", "type", "var", "while"],
  python: ["and", "as", "class", "def", "elif", "else", "for", "from", "if", "import", "in", "is", "None", "not", "or", "print", "return", "True", "False", "while", "with"],
  sql: ["alter", "and", "as", "by", "create", "delete", "from", "group", "having", "insert", "into", "join", "left", "limit", "not", "null", "on", "or", "order", "select", "set", "table", "update", "values", "where"],
};

function parseBlocks(markdown: string): MessageBlock[] {
  const lines = markdown.replace(/\r/g, "").trim().split("\n");
  const blocks: MessageBlock[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }
    const fence = line.match(/^\s*```\s*([\w+-]*)\s*$/);
    if (fence) {
      const language = fence[1].toLowerCase();
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !/^\s*```/.test(lines[index])) {
        code.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;
      blocks.push({ kind: "code", language, code: code.join("\n") });
      continue;
    }
    const heading = line.match(/^\s*(#{1,4})\s+(.+?)\s*#*\s*$/);
    if (heading) {
      blocks.push({ kind: "heading", level: heading[1].length, text: heading[2] });
      index += 1;
      continue;
    }
    if (/^\s*(?:---+|\*\*\*+)\s*$/.test(line)) {
      blocks.push({ kind: "divider" });
      index += 1;
      continue;
    }
    if (/^\s*>/.test(line)) {
      const quote: string[] = [];
      while (index < lines.length && /^\s*>/.test(lines[index])) {
        quote.push(lines[index].replace(/^\s*>\s?/, ""));
        index += 1;
      }
      blocks.push({ kind: "quote", text: quote.join(" ") });
      continue;
    }
    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*[-*+]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*[-*+]\s+/, ""));
        index += 1;
      }
      blocks.push({ kind: "bullets", items });
      continue;
    }
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*\d+[.)]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*\d+[.)]\s+/, ""));
        index += 1;
      }
      blocks.push({ kind: "numbers", items });
      continue;
    }
    if (line.includes("|") && index + 1 < lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[index + 1])) {
      const splitRow = (row: string) => row.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
      const headers = splitRow(line);
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
        rows.push(splitRow(lines[index]));
        index += 1;
      }
      blocks.push({ kind: "table", headers, rows });
      continue;
    }
    const paragraph: string[] = [line.trim()];
    index += 1;
    while (index < lines.length && lines[index].trim()) {
      const next = lines[index];
      if (/^\s*(?:#{1,4}\s|```|>|[-*+]\s+|\d+[.)]\s+|---+|\*\*\*+)/.test(next)) break;
      paragraph.push(next.trim());
      index += 1;
    }
    blocks.push({ kind: "paragraph", text: paragraph.join("\n") });
  }
  return blocks;
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|~~[^~]+~~|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    const token = match[0];
    if (token.startsWith("`")) parts.push(<code key={`${keyPrefix}-${key++}`} className="rounded bg-slate-900/8 px-1.5 py-0.5 font-mono text-[0.92em] text-amber-700">{token.slice(1, -1)}</code>);
    else if (token.startsWith("**") || token.startsWith("__")) parts.push(<strong key={`${keyPrefix}-${key++}`}>{token.slice(2, -2)}</strong>);
    else if (token.startsWith("~~")) parts.push(<del key={`${keyPrefix}-${key++}`}>{token.slice(2, -2)}</del>);
    else if (token.startsWith("*") || token.startsWith("_")) parts.push(<em key={`${keyPrefix}-${key++}`}>{token.slice(1, -1)}</em>);
    else {
      const link = token.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
      if (link) parts.push(<a key={`${keyPrefix}-${key++}`} href={link[2]} target="_blank" rel="noreferrer" className="font-medium text-primary underline underline-offset-2 hover:no-underline">{link[1]}</a>);
      else parts.push(token);
    }
    lastIndex = match.index + token.length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

function highlightCode(code: string, language: string): ReactNode[] {
  const normalized = language === "js" ? "javascript" : language === "ts" ? "typescript" : language;
  if (normalized === "mermaid" || normalized === "flowchart") return [code];
  const keywords = new Set(codeKeywords[normalized] ?? codeKeywords.javascript);
  const tokenPattern = /(\/\/[^\n]*|#[^\n]*|--[^\n]*|'[^'\n]*'|"[^"\n]*"|`[^`\n]*`|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*\b)/g;
  const output: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let match: RegExpExecArray | null;
  while ((match = tokenPattern.exec(code))) {
    if (match.index > last) output.push(code.slice(last, match.index));
    const token = match[0];
    const className = /^(\/\/|#|--)/.test(token) ? "text-slate-500 italic" : /^(?:'|\"|`)/.test(token) ? "text-emerald-300" : /^\d/.test(token) ? "text-cyan-300" : keywords.has(token) ? "text-fuchsia-300" : "text-slate-200";
    output.push(<span key={`code-${key++}`} className={className}>{token}</span>);
    last = match.index + token.length;
  }
  if (last < code.length) output.push(code.slice(last));
  return output;
}

function diagramNode(token: string): string {
  const match = token.trim().match(/^[A-Za-z0-9_]+(?:\[([^\]]+)\]|\{([^}]+)\}|\(([^)]+)\))?/);
  return (match?.[1] ?? match?.[2] ?? match?.[3] ?? token).trim();
}

function Flowchart({ code }: { code: string }) {
  const edges = code.split("\n").filter((line) => line.includes("-->"));
  if (!edges.length) return <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-200">{code}</pre>;
  return (
    <div className="my-3 rounded-xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4" role="img" aria-label="AI-generated flowchart">
      <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-700"><span className="h-2 w-2 rounded-full bg-indigo-500" />Concept flow</div>
      <div className="flex flex-col items-stretch gap-2">
        {edges.map((line, index) => {
          const [left, rightWithLabel] = line.split("-->");
          const labelMatch = rightWithLabel.match(/^\s*\|([^|]+)\|\s*(.*)$/);
          const right = labelMatch?.[2] ?? rightWithLabel;
          return (
            <Fragment key={`edge-${index}`}>
              <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                <div className="rounded-lg border border-indigo-200 bg-white px-3 py-2 text-center text-xs font-medium text-slate-700 shadow-sm">{diagramNode(left)}</div>
                <div className="flex flex-col items-center text-indigo-500"><span className="text-lg leading-none">↓</span>{labelMatch && <span className="whitespace-nowrap text-[10px] text-indigo-700">{labelMatch[1]}</span>}</div>
                <div className="rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-center text-xs font-medium text-slate-700 shadow-sm">{diagramNode(right)}</div>
              </div>
              {index < edges.length - 1 && <div className="mx-auto h-1 w-px bg-indigo-200" />}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

export function PolyAiMessage({ content }: { content: string }) {
  const blocks = parseBlocks(content);
  return (
    <div className="poly-ai-message space-y-3 text-[0.95rem] leading-7">
      {blocks.map((block, index) => {
        if (block.kind === "heading") {
          const Tag = block.level <= 2 ? "h3" : "h4";
          return <Tag key={index} className={`${block.level <= 2 ? "text-base" : "text-sm"} font-bold tracking-tight text-slate-900`}>{renderInline(block.text, `heading-${index}`)}</Tag>;
        }
        if (block.kind === "paragraph") return <p key={index} className="whitespace-pre-wrap text-slate-700">{renderInline(block.text, `paragraph-${index}`)}</p>;
        if (block.kind === "quote") return <blockquote key={index} className="border-l-4 border-amber-400 bg-amber-50/70 px-4 py-2 text-slate-700">{renderInline(block.text, `quote-${index}`)}</blockquote>;
        if (block.kind === "bullets") return <ul key={index} className="ml-5 list-disc space-y-1 text-slate-700">{block.items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item, `bullet-${index}-${itemIndex}`)}</li>)}</ul>;
        if (block.kind === "numbers") return <ol key={index} className="ml-5 list-decimal space-y-1 text-slate-700">{block.items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item, `number-${index}-${itemIndex}`)}</li>)}</ol>;
        if (block.kind === "divider") return <hr key={index} className="border-slate-200" />;
        if (block.kind === "table") return <div key={index} className="my-3 overflow-x-auto rounded-xl border border-slate-200"><table className="min-w-full text-left text-xs"><thead className="bg-slate-100 text-slate-800"><tr>{block.headers.map((header, headerIndex) => <th key={headerIndex} className="whitespace-nowrap px-3 py-2 font-semibold">{renderInline(header, `header-${index}-${headerIndex}`)}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 bg-white">{block.rows.map((row, rowIndex) => <tr key={rowIndex} className="align-top even:bg-slate-50/70">{block.headers.map((_, cellIndex) => <td key={cellIndex} className="px-3 py-2 text-slate-700">{renderInline(row[cellIndex] ?? "", `cell-${index}-${rowIndex}-${cellIndex}`)}</td>)}</tr>)}</tbody></table></div>;
        if (block.language === "mermaid" || block.language === "flowchart") return <Flowchart key={index} code={block.code} />;
        return <div key={index} className="my-3 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-inner"><div className="flex items-center justify-between border-b border-slate-800 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400"><span>{block.language || "code"}</span><span className="flex gap-1"><i className="h-2 w-2 rounded-full bg-rose-400" /><i className="h-2 w-2 rounded-full bg-amber-300" /><i className="h-2 w-2 rounded-full bg-emerald-400" /></span></div><pre className="overflow-x-auto p-4 text-xs leading-6"><code>{highlightCode(block.code, block.language)}</code></pre></div>;
      })}
    </div>
  );
}

export default PolyAiMessage;

