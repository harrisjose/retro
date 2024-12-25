import { Logger } from "@hocuspocus/extension-logger";
import { Hocuspocus } from "@hocuspocus/server";
import type { HttpBindings } from "@hono/node-server";
import type { Context, Hono, Next } from "hono";
import type { IncomingMessage } from "http";
import type { Server } from "node:http";
import type { Http2SecureServer, Http2Server } from "node:http2";
import type { WebSocket } from "ws";
import { WebSocketServer } from "ws";

const hocuspocus = new Hocuspocus({
  name: "collab-server",
  debounce: 5000,
  extensions: [new Logger()],
  // async onAuthenticate(data) {
  //   const session = await auth.api.getSession({
  //     headers: data.context.req.headers,
  //   });
  //   if (!session) {
  //     data.connection.readOnly = true;
  //   }
  // },
});

const wss = new WebSocketServer({ noServer: true });
const waiter = new Map<IncomingMessage, (ws: WebSocket) => void>();

wss.on("connection", (ws: WebSocket, request: IncomingMessage) => {
  const resolver = waiter.get(request);
  if (resolver) {
    resolver(ws);
    waiter.delete(request);
  }
});

const nodeUpgradeWebSocket = (request: IncomingMessage) => {
  return new Promise<WebSocket>((resolve) => {
    waiter.set(request, resolve);
  });
};

export const collabHandler = async (c: Context, next: Next) => {
  if (c.req.header("upgrade")?.toLowerCase() !== "websocket") {
    await next();
    return;
  }

  (async () => {
    const ws = await nodeUpgradeWebSocket(c.env.incoming);

    hocuspocus.handleConnection(ws, c.env.incoming, {
      req: c.req,
    });
  })();

  return new Response();
};

export function withCollab<T extends Server | Http2Server | Http2SecureServer>(
  server: T,
  config: { app: Hono<{ Bindings: HttpBindings }>; baseUrl: string }
): T {
  server.on("upgrade", async (request, socket, head) => {
    const url = new URL(
      request.url ?? "/",
      config.baseUrl ?? "http://localhost"
    );
    const headers = new Headers();
    for (const key in request.headers) {
      const value = request.headers[key];
      if (!value) {
        continue;
      }
      headers.append(key, Array.isArray(value) ? value[0] : value);
    }
    await config.app.request(
      url,
      { headers: headers },
      { incoming: request, outgoing: undefined }
    );
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  });

  return server;
}
