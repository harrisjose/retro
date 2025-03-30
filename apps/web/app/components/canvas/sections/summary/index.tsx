import "@retro/pm/flat-list-css";
import "./index.css";

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
import { apiClient, useDocument, useRawSummaryContent } from "@retro/sdk";
import { useRef, useState } from "react";
import * as Y from "yjs";
import { buildDefaultKeymap } from "../../../editor/keymap";

function createEditorState(fragment: Y.XmlFragment) {
  const state = EditorState.create({
    plugins: [
      ...createListPlugins({ schema: EditorSchema.SummarySchema }),
      inputRules({ rules: listInputRules }),
      keymap({
        ...listKeymap,
        "Mod-[": () => false,
        "Mod-]": () => false,
        Tab: createIndentListCommand(),
        "Shift-Tab": createDedentListCommand(),
      }),
      keymap(buildDefaultKeymap(EditorSchema.SummarySchema)),
      keymap(baseKeymap),
      ySyncPlugin(fragment),
    ],
    schema: EditorSchema.SummarySchema,
  });

  return state;
}

export default function SummarySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const document = useDocument();
  const content = useRawSummaryContent();

  const [isLoading, setIsLoading] = useState(false);
  const onClick = async () => {
    setIsLoading(true);
    await apiClient.document.generateSummary.mutate({ id: document.id });
    setIsLoading(false);
  };

  return (
    <div
      key={`summary-section`}
      ref={sectionRef}
      className="shrink-0 bg-white rounded-2xl border overflow-hidden border-[#0000000F] p-20 flex flex-col justify-center items-center relative"
      data-clear-selection
      style={{
        width: CanvasConstants.IntroSectionWidth,
        height: CanvasConstants.SectionHeight,
      }}
    >
      <div className="overflow-y-scroll w-full">
        {content && (
          <EditorContextProvider
            id={`summary-section`}
            createEditorState={createEditorState}
          >
            <ProsemirrorEditor fragment={content} className="summary-pm" />
          </EditorContextProvider>
        )}
      </div>
      <div className="pt-[25px] w-full flex justify-start">
        <Button onClick={onClick} disabled={isLoading}>
          {isLoading ? "Generating summary..." : "Generate summary"}
        </Button>
      </div>
      <div className="absolute top-0 repeat-3 rounded-2xl overflow-hidden">
        <img
          src="/insertion-menu/gradient-ai.png"
          alt="emoji-picker-1"
          className="left-[23px] w-full object-cover"
        />
      </div>
    </div>
  );
}
