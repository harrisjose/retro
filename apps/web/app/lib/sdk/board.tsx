import { useContext, useEffect } from "react";
import { useInterval } from "usehooks-ts";
import { proxy, useSnapshot } from "valtio";
import { authClient } from "../auth-client";
import { apiClient } from "../trpc-client";
import { SDKContext } from "./context";

export type Board = {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export const boardsStore = proxy<Record<string, Board>>({});

async function fetchBoardsList() {
  const workspaceId = localStorage.getItem("workspaceId");
  if (!workspaceId) return;

  const boards = await apiClient.boards.list.query({ workspaceId });

  boards.forEach((board) => {
    if (board.id in boardsStore) {
      boardsStore[board.id] = {
        ...boardsStore[board.id],
        ...board,
      };
    } else {
      boardsStore[board.id] = {
        ...board,
      };
    }
  });
}

export const useBoardListSync = async () => {
  useEffect(() => {
    fetchBoardsList();
  }, []);
  useInterval(
    () => fetchBoardsList(),
    5 * 60 * 1000 // 5 minutes
  );
};

export const useBoardList = () => {
  const { isPending } = authClient.useSession();

  const { boards } = useContext(SDKContext);
  const snap = useSnapshot(boards);

  return { boards: snap, isLoading: isPending };
};

export const createBoard = async () => {
  const workspaceId = localStorage.getItem("workspaceId");

  try {
    if (!workspaceId) throw new Error("Workspace ID not found");
    const board = await apiClient.boards.create.mutate({
      name: "New board",
      workspaceId,
    });
    boardsStore[board.id] = { ...board };
    return board.id;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create board");
  }
};
