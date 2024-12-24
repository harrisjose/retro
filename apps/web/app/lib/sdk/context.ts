import { createContext } from "react";
import type { Board } from "./board";
import { type Profile } from "./profile";

export const SDKContext = createContext({
  profile: {} as Profile,
  boards: {} as Record<string, Board>,
});
