import RetroListSkeleton from "@/components/loaders/retro-list-skeleton";
import DueDate from "@/components/svg/duedate";
import Retro from "@/components/svg/retro";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getRelativeTime, getRemainingTime } from "@retro/common";
import { useDocumentCRUD, useDocumentList } from "@retro/sdk";
import { orderBy } from "lodash-es";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import DotMenu from "../svg/dot-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Label } from "../ui/label";
import RetroEmpty from "./retro-empty";

const RenameDialog = ({
  isOpen,
  onOpenChange,
  documentId,
  currentName,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  currentName: string;
}) => {
  const [newName, setNewName] = useState(currentName);
  const [isRenaming, setIsRenaming] = useState(false);
  const { renameDocument } = useDocumentCRUD();

  const handleRename = async () => {
    if (!newName.trim() || newName.trim() === currentName) {
      onOpenChange(false);
      return;
    }

    try {
      setIsRenaming(true);
      await renameDocument({ id: documentId, name: newName.trim() });
      toast.success("Retro renamed successfully!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to rename retro");
    } finally {
      setIsRenaming(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="space-y-4">
          <h2 className="text-lg font-semibold">Rename Retro</h2>
        </DialogHeader>
        <div className="py-4">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter new name"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleRename();
              }
            }}
          />
        </div>
        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            onClick={handleRename}
            disabled={
              isRenaming || !newName.trim() || newName.trim() === currentName
            }
          >
            {isRenaming ? "Renaming..." : "Rename"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const RetroDropdownMenu = ({
  documentId,
  name,
}: { documentId: string; name: string }) => {
  const [open, setOpen] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const { deleteDocument } = useDocumentCRUD();

  const onDeleteDocument = () => {
    deleteDocument({ id: documentId });
    toast.success(`Retro ${name} deleted successfully!`);
  };

  return (
    <>
      <DropdownMenu
        open={open}
        onOpenChange={(value) => {
          setOpen(value);
        }}
      >
        <DropdownMenuTrigger className="cursor-pointer absolute top-[10px] right-[10px] z-20">
          <DotMenu className="rotate-90" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="z-30">
          <DropdownMenuItem onSelect={() => setShowRenameDialog(true)}>
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onDeleteDocument}>
            <Label variant="destructive" className="cursor-pointer">
              Delete
            </Label>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RenameDialog
        isOpen={showRenameDialog}
        onOpenChange={setShowRenameDialog}
        documentId={documentId}
        currentName={name}
      />
    </>
  );
};

const RetroList = () => {
  const { documents, isLoading } = useDocumentList();
  const documentList = useMemo(() => {
    return orderBy(
      Object.values(documents),
      (document) => new Date(document.createdAt),
      "desc",
    );
  }, [documents]);

  if (isLoading) return <RetroListSkeleton />;

  if (documentList.length === 0) return <RetroEmpty />;

  return (
    <ul className="flex gap-4 flex-wrap">
      {documentList.map((document) => {
        const remainingTime = getRemainingTime(new Date(document.endDateTime));
        return (
          <li key={document.id} className="w-[216px] h-[150px] relative">
            <div className="h-full rounded-[10px] bg-white box-shadow-[0px_0px_1px_0px_#0000004D] px-4 py-3 flex flex-col justify-end">
              <Link
                to={`/document/${document.id}`}
                className="absolute inset-0 z-0"
              >
                <span className="sr-only">Open retro {document.name}</span>
              </Link>
              <Retro className="w-[54px] h-[54px] mb-auto relative z-10" />
              <RetroDropdownMenu
                documentId={document.id}
                name={document.name}
              />
              <div className="flex flex-col relative z-10">
                <div className="font-bold">{document.name}</div>
                {/* TODO: @aki check with design and decide on what else we can show */}
                <div className="inline-flex gap-1 items-center text-[10px] leading-[11.64px] text-gray-500">
                  {getRelativeTime(new Date(document.createdAt))}{" "}
                  {remainingTime && (
                    <>
                      <span className="text-black opacity-10">|</span>
                      <DueDate className="text-[#FF8401]" />
                      {remainingTime}
                    </>
                  )}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default RetroList;
