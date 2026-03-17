"use client";

import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { php } from "@codemirror/lang-php";
import { rust } from "@codemirror/lang-rust";
import { sql } from "@codemirror/lang-sql";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { xml } from "@codemirror/lang-xml";
import { snippitTheme } from "@/lib/codemirror-theme";

// Helper function to get CodeMirror language extension
const getLanguageExtension = (lang: string) => {
  switch (lang) {
    case "javascript":
    case "typescript":
      return javascript({ typescript: lang === "typescript" });
    case "python":
      return python();
    case "java":
      return java();
    case "cpp":
    case "c":
      return cpp();
    case "php":
      return php();
    case "rust":
      return rust();
    case "sql":
      return sql();
    case "html":
      return html();
    case "css":
    case "scss":
    case "sass":
    case "less":
      return css();
    case "json":
      return json();
    case "markdown":
      return markdown();
    case "xml":
    case "yaml":
      return xml();
    default:
      return javascript(); // fallback
  }
};

interface Snippet {
  id: string;
  title: string;
  language: string;
  code: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

interface SnippetCardProps {
  snippet: Snippet;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onEdit: (snippet: Snippet) => void;
}

export default function SnippetCard({
  snippet,
  onDelete,
  onToggleFavorite,
  onEdit,
}: SnippetCardProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      setShowMenu(false);
    } catch (error) {
      console.error("Copy failed", error);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="border border-foreground/20 rounded-lg bg-black/40 backdrop-blur-sm hover:border-foreground/30 transition-all overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-foreground/10 bg-foreground/[0.04]">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => onToggleFavorite(snippet.id, !snippet.is_favorite)}
            className="text-xl hover:scale-110 transition-transform"
            title={snippet.is_favorite ? "Remove from favorites" : "Add to favorites"}
          >
            {snippet.is_favorite ? "⭐" : "☆"}
          </button>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{snippet.title}</h3>
            <p className="text-xs text-foreground/50 font-mono">
              {snippet.language} • {formatDate(snippet.updated_at)}
            </p>
          </div>
        </div>
        
        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-xs font-mono border border-foreground/20 rounded hover:bg-foreground/5 transition whitespace-nowrap"
          >
            {copied ? "✓ Copied" : "📋 Copy"}
          </button>
          <button
            onClick={() => onEdit(snippet)}
            className="px-3 py-1.5 text-xs font-mono border border-foreground/20 rounded hover:bg-foreground/5 transition whitespace-nowrap"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete "${snippet.title}"?`)) {
                onDelete(snippet.id);
              }
            }}
            className="px-3 py-1.5 text-xs font-mono border border-red-500/30 text-red-400 rounded hover:bg-red-500/10 transition whitespace-nowrap"
          >
            🗑️ Delete
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="px-3 py-1.5 text-xs font-mono border border-foreground/20 rounded hover:bg-foreground/5 transition"
            aria-label="More actions"
          >
            ⋮
          </button>
          
          {showMenu && (
            <>
              {/* Backdrop to close menu */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)}
              />
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-1 z-20 bg-black/90 border border-foreground/20 rounded-lg shadow-xl overflow-hidden min-w-[140px]">
                <button
                  onClick={handleCopy}
                  className="w-full px-4 py-2.5 text-left text-sm font-mono hover:bg-foreground/5 transition flex items-center gap-2"
                >
                  <span>📋</span> {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={() => {
                    onEdit(snippet);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm font-mono hover:bg-foreground/5 transition border-t border-foreground/10 flex items-center gap-2"
                >
                  <span>✏️</span> Edit
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    if (confirm(`Delete "${snippet.title}"?`)) {
                      onDelete(snippet.id);
                    }
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm font-mono text-red-400 hover:bg-red-500/10 transition border-t border-foreground/10 flex items-center gap-2"
                >
                  <span>🗑️</span> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Code preview */}
      <div className="overflow-x-auto overflow-y-hidden max-w-full">
        <CodeMirror
          value={snippet.code}
          theme={snippitTheme}
          extensions={[getLanguageExtension(snippet.language)]}
          editable={false}
          readOnly={true}
          maxHeight="200px"
          className="text-sm"
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: false,
            highlightSpecialChars: true,
            foldGutter: false,
            drawSelection: false,
            dropCursor: false,
            allowMultipleSelections: false,
            indentOnInput: false,
            bracketMatching: true,
            closeBrackets: false,
            autocompletion: false,
            rectangularSelection: false,
            crosshairCursor: false,
            highlightActiveLine: false,
            highlightSelectionMatches: false,
            closeBracketsKeymap: false,
            searchKeymap: false,
            foldKeymap: false,
            completionKeymap: false,
            lintKeymap: false,
          }}
        />
      </div>
    </div>
  );
}
