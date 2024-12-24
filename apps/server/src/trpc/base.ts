import { initTRPC } from "@trpc/server";
import type { Session, User } from "better-auth";
import type { HonoRequest } from "hono";

export type HonoTrpcContext = {
  req: HonoRequest;
  session: Session | null;
  user: User | null;
};

export const t = initTRPC.context<HonoTrpcContext>().create();

export const publicProcedure = t.procedure;
export const router = t.router;
