import { isNull } from "lodash-es";
import { createContext, useContext, useEffect, useRef } from "react";
import { proxy, useSnapshot } from "valtio";
import { apiClient } from "../lib/trpc-client.js";

export type Timer = {
  startTime: string | null;
  endTime: string | null;
  pausedAt: string | null;
};

export enum MusicStatus {
  Active = "active",
  Inactive = "inactive",
}

export type Music = {
  musicId: string | null;
  status: MusicStatus;
};

export type MusicTimerState = {
  documentId: string | null;
  timer: Timer;
  music: Music;
};

export const MusicTimerContext = createContext<MusicTimerState>({} as any);

const resetTimer = (state: MusicTimerState) => {
  state.timer.startTime = null;
  state.timer.endTime = null;
  state.timer.pausedAt = null;
};

const setTimer = (state: MusicTimerState, timer: Timer | null | undefined) => {
  // Timer could be null/undefined if the timer was stopped
  state.timer.startTime = timer?.startTime ?? null;
  state.timer.endTime = timer?.endTime ?? null;
  state.timer.pausedAt = timer?.pausedAt ?? null;
};

const setMusic = (state: MusicTimerState, music: Music | null | undefined) => {
  state.music.musicId = music?.musicId ?? null;
  state.music.status = (music?.status as MusicStatus) ?? MusicStatus.Inactive;
};

const fetchDocumentTimer = async (state: MusicTimerState) => {
  const timer = await apiClient.documentTimer.get.query({
    documentId: state.documentId!,
  });

  setTimer(state, timer);
};

const fetchDocumentMusic = async (state: MusicTimerState) => {
  const music = await apiClient.documentMusic.get.query({
    documentId: state.documentId!,
  });

  setMusic(state, music);
};

const subscribeToTimer = (state: MusicTimerState) => {
  const subscription = apiClient.documentTimer.onTimerChange.subscribe(
    { documentId: state.documentId! },
    {
      onData: (data) => {
        const timer = ((data as any) ?? {}) as Timer;
        setTimer(state, timer);
      },
    }
  );
  return () => subscription.unsubscribe();
};

const subscribeToMusic = (state: MusicTimerState) => {
  const subscription = apiClient.documentMusic.onMusicChange.subscribe(
    { documentId: state.documentId! },
    {
      onData: (data) => {
        const music = ((data as any) ?? {}) as Music;
        setMusic(state, music);
      },
    }
  );
  return () => subscription.unsubscribe();
};

const useDocumentTimerSync = (state: MusicTimerState) => {
  useEffect(() => {
    fetchDocumentTimer(state);
    const unsubscribe = subscribeToTimer(state);
    return () => unsubscribe();
  }, []);
};

const useDocumentMusicSync = (state: MusicTimerState) => {
  useEffect(() => {
    fetchDocumentMusic(state);
    const unsubscribe = subscribeToMusic(state);
    return () => unsubscribe();
  }, []);
};

export const MusicTimerProvider = ({
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
      music: {
        musicId: null,
        status: MusicStatus.Inactive,
      },
    })
  ).current;

  useDocumentTimerSync(state);
  useDocumentMusicSync(state);
  return (
    <MusicTimerContext.Provider value={state}>
      {children}
    </MusicTimerContext.Provider>
  );
};

export const useDocumentTimer = () => {
  const state = useContext(MusicTimerContext);
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
  };

  const pauseTimer = async () => {
    await apiClient.documentTimer.pause.mutate({
      documentId,
    });
  };

  const stopTimer = async () => {
    await apiClient.documentTimer.stop.mutate({
      documentId,
    });
  };

  const resumeTimer = async () => {
    await apiClient.documentTimer.resume.mutate({
      documentId,
    });
  };

  const incrementTimer = async (numberOfSeconds: number) => {
    await apiClient.documentTimer.incrementTimer.mutate({
      documentId,
      numberOfSeconds,
    });
  };

  const decrementTimer = async (numberOfSeconds: number) => {
    await apiClient.documentTimer.decrementTimer.mutate({
      documentId,
      numberOfSeconds,
    });
  };

  const status = (() => {
    if (timer.startTime && timer.pausedAt) {
      return "paused";
    }
    if (timer.startTime && timer.endTime && isNull(timer.pausedAt)) {
      return "active";
    }
    return "inactive";
  })();

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
    resetTimer: () => resetTimer(state),
    status,
  };
};

export const useDocumentMusic = () => {
  const state = useContext(MusicTimerContext);
  const snap = useSnapshot(state);
  const music = snap.music;
  const documentId = snap.documentId!;

  const startMusic = async (musicId: string) => {
    await apiClient.documentMusic.start.mutate({
      documentId,
      musicId,
    });
  };

  const stopMusic = async () => {
    await apiClient.documentMusic.stop.mutate({
      documentId,
    });
  };

  return {
    musicId: music.musicId,
    status: music.status,
    startMusic,
    stopMusic,
  };
};
