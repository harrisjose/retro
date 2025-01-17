import { useContext } from "react";
import { useSnapshot } from "valtio";
import * as Y from "yjs";
import { DocContext, useYDoc } from "../document/document.js";
import type { Section, SectionMap } from "./types.js";

export const useSectionMap = () => {
  const state = useContext(DocContext);
  const snapshot = useSnapshot(state.sections);
  return snapshot as SectionMap;
};

export const useSection = (sectionId: string) => {
  const { sections } = useContext(DocContext);
  const snapshot = useSnapshot(sections[sectionId]);
  return snapshot as Section;
};

export const useRawIntroContent = () => {
  const yDoc = useYDoc();
  const introSection = yDoc.getMap("intro");
  const content = introSection.get("content") as Y.XmlFragment;
  return content;
};

export const useRawSummaryContent = () => {
  const yDoc = useYDoc();
  const summarySection = yDoc.getMap("summary");
  const content = summarySection.get("content") as Y.XmlFragment;
  return content;
};
