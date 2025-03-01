import type { Section, SectionMap, YSectionBase } from "@retro/common";
import { useContext } from "react";
import { useSnapshot } from "valtio";
import { YKeyValue } from "y-utility/y-keyvalue";
import * as Y from "yjs";
import { DocContext, useYDoc } from "../document/document.js";

export const useSectionMap = () => {
  const state = useContext(DocContext);
  const snapshot = useSnapshot(state.sections);
  const yDoc = useYDoc();

  const setSectionHeight = (sectionId: string, height: number) => {
    const ySectionMap = yDoc.getMap("sections");
    const ySectionBase = ySectionMap.get(sectionId) as YSectionBase;
    const ySection = new YKeyValue(ySectionBase);

    console.log("setSectionHeight", sectionId, height);

    yDoc.transact(() => {
      ySection.set("height", height);
    });
  };

  return {
    sections: snapshot as SectionMap,
    setSectionHeight,
  };
};

export const useSection = (sectionId: string) => {
  const { sections } = useContext(DocContext);
  const snapshot = useSnapshot(sections[sectionId]);
  const yDoc = useYDoc();

  const setName = (name: string) => {
    const ySectionMap = yDoc.getMap("sections");
    const ySectionBase = ySectionMap.get(sectionId) as YSectionBase;
    const ySection = new YKeyValue(ySectionBase);

    yDoc.transact(() => {
      ySection.set("name", name);
    });
  };

  return { section: snapshot as Section, setName };
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
