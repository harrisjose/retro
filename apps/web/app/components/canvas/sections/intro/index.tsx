import "./index.css";

import { ProsemirrorEditor } from "@/components/editor/editor";
import { EditorContextProvider } from "@/components/editor/editor-provider";
import StartHere from "@/components/svg/start-here";
import StartHereArrow from "@/components/svg/start-here-arrow";
import { Button } from "@/components/ui/button";
import { CanvasConstants } from "@retro/common";
import {
  EditorSchema,
  EditorState,
  baseKeymap,
  createDedentListCommand,
  createIndentListCommand,
  createListPlugins,
  inputRules,
  keymap,
  listInputRules,
  listKeymap,
  ySyncPlugin,
} from "@retro/pm";
import { useRawIntroContent, useSectionMap } from "@retro/sdk";
import { find } from "lodash-es";
import { useRef } from "react";
import * as Y from "yjs";
import { buildDefaultKeymap } from "../../../editor/keymap";
import { useSectionNavigation } from "../../store/hooks";

function createEditorState(fragment: Y.XmlFragment) {
  const state = EditorState.create({
    plugins: [
      ...createListPlugins({ schema: EditorSchema.IntroSchema }),
      inputRules({ rules: listInputRules }),
      keymap({
        ...listKeymap,
        "Mod-[": () => false,
        "Mod-]": () => false,
        Tab: createIndentListCommand(),
        "Shift-Tab": createDedentListCommand(),
      }),
      keymap(buildDefaultKeymap(EditorSchema.IntroSchema)),
      keymap(baseKeymap),
      ySyncPlugin(fragment),
    ],
    schema: EditorSchema.IntroSchema,
  });

  return state;
}

export default function IntroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const content = useRawIntroContent();

  const { moveToSection } = useSectionNavigation();
  const { sections: sectionMap } = useSectionMap();

  const onClick = () => {
    const firstSection = find(
      Object.entries(sectionMap),
      ([_, section]) => section.index === "0",
    );
    const [sectionId] = firstSection!;
    moveToSection(sectionId);
  };

  return (
    <div
      key={`intro-section`}
      ref={sectionRef}
      className="relative shrink-0 bg-white rounded-2xl border border-[#0000000F] p-12 flex flex-col justify-between h-full"
      data-clear-selection
      style={{
        width: CanvasConstants.IntroSectionWidth,
        minHeight: CanvasConstants.IntroSectionHeight,
      }}
    >
      <div className="absolute top-0 right-0 repeat-3 rounded-2xl overflow-hidden">
        <img
          src="/insertion-menu/intro-cover.png"
          alt="emoji-picker-1"
          className="right-0 w-[321px] object-cover"
        />
      </div>

      <div>
        <div className="flex">
          <div>
            <StartHere className="w-7 h-auto" />
          </div>
          <div className="animate-bounce">
            <StartHereArrow></StartHereArrow>
          </div>
        </div>
        <div className="text-xs text-secondary-foreground w-72 mt-2 mb-10 opacity-50">
          You can write an introduction on how to engage in this retro meeting
          below
        </div>

        {content && (
          <EditorContextProvider
            id={`intro-section`}
            createEditorState={createEditorState}
          >
            <ProsemirrorEditor fragment={content} className="intro-pm" />
          </EditorContextProvider>
        )}

        <div className="pt-[25px] w-full flex justify-start">
          <Button variant={"brand"} size={"brand"} onClick={onClick}>
            Let's go →
          </Button>
        </div>
      </div>
    </div>
  );
}
