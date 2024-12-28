import { useCollaborators } from "@retro/sdk";
import { isNil } from "lodash-es";
import { CollaboratorAvatars } from "../ui/collaborator-avatars";

export default function Topbar() {
  const collaborators = useCollaborators();

  return (
    <div className="mt-4 h-[28px] relative z-20">
      <div className="flex gap-2 justify-center items-center">
        <div className="py-1.5 px-3 font-bold text-sm leading-4 bg-[#f1f1f1] rounded-2xl">
          What went well?
        </div>
        <div className="py-1.5 px-3 font-bold text-sm leading-4 bg-[#f1f1f1] rounded-2xl">
          What went wrong?
        </div>
        <div className="py-1.5 px-3 font-bold text-sm leading-4 bg-[#f1f1f1] rounded-2xl">
          What can we do better?
        </div>
        <div className="py-1.5 px-3 font-bold text-sm leading-4 bg-[#f1f1f1] rounded-2xl">
          Summary
        </div>
        <CollaboratorAvatars
          className="-space-x-1 shadow-[0px_0px_1px_0px_#00000057] h-[28px] rounded-2xl flex items-center justify-center p-1.5"
          avatarUrls={collaborators
            .map((c) => c.image)
            .filter((i) => !isNil(i))}
        />
      </div>
    </div>
  );
}
