import { type Collaborator, cn } from "@retro/common";
import { useCollaborators, useDocument, useSectionMap } from "@retro/sdk";
import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router";
import Back from "../svg/back";
import Link from "../svg/link";
import Tick from "../svg/tick";
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
        "py-1.5 px-3 font-bold text-sm leading-4 bg-[#f1f1f1] rounded-2xl shadow-[0px_0px_1px_0px_#0000004D] cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]",
        active && "bg-white",
      )}
      onClick={onClick}
      title={name}
    >
      {name}
    </a>
  );
};

const DocumentNameWrapper = () => {
  const navigate = useNavigate();
  const { document, renameDocument } = useDocument();
  const [isEditing, setIsEditing] = useState(false);
  const [documentName, setDocumentName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const onBack = () => {
    navigate("/");
  };

  const startEditing = useCallback(() => {
    setIsEditing(true);
    setDocumentName(document.name);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  }, [document.name]);

  const saveDocumentName = useCallback(async () => {
    if (documentName.trim() && documentName !== document.name) {
      try {
        await renameDocument({ id: document.id, name: documentName.trim() });
      } catch (error) {
        console.error("Failed to rename document", error);
        setDocumentName(document.name);
      }
    } else {
      setDocumentName(document.name);
    }
    setIsEditing(false);
  }, [document, documentName, renameDocument]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        saveDocumentName();
      } else if (e.key === "Escape") {
        setIsEditing(false);
        setDocumentName(document.name);
      }
    },
    [document.name, saveDocumentName],
  );

  return (
    <div className="shadow-[0px_0px_1px_0px_rgba(0,0,0,0.34)] pr-[12px] rounded-2xl bg-white absolute left-[24px] top-4 h-full flex items-center max-w-[200px] pointer-events-auto">
      <button
        onClick={onBack}
        className="hover:bg-black/[0.04] pl-[10px] pr-2 h-full rounded-2xl rounded-r-none flex-shrink-0"
      >
        <Back className="w-4 h-4" />
      </button>
      <Separator
        orientation="vertical"
        className="bg-black opacity-5 rounded-sm flex-shrink-0"
      />
      {isEditing ? (
        <input
          ref={inputRef}
          className="pl-2 text-sm bg-transparent outline-none border-none w-full min-w-0"
          value={documentName}
          onChange={(e) => setDocumentName(e.target.value)}
          onBlur={saveDocumentName}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <div
          className="pl-2 text-sm cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap w-full"
          onDoubleClick={startEditing}
        >
          {document.name}
        </div>
      )}
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
    }, 5000);
  }, []);

  return (
    <Button
      variant="outline"
      className={`rounded-full flex gap-1 h-[32px] px-[14px] ${copied ? "bg-[#A618FF] text-primary-foreground hover:bg-[#A618FF] hover:text-primary-foreground" : ""}`}
      onClick={handleCopy}
    >
      {copied ? "Copied!" : "Copy Link"}
      {copied ? <Tick className="w-4 h-4" /> : <Link className="w-4 h-4" />}
    </Button>
  );
};

export default function Topbar() {
  const collaborators = useCollaborators();
  const { sections: sectionMap } = useSectionMap();

  const { activeSection, moveToSection } = useSectionNavigation();

  return (
    <div className="w-screen h-[28px] relative z-20 px-4 pointer-events-none">
      <DocumentNameWrapper />

      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 items-center h-full pointer-events-auto">
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

      <div className="absolute right-4 top-4 h-full flex gap-2 items-center pointer-events-auto">
        <div className="w-fit">
          <CollaboratorAvatars
            collaborators={collaborators as Collaborator[]}
          />
        </div>
        <CopyLinkButton />
      </div>
    </div>
  );
}
