import {
  TimerProvider,
  useCollaborators,
  useDocument,
  useSectionMap,
} from "@retro/sdk";
import { isNil } from "lodash-es";
import { DocumentMusic } from "../music";
import { DocumentTimerWrapper } from "../timer";
import { CollaboratorAvatars } from "../ui/collaborator-avatars";

export default function Topbar() {
  const { id: documentId } = useDocument();
  const collaborators = useCollaborators();
  const sectionMap = useSectionMap();

  return (
    <div className="top-4 left-0 w-screen h-[28px] relative z-20">
      <div className="shadow-[0px_0px_1px_0px_rgba(0,0,0,0.34)] p-[6px] rounded-2xl bg-white absolute left-[24px] top-[-2px] flex h-full gap-2">
        <TimerProvider documentId={documentId}>
          <DocumentTimerWrapper />
          <div className="h-full w-[2px] bg-[#000000]/20"></div>
          <DocumentMusic />
        </TimerProvider>
      </div>

      <div className="flex gap-2 justify-center items-center">
        <div className="py-1.5 px-3 font-bold text-sm leading-4 bg-[#f1f1f1] rounded-2xl shadow-[0px_0px_1px_0px_#0000004D]">
          Intro
        </div>
        {Object.entries(sectionMap).map(([id, section]) => (
          <div
            key={id}
            className="py-1.5 px-3 font-bold text-sm leading-4 bg-[#f1f1f1] rounded-2xl shadow-[0px_0px_1px_0px_#0000004D]"
          >
            {section.name}
          </div>
        ))}
        <div className="py-1.5 px-3 font-bold text-sm leading-4 bg-[#f1f1f1] rounded-2xl shadow-[0px_0px_1px_0px_#0000004D]">
          Summary
        </div>
        <CollaboratorAvatars
          className="-space-x-1 bg-white shadow-[0px_0px_1px_0px_#00000057] h-[28px] rounded-2xl flex items-center justify-center p-1.5"
          avatarUrls={collaborators
            .map((c) => c.image)
            .filter((i) => !isNil(i))}
        />
      </div>
    </div>
  );
}
