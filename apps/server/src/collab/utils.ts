import {
  CanvasConstants,
  type YSection,
  type YSectionBase,
} from "@retro/common";
import { EditorSchema, HtmlUtils, prosemirrorToYXmlFragment } from "@retro/pm";
import * as random from "lib0/random";
import type { Section } from "node_modules/@retro/common/src/types/document";
import { YKeyValue } from "y-utility/y-keyvalue";
import * as Y from "yjs";

const introDoc = HtmlUtils.generateDocFromHtml(
  `
  <h2>Instructions</h2>
  <p><strong>Part 1: Add content (10 min)</strong><br/>Create stickies to share your ideas. Try to add stickies to every category.</p>
  <p><strong>Part 2: Share aloud (15 min)</strong><br/>Take turns talking about highlights and lowlights aloud. If you hear someone mention a topic you also mentioned, move your sticky near theirs (so we can start to collect themes).</p>
  <p><strong>Part 3: React and vote (5 min)</strong><br/>Use the reactions & dot stickers from the default library to "vote" on the areas that you think we definitely need to follow up on</p>
`.trim(),
  EditorSchema.IntroSchema,
);

const summaryDoc = HtmlUtils.generateDocFromHtml(
  `
  <h2>Summary</h2>
  <p>We talked about...</p>
  <h3>Actionable items</h3>
`.trim(),
  EditorSchema.SummarySchema,
);

// TODO @harris: Use fractional indexes for better support for
// reordering sections when required
const defaultSections = [
  {
    name: "What went well?",
    index: "0",
    width: CanvasConstants.SectionWidth,
    height: CanvasConstants.SectionHeight,
  },
  {
    name: "What went wrong?",
    index: "1",
    width: CanvasConstants.SectionWidth,
    height: CanvasConstants.SectionHeight,
  },
  {
    name: "What can we do better?",
    index: "2",
    width: CanvasConstants.SectionWidth,
    height: CanvasConstants.SectionHeight,
  },
];

export const getInitialYDoc = () => {
  try {
    const yDoc = new Y.Doc();
    const sectionsMap = yDoc.getMap("sections");

    defaultSections.forEach((section) => {
      const id = random.uuidv4();

      sectionsMap.set(id, new Y.Array());

      const backingArray = sectionsMap.get(id) as YSectionBase;
      const sectionKV = new YKeyValue(backingArray) as YSection;

      Object.entries(section).forEach(([key, value]) => {
        sectionKV.set(key as keyof Section, value);
      });
    });

    const blocksMap = yDoc.getMap("blocks");
    const propertiesMap = yDoc.getMap("properties");
    // TODO @harris: Add default blocks and properties

    const introSection = yDoc.getMap("intro");

    introSection.set("content", new Y.XmlFragment());
    prosemirrorToYXmlFragment(
      introDoc,
      introSection.get("content") as Y.XmlFragment,
    );

    const summarySection = yDoc.getMap("summary");
    summarySection.set("content", new Y.XmlFragment());
    prosemirrorToYXmlFragment(
      summaryDoc,
      summarySection.get("content") as Y.XmlFragment,
    );

    return Buffer.from(Y.encodeStateAsUpdate(yDoc));
  } catch (error) {
    console.error("Error getting initial YDoc", error);
    throw error;
  }
};
