import { initTRPC } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { Session, User } from "better-auth";
import type { HonoRequest } from "hono";
import { auth } from "../lib/auth.js";

export type HonoTrpcContext = {
  req: HonoRequest;
  session: Session | null;
  user: User | null;
};

export const createHonoTrpcContext = async (
  c: FetchCreateContextFnOptions,
): Promise<HonoTrpcContext> => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.headers,
    });
    return {
      req: c.req as any as HonoRequest,
      session: session?.session ?? null,
      user: session?.user ?? null,
    };
  } catch (error) {
    console.error(`Error getting session: ${error}`);
    return {
      req: c.req as any as HonoRequest,
      session: null,
      user: null,
    };
  }
};

export const t = initTRPC.context<HonoTrpcContext>().create({
  sse: {
    ping: {
      enabled: true,
      intervalMs: 30_000,
    },
    client: {
      // Reconnect if no messages or pings are received for 30 seconds
      reconnectAfterInactivityMs: 30_000,
    },
  },
});

export const publicProcedure = t.procedure;
export const router = t.router;
