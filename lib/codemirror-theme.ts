import { EditorView } from "@codemirror/view";
import { Extension } from "@codemirror/state";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

// Custom dark theme matching the website aesthetic
const snippitDark = EditorView.theme(
  {
    "&": {
      color: "#e5e5e5",
      backgroundColor: "rgba(0, 0, 0, 0.6)",
    },
    ".cm-content": {
      caretColor: "#e5e5e5",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "#e5e5e5",
    },
    "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
      },
    ".cm-panels": {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      color: "#e5e5e5",
    },
    ".cm-panels.cm-panels-top": {
      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    },
    ".cm-panels.cm-panels-bottom": {
      borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    },
    ".cm-searchMatch": {
      backgroundColor: "rgba(100, 100, 100, 0.4)",
      outline: "1px solid rgba(255, 255, 255, 0.2)",
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
      backgroundColor: "rgba(150, 150, 150, 0.5)",
    },
    ".cm-activeLine": {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
    },
    ".cm-selectionMatch": {
      backgroundColor: "rgba(100, 100, 100, 0.3)",
    },
    "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    ".cm-gutters": {
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      color: "rgba(255, 255, 255, 0.4)",
      border: "none",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "rgba(255, 255, 255, 0.08)",
    },
    ".cm-foldPlaceholder": {
      backgroundColor: "rgba(100, 100, 100, 0.4)",
      border: "none",
      color: "rgba(255, 255, 255, 0.6)",
    },
    ".cm-tooltip": {
      border: "1px solid rgba(255, 255, 255, 0.1)",
      backgroundColor: "rgba(0, 0, 0, 0.9)",
    },
    ".cm-tooltip .cm-tooltip-arrow:before": {
      borderTopColor: "transparent",
      borderBottomColor: "transparent",
    },
    ".cm-tooltip .cm-tooltip-arrow:after": {
      borderTopColor: "rgba(0, 0, 0, 0.9)",
      borderBottomColor: "rgba(0, 0, 0, 0.9)",
    },
    ".cm-tooltip-autocomplete": {
      "& > ul > li[aria-selected]": {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        color: "#e5e5e5",
      },
    },
  },
  { dark: true }
);

// Syntax highlighting colors
const snippitHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: "#c792ea" }, // purple
  {
    tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],
    color: "#82aaff",
  }, // blue
  { tag: [t.function(t.variableName), t.labelName], color: "#82aaff" }, // blue
  {
    tag: [t.color, t.constant(t.name), t.standard(t.name)],
    color: "#ffcb6b",
  }, // yellow
  { tag: [t.definition(t.name), t.separator], color: "#e5e5e5" },
  {
    tag: [
      t.typeName,
      t.className,
      t.number,
      t.changed,
      t.annotation,
      t.modifier,
      t.self,
      t.namespace,
    ],
    color: "#f78c6c",
  }, // orange
  {
    tag: [
      t.operator,
      t.operatorKeyword,
      t.url,
      t.escape,
      t.regexp,
      t.link,
      t.special(t.string),
    ],
    color: "#89ddff",
  }, // cyan
  { tag: [t.meta, t.comment], color: "#546e7a", fontStyle: "italic" }, // gray
  { tag: t.strong, fontWeight: "bold" },
  { tag: t.emphasis, fontStyle: "italic" },
  { tag: t.strikethrough, textDecoration: "line-through" },
  { tag: t.link, color: "#89ddff", textDecoration: "underline" },
  { tag: t.heading, fontWeight: "bold", color: "#82aaff" },
  {
    tag: [t.atom, t.bool, t.special(t.variableName)],
    color: "#f78c6c",
  }, // orange
  {
    tag: [t.processingInstruction, t.string, t.inserted],
    color: "#c3e88d",
  }, // green
  { tag: t.invalid, color: "#ff5370" }, // red
]);

export const snippitTheme: Extension = [
  snippitDark,
  syntaxHighlighting(snippitHighlightStyle),
];
