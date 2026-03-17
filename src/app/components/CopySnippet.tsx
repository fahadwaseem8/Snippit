"use client";

import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { snippitTheme } from "@/lib/codemirror-theme";
import { EditorView } from "@codemirror/view";

type CopySnippetProps = {
  code?: string;
  title?: string;
};

export default function CopySnippet({
  code = `// Meet Snippit — your snippet sidekick
type Snippet = { id: string; code: string };

const db: Record<string, Snippet> = {};

export function save(id: string, code: string) {
  db[id] = { id, code };
  return '✅ saved: ' + id;
}

export async function copy(id: string) {
  const snip = db[id]?.code ?? "console.log('¯\\_(ツ)_/¯')";
  await navigator.clipboard.writeText(snip);
  return '📋 copied: ' + id;
}

// Demo
save('hello-world', "console.log('Hello, Snippit! 🚀')");
copy('hello-world');
`,
  title = "Try it: save + copy",
}: CopySnippetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  return (
    <div className="w-full max-w-3xl rounded-lg border border-foreground/20 bg-black/40 dark:bg-black/60 shadow-2xl overflow-hidden backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-2.5 text-xs bg-gradient-to-r from-foreground/[0.08] to-transparent border-b border-foreground/10">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <span className="font-mono text-foreground/60 ml-2">{title}</span>
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md border border-foreground/20 px-3 py-1.5 hover:bg-foreground/10 transition-all font-mono text-xs"
          aria-live="polite"
        >
          {copied ? (
            <>
              <span>✓</span>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <span>📋</span>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto">
        <CodeMirror
          value={code}
          height="auto"
          extensions={[javascript({ typescript: true }), EditorView.lineWrapping]}
          theme={snippitTheme}
          editable={false}
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            highlightActiveLineGutter: false,
            highlightActiveLine: false,
          }}
          className="text-sm"
        />
      </div>
    </div>
  );
}
