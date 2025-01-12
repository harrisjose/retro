import { useMultiBlockActions } from "@retro/sdk";
import type { PropsWithChildren } from "react";
import { CanvasControllerContext, canvasController } from "./canvas-controller";

export const CanvasMachineProvider = ({ children }: PropsWithChildren) => {
  const { deleteBlocks } = useMultiBlockActions();
  return (
    <CanvasControllerContext.Provider
      logic={canvasController.provide({
        actions: {
          deleteBlock: (_, params) => {
            deleteBlocks(params.selected);
          },
        },
      })}
    >
      {children}
    </CanvasControllerContext.Provider>
  );
};
