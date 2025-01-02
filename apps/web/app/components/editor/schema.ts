import { createListSpec, Schema, type MarkSpec } from "@retro/pm";

export const cardSchema = new Schema({
  nodes: {
    text: {
      group: "inline",
    },
    doc: {
      content: "block+",
    },
    paragraph: {
      content: "inline*",
      group: "block",
      parseDOM: [{ tag: "p" }],
      toDOM() {
        return ["p", 0];
      },
    },
    list: createListSpec(),

    hard_break: {
      inline: true,
      group: "inline",
      selectable: false,
      parseDOM: [{ tag: "br" }],
      toDOM() {
        return ["br"];
      },
    },
  },
  /**
   *
   * Marks
   *
   *
   */
  marks: {
    inlineCode: {
      parseDOM: [{ tag: "code" }],
      toDOM() {
        return ["code"];
      },
    },
    link: {
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
    },
    strike: {
      group: "inline",
      toDOM() {
        return ["s", { class: "strikethrough" }];
      },
      parseDOM: [{ tag: "s" }],
    },
    em: {
      parseDOM: [
        { tag: "i" },
        { tag: "em" },
        { style: "font-style=italic" },
        { style: "font-style=normal", clearMark: (m) => m.type.name == "em" },
      ],
      toDOM() {
        return ["em"];
      },
    },
    strong: {
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
    } as MarkSpec,

    underline: {
      parseDOM: [{ tag: "u" }],
      toDOM() {
        return ["u"];
      },
    },

    code: {
      parseDOM: [{ tag: "code" }],
      toDOM() {
        return ["code"];
      },
    } as MarkSpec,
  },
});

export type CardSchemaType = typeof cardSchema;
