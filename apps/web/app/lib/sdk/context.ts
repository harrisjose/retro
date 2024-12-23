import { createContext } from "react";
import { type Profile } from "./profile";

export const SDKContext = createContext({
  profile: {} as Profile,
});
