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
      content: "heading block+",
    },
    paragraph: createParagraphSpec(),
    heading: createHeadingSpec(),
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
  },
});

export type IntroSchemaType = typeof IntroSchema;

// Define a task item node
function createTaskItemSpec() {
  return {
    content: "inline*",
    group: "listItem",
    attrs: {
      id: { default: "" },
      completed: { default: false },
    },
    parseDOM: [
      {
        tag: "li.task-item",
        getAttrs(dom) {
          const element = dom as HTMLElement;
          return {
            id: element.getAttribute("data-id") || "",
            completed: element.getAttribute("data-completed") === "true",
          };
        },
      },
    ],
    toDOM(node) {
      return [
        "li",
        {
          class: "task-item",
          "data-id": node.attrs.id,
          "data-completed": node.attrs.completed.toString(),
        },
        0,
      ];
    },
  };
}

// Define a task list container
function createTaskListSpec() {
  return {
    content: "taskItem+",
    group: "block",
    parseDOM: [{ tag: "ul.task-list" }],
    toDOM() {
      return ["ul", { class: "task-list" }, 0];
    },
  };
}

export const SummarySchema = new Schema({
  nodes: {
    doc: {
      content: "heading block+",
    },
    paragraph: createParagraphSpec(),
    heading: createHeadingSpec(),
    subheading: createHeadingSpec("h3"),
    list: createListSpec(),
    taskList: createTaskListSpec(), // Task list container
    taskItem: createTaskItemSpec(), // Individual task items
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
  },
});

export type SummarySchemaType = typeof SummarySchema;

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
