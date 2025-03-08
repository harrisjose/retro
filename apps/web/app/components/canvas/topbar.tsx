import { cn } from "@retro/common";
import { useCollaborators, useDocument, useSectionMap } from "@retro/sdk";
import { isNil } from "lodash-es";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import Back from "../svg/back";
import Link from "../svg/link";
import { Button } from "../ui/button";
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

const CopyLinkButton = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  }, []);

  return (
    <Button
      variant="outline"
      className="rounded-full flex gap-1 h-[28px] px-[14px]"
      onClick={handleCopy}
    >
      {copied ? "Copied!" : "Copy Link"}
      <Link className="w-4 h-4" />
    </Button>
  );
};

export default function Topbar() {
  const collaborators = useCollaborators();
  const { sections: sectionMap } = useSectionMap();

  const { activeSection, moveToSection } = useSectionNavigation();

  return (
    <div className="w-screen h-[28px] relative z-20 px-4">
      <div className="absolute left-0 top-4 w-full h-full">
        <DocumentNameWrapper />
      </div>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 items-center h-full">
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
      </div>

      <div className="absolute right-4 top-4 h-full flex gap-2 items-center">
        <div className="w-fit">
          <CollaboratorAvatars
            avatarUrls={collaborators
              .map((c) => c.image)
              .filter((i) => !isNil(i))}
          />
        </div>
        <CopyLinkButton />
      </div>
    </div>
  );
}
