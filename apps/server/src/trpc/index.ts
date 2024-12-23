import { initTRPC } from "@trpc/server";
import type { HonoRequest } from "hono";
import { pick } from "lodash-es";
import { auth } from "../lib/auth.js";

type HonoContext = {
  req: HonoRequest;
};

const t = initTRPC.context<HonoContext>().create();

const publicProcedure = t.procedure;
const router = t.router;

export const appRouter = router({
  profile: publicProcedure.query(async ({ ctx }) => {
    const session = await auth.api.getSession({
      headers: ctx.req.raw.headers,
    });
    if (!session) {
      return null;
    }
    return pick(session.user, ["id", "email", "image", "name"]);
  }),
});

export type AppRouter = typeof appRouter;
