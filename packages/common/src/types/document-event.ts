export enum MusicEvent {
  Start = "music.start",
  Stop = "music.stop",
}

export enum TimerEvent {
  Start = "timer.start",
  Pause = "timer.pause",
  Resume = "timer.resume",
  Stop = "timer.stop",
  Increment = "timer.increment",
  Decrement = "timer.decrement",
}

export type DocumentEvent = MusicEvent | TimerEvent;

export type DocumentEventData = {
  documentId: string;
  event: DocumentEvent;
  data: any;
};
