import type { MarkSpec, NodeSpec } from "./prosemirror.js";

export const createParagraphSpec = () => {
  return {
    content: "inline*",
    group: "block",
    parseDOM: [{ tag: "p" }],
    toDOM() {
      return ["p", 0];
    },
  } as NodeSpec;
};

export const createHeadingSpec = (tag: string = "h2") => {
  return {
    content: "inline*",
    group: "block",
    parseDOM: [{ tag }],
    toDOM() {
      return [tag, 0];
    },
  } as NodeSpec;
};

export const createHardBreakSpec = () => {
  return {
    inline: true,
    group: "inline",
    selectable: false,
    parseDOM: [{ tag: "br" }],
    toDOM() {
      return ["br"];
    },
  } as NodeSpec;
};

export const createLinkMarkSpec = () => {
  return {
    attrs: {
      href: {},
      title: { default: null },
    },
    inclusive: false,
    parseDOM: [
      {
        tag: "a[href]",
        getAttrs(dom) {
          return {
            href: (dom as HTMLElement).getAttribute("href"),
            title: dom.getAttribute("title"),
          };
        },
      },
    ],
    toDOM(node) {
      return ["a", node.attrs];
    },
  } as MarkSpec;
};

export const createStrikeMarkSpec = () => {
  return {
    group: "inline",
    toDOM() {
      return ["s", { class: "strikethrough" }];
    },
    parseDOM: [{ tag: "s" }],
  } as MarkSpec;
};

export const createEmMarkSpec = () => {
  return {
    parseDOM: [
      { tag: "i" },
      { tag: "em" },
      { style: "font-style=italic" },
      { style: "font-style=normal", clearMark: (m) => m.type.name == "em" },
    ],
    toDOM() {
      return ["em"];
    },
  } as MarkSpec;
};

export const createStrongMarkSpec = () => {
  return {
    parseDOM: [
      { tag: "strong" },
      {
        tag: "b",
        getAttrs: (node) => node.style.fontWeight !== "normal" && null,
      },
      { style: "font-weight=400", clearMark: (m) => m.type.name == "strong" },
      {
        style: "font-weight",
        getAttrs: (value) => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null,
      },
    ],
    toDOM() {
      return ["strong"];
    },
  } as MarkSpec;
};

export const createUnderlineMarkSpec = () => {
  return {
    parseDOM: [{ tag: "u" }],
    toDOM() {
      return ["u"];
    },
  } as MarkSpec;
};

export const createCodeMarkSpec = () => {
  return {
    parseDOM: [{ tag: "code" }],
    toDOM() {
      return ["code"];
    },
  } as MarkSpec;
};
