import { derive } from "derive-valtio";
import config from "lib/config.js";
import { isNull } from "lodash-es";
import { createContext, useContext, useEffect, useRef } from "react";
import { useInterval } from "usehooks-ts";
import { proxy, useSnapshot } from "valtio";
import { apiClient } from "../lib/trpc-client.js";

export type Timer = {
  startTime: string | null;
  endTime: string | null;
  pausedAt: string | null;
};

export type TimerState = {
  documentId: string | null;
  timer: Timer;
};

export const TimerContext = createContext<TimerState>({} as any);

const fetchDocumentTimer = async (state: TimerState) => {
  const timer = await apiClient.documentTimer.get.query({
    documentId: state.documentId!,
  });

  state.timer.startTime = timer?.startTime ?? null;
  state.timer.endTime = timer?.endTime ?? null;
  state.timer.pausedAt = timer?.pausedAt ?? null;
};

const resetTimer = (state: TimerState) => {
  state.timer.startTime = null;
  state.timer.endTime = null;
  state.timer.pausedAt = null;
};

const useDocumentTimerSync = (state: TimerState) => {
  useEffect(() => {
    fetchDocumentTimer(state);
  }, []);

  useInterval(() => fetchDocumentTimer(state), config.pollingInterval);
};

export const TimerProvider = ({
  documentId,
  children,
}: React.PropsWithChildren<{ documentId: string }>) => {
  const state = useRef(
    proxy({
      documentId,
      timer: {
        startTime: null,
        endTime: null,
        pausedAt: null,
      },
    })
  ).current;

  useDocumentTimerSync(state);

  return (
    <TimerContext.Provider value={state}>{children}</TimerContext.Provider>
  );
};

export const useDocumentTimer = () => {
  const state = useContext(TimerContext);
  const snap = useSnapshot(state);
  const timer = snap.timer;
  const documentId = snap.documentId;

  if (!documentId) {
    throw new Error(
      "Document ID is required. Please wrap your component in a TimerProvider."
    );
  }

  const startTimer = async (numberOfSeconds: number) => {
    await apiClient.documentTimer.start.mutate({
      documentId,
      numberOfSeconds,
    });
    await fetchDocumentTimer(state);
  };

  const pauseTimer = async () => {
    await apiClient.documentTimer.pause.mutate({
      documentId,
    });
    await fetchDocumentTimer(state);
  };

  const stopTimer = async () => {
    await apiClient.documentTimer.stop.mutate({
      documentId,
    });
    await fetchDocumentTimer(state);
  };

  const resumeTimer = async () => {
    await apiClient.documentTimer.resume.mutate({
      documentId,
    });
    await fetchDocumentTimer(state);
  };

  const incrementTimer = async (numberOfSeconds: number) => {
    await apiClient.documentTimer.incrementTimer.mutate({
      documentId,
      numberOfSeconds,
    });
    await fetchDocumentTimer(state);
  };

  const decrementTimer = async (numberOfSeconds: number) => {
    await apiClient.documentTimer.decrementTimer.mutate({
      documentId,
      numberOfSeconds,
    });
    await fetchDocumentTimer(state);
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
