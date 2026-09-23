import { createServer, type IncomingMessage } from "node:http";
import { pathToFileURL } from "node:url";
import { analyze, ServiceError } from "./analysis";

async function readBody(req: IncomingMessage) {
  let size = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of req.iterator({ destroyOnReturn: false })) {
    size += chunk.length;
    if (size > 13_000_000) {
      req.resume();
      throw new ServiceError(
        413,
        "Photos are too large. Please choose smaller images.",
      );
    }
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString());
  } catch {
    throw new ServiceError(400, "Request body must be valid JSON.");
  }
}
export function createApp(
  options: {
    apiKey?: string;
    model?: string;
    fetchImpl?: typeof fetch;
    production?: boolean;
    allowedOrigins?: string[];
    token?: string;
  } = {},
) {
  const rates = new Map<string, { count: number; until: number }>();
  let active = 0;
  return createServer(async (req, res) => {
    const origin = req.headers.origin;
    const allowed = options.allowedOrigins || [
      "http://localhost:8081",
      "http://localhost:8082",
      "http://127.0.0.1:8081",
      "http://127.0.0.1:8082",
    ];
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    const send = (status: number, data: object) => {
      if (res.destroyed || res.writableEnded) return;
      res.writeHead(status, { "Content-Type": "application/json" });
      res.end(JSON.stringify(data));
    };
    if (origin && !allowed.includes(origin)) {
      send(403, { error: "This app origin is not allowed." });
      return;
    }
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
    }
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }
    if (req.url === "/api/status" && req.method === "GET") {
      send(200, { configured: !!options.apiKey });
      return;
    }
    if (req.url !== "/api/analyze" || req.method !== "POST") {
      send(404, { error: "Not found." });
      return;
    }
    if (options.production && !options.token) {
      send(503, { error: "Production access control must be configured." });
      return;
    }
    if (
      options.token &&
      req.headers.authorization !== `Bearer ${options.token}`
    ) {
      send(401, {
        error: "Server access token required. Add it in Connection settings.",
      });
      return;
    }
    if (!req.headers["content-type"]?.startsWith("application/json")) {
      send(415, { error: "Use application/json." });
      return;
    }
    const now = Date.now();
    for (const [key, entry] of rates) if (entry.until < now) rates.delete(key);
    const ip = req.socket.remoteAddress || "unknown";
    const rate = rates.get(ip) || { count: 0, until: now + 60_000 };
    if (rate.count >= 10 || active >= 4) {
      send(429, {
        error: "Too many requests. Please wait a minute and retry.",
      });
      return;
    }
    rate.count += 1;
    rates.set(ip, rate);
    active += 1;
    const cancellation = new AbortController();
    res.on("close", () => {
      if (!res.writableEnded) cancellation.abort();
    });
    try {
      send(200, {
        result: await analyze(await readBody(req), {
          ...options,
          signal: cancellation.signal,
        }),
      });
    } catch (error) {
      send(error instanceof ServiceError ? error.status : 500, {
        error:
          error instanceof ServiceError
            ? error.message
            : "Unable to complete analysis.",
      });
    } finally {
      active -= 1;
    }
  });
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const port = Number(process.env.API_PORT || 8787);
  const app = createApp({
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL,
    production: process.env.NODE_ENV === "production",
    token: process.env.API_ACCESS_TOKEN,
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",").map((s) =>
      s.trim(),
    ),
  });
  app.requestTimeout = 60_000;
  app.listen(port, process.env.API_HOST || "127.0.0.1", () =>
    console.log(
      `Pet Health API listening on port ${port}; AI ${process.env.OPENAI_API_KEY ? "configured" : "not configured"}.`,
    ),
  );
}
