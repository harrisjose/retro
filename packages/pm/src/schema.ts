import { Schema, createListSpec } from "./prosemirror.js";
import {
  createCodeMarkSpec,
  createEmMarkSpec,
  createHardBreakSpec,
  createHeadingSpec,
  createLinkMarkSpec,
  createParagraphSpec,
  createStrikeMarkSpec,
  createStrongMarkSpec,
  createUnderlineMarkSpec,
} from "./schema-utils.js";

export const IntroSchema = new Schema({
  nodes: {
    doc: {
      content: "heading paragraph+",
    },
    heading: createHeadingSpec(),
    paragraph: createParagraphSpec(),
    list: createListSpec(),
    hard_break: createHardBreakSpec(),
    text: {
      group: "inline",
    },
  },
  marks: {
    link: createLinkMarkSpec(),
    strike: createStrikeMarkSpec(),
    em: createEmMarkSpec(),
    strong: createStrongMarkSpec(),
    underline: createUnderlineMarkSpec(),
    code: createCodeMarkSpec(),
  },
});

export type IntroSchemaType = typeof IntroSchema;

export const CardSchema = new Schema({
  nodes: {
    doc: {
      content: "block+",
    },
    paragraph: createParagraphSpec(),
    list: createListSpec(),
    hard_break: createHardBreakSpec(),
    text: {
      group: "inline",
    },
  },
  marks: {
    inlineCode: createCodeMarkSpec(),
    link: createLinkMarkSpec(),
    strike: createStrikeMarkSpec(),
    em: createEmMarkSpec(),
    strong: createStrongMarkSpec(),
    underline: createUnderlineMarkSpec(),
  },
});

export type CardSchemaType = typeof CardSchema;
