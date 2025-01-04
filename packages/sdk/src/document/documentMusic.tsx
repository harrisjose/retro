import { useContext } from "react";
import { useSnapshot } from "valtio";
import { apiClient } from "../../lib/trpc-client.js";
import { DocContext, fetchDocumentMusic } from "./document.js";

export const useDocumentMusic = () => {
  const state = useContext(DocContext);
  const {
    music,
    document: { id },
  } = useSnapshot(state);

  const startMusic = async (musicId: string) => {
    await apiClient.documentMusic.start.mutate({
      documentId: id,
      musicId,
    });
    await fetchDocumentMusic(state);
  };

  const stopMusic = async () => {
    await apiClient.documentMusic.stop.mutate({
      documentId: id,
    });
    await fetchDocumentMusic(state);
  };

  return {
    musicId: music.musicId,
    status: music.status,
    startMusic,
    stopMusic,
  };
};
