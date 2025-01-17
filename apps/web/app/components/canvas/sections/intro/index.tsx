import { ProsemirrorEditor } from "@/components/editor/editor";
import { EditorContextProvider } from "@/components/editor/editor-provider";
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
import { useRawIntroContent } from "@retro/sdk";
import { useRef } from "react";
import * as Y from "yjs";
import { buildDefaultKeymap } from "../../../editor/keymap";

import "./index.css";

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

  return (
    <div
      key={`intro-section`}
      ref={sectionRef}
      className="shrink-0 bg-white rounded-2xl border border-dashed border-[#0000000F] p-20 flex flex-col justify-center items-center"
      data-clear-selection
      style={{
        width: CanvasConstants.IntroSectionWidth,
        height: CanvasConstants.SectionHeight,
      }}
    >
      <div className="overflow-y-scroll">
        {content && (
          <EditorContextProvider
            id={`intro-section`}
            createEditorState={createEditorState}
          >
            <ProsemirrorEditor fragment={content} className="intro-pm" />
          </EditorContextProvider>
        )}
      </div>
      <div className="pt-[25px] w-full flex justify-start">
        <Button>Start</Button>
      </div>
    </div>
  );
}
