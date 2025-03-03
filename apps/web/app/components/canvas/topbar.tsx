import { cn } from "@retro/common";
import { useCollaborators, useDocument, useSectionMap } from "@retro/sdk";
import { isNil } from "lodash-es";
import { useNavigate } from "react-router";
import Back from "../svg/back";
import { CollaboratorAvatars } from "../ui/collaborator-avatars";
import { Separator } from "../ui/separator";
import { useSectionNavigation } from "./store/hooks";

const SectionButton = ({
  id,
  name,
  active,
  onClick,
}: {
  id: string;
  name: string;
  active: boolean;
  onClick: () => void;
}) => {
  return (
    <a
      key={id}
      className={cn(
        "py-1.5 px-3 font-bold text-sm leading-4 bg-[#f1f1f1] rounded-2xl shadow-[0px_0px_1px_0px_#0000004D] cursor-pointer",
        active && "bg-white",
      )}
      onClick={onClick}
    >
      {name}
    </a>
  );
};

const DocumentNameWrapper = () => {
  const navigate = useNavigate();
  const document = useDocument();
  const onBack = () => {
    navigate("/");
  };

  return (
    <div className="shadow-[0px_0px_1px_0px_rgba(0,0,0,0.34)] pl-[10px] pr-[12px] rounded-2xl bg-white absolute left-[24px] top-[-2px] h-full gap-2 flex items-center justify-center">
      <button onClick={onBack} className="hover:bg-black/[0.04] rounded-sm">
        <Back className="w-4 h-4" />
      </button>
      <Separator
        orientation="vertical"
        className="bg-black opacity-5 rounded-sm"
      />
      <div className="text-sm">{document.name}</div>
    </div>
  );
};

export default function Topbar() {
  const collaborators = useCollaborators();
  const sectionMap = useSectionMap();

  const { activeSection, moveToSection } = useSectionNavigation();

  return (
    <div className="top-4 left-0 w-screen h-[28px] relative z-20">
      <DocumentNameWrapper />

      <div className="flex gap-2 justify-center items-center">
        <SectionButton
          id="intro"
          name="Intro"
          active={activeSection === "intro"}
          onClick={() => moveToSection("intro")}
        />
        {Object.entries(sectionMap).map(([id, section]) => (
          <SectionButton
            key={id}
            id={id}
            name={section.name}
            active={activeSection === id}
            onClick={() => moveToSection(id)}
          />
        ))}
        <SectionButton
          id="summary"
          name="Summary"
          active={activeSection === "summary"}
          onClick={() => moveToSection("summary")}
        />
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
