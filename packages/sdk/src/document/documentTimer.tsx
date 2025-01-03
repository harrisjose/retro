import { derive } from "derive-valtio";
import { isNull } from "lodash-es";
import { useContext } from "react";
import { useSnapshot } from "valtio";
import { apiClient } from "../../lib/trpc-client.js";
import { DocContext, fetchDocumentTimer } from "./document.js";

export const useDocumentTimer = () => {
  const state = useContext(DocContext);
  const {
    timer,
    document: { id },
  } = useSnapshot(state);

  const startTimer = async (numberOfSeconds: number) => {
    await apiClient.documentTimer.start.mutate({
      documentId: id,
      numberOfSeconds,
    });
    await fetchDocumentTimer(state);
  };

  const pauseTimer = async () => {
    await apiClient.documentTimer.pause.mutate({
      documentId: id,
    });
    await fetchDocumentTimer(state);
  };

  const stopTimer = async () => {
    await apiClient.documentTimer.stop.mutate({
      documentId: id,
    });
    await fetchDocumentTimer(state);
  };

  const resumeTimer = async () => {
    await apiClient.documentTimer.resume.mutate({
      documentId: id,
    });
    await fetchDocumentTimer(state);
  };

  const incrementTimer = async (numberOfSeconds: number) => {
    await apiClient.documentTimer.incrementTimer.mutate({
      documentId: id,
      numberOfSeconds,
    });
    await fetchDocumentTimer(state);
  };

  const decrementTimer = async (numberOfSeconds: number) => {
    await apiClient.documentTimer.decrementTimer.mutate({
      documentId: id,
      numberOfSeconds,
    });
    await fetchDocumentTimer(state);
  };

  const resetTimer = () => {
    state.timer.startTime = null;
    state.timer.endTime = null;
    state.timer.pausedAt = null;
  };

  const derivedState = derive({
    status: (get) => {
      const { timer } = get(state);
      if (timer.startTime && timer.pausedAt) {
        return "paused";
      }
      if (timer.startTime && timer.endTime && isNull(timer.pausedAt)) {
        return "active";
      }
      return "inactive";
    },
  });

  return {
    startTime: timer.startTime,
    endTime: timer.endTime,
    pausedAt: timer.pausedAt,
    startTimer,
    pauseTimer,
    stopTimer,
    resumeTimer,
    incrementTimer,
    decrementTimer,
    resetTimer,
    status: derivedState.status,
  };
};
