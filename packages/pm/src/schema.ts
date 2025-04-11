import {
  type DOMOutputSpec,
  type NodeSpec,
  Schema,
  createListSpec,
} from "./prosemirror.js";
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

function createTaskListSpec(): NodeSpec {
  return {
    group: "block",
    attrs: {
      tasks: { default: [] },
    },
    parseDOM: [
      {
        tag: "div.task-list-container",
        getAttrs(dom: HTMLElement) {
          try {
            const tasksData = dom.getAttribute("data-tasks");
            console.log("taskdata", tasksData);
            return { tasks: tasksData ? JSON.parse(tasksData) : [] };
          } catch (e) {
            console.error("Error parsing task list data:", e);
            return { tasks: [] };
          }
        },
      },
    ],
    toDOM(node: { attrs: { tasks: any[] } }): DOMOutputSpec {
      return [
        "div",
        {
          class: "task-list-container",
          "data-tasks": JSON.stringify(node.attrs.tasks || []),
        },
      ];
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
    taskList: createTaskListSpec(),
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
