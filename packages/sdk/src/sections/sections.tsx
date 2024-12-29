import { useContext } from "react";
import { useSnapshot } from "valtio";
import { DocContext } from "../document/document.js";
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
