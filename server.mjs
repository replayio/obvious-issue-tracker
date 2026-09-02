// Zero-dependency static server for the production build with a same-origin
// Replay QA session proxy. Use it in place of a plain static file server at deploy
// time so the POST /api/replay-qa-session route exists:
//
//   npm run build
//   REPLAY_QA_SESSION_TOKEN=<token> npm run serve    # PORT overrides 8080

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const DIST_DIR = join(fileURLToPath(new URL(".", import.meta.url)), "dist");
const PORT = process.env.PORT || 8080;
const REGISTER_URL = "https://qa.replay.io/api/project-session/register";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".map": "application/json",
};

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

async function readRequestBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

// Forwards the FullStory session URL and bounded network capture to Replay QA.
// The registration token lives only in the server environment, never in the client.
async function handleSessionProxy(req, res) {
  if (!process.env.REPLAY_QA_SESSION_TOKEN) {
    sendJson(res, 500, { error: "REPLAY_QA_SESSION_TOKEN is not configured on the server" });
    return;
  }
  try {
    const body = await readRequestBody(req);
    const upstream = await fetch(REGISTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REPLAY_QA_SESSION_TOKEN}`,
        "Content-Type": "application/json",
      },
      body,
    });
    const text = await upstream.text();
    res.statusCode = upstream.status;
    res.setHeader(
      "Content-Type",
      upstream.headers.get("content-type") ?? "application/json; charset=utf-8",
    );
    res.end(text);
  } catch (error) {
    console.error("Replay QA session proxy failed:", error);
    sendJson(res, 502, { error: "Replay QA session proxy failed" });
  }
}

async function serveStatic(pathname, req, res) {
  const relative = decodeURIComponent(pathname).replace(/^\/+/, "");
  let filePath = resolve(DIST_DIR, relative);
  // Keep requests inside dist/; anything else falls back to the SPA entry.
  if (filePath !== DIST_DIR && !filePath.startsWith(DIST_DIR + sep)) {
    filePath = join(DIST_DIR, "index.html");
  }
  let data;
  try {
    const stats = await stat(filePath);
    if (stats.isDirectory()) throw new Error("directory");
    data = await readFile(filePath);
  } catch {
    // SPA fallback: non-file GETs serve index.html. Reassign filePath so the
    // Content-Type below is computed from the file actually served.
    filePath = join(DIST_DIR, "index.html");
    try {
      data = await readFile(filePath);
    } catch {
      sendJson(res, 404, { error: "dist/index.html not found — run npm run build first" });
      return;
    }
  }
  const dot = filePath.lastIndexOf(".");
  const ext = dot === -1 ? "" : filePath.slice(dot);
  res.statusCode = 200;
  res.setHeader("Content-Type", MIME_TYPES[ext] ?? "application/octet-stream");
  res.setHeader(
    "Cache-Control",
    filePath.endsWith("index.html") ? "no-cache" : "public, max-age=3600",
  );
  res.end(req.method === "HEAD" ? undefined : data);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  if (url.pathname === "/api/replay-qa-session") {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      sendJson(res, 405, { error: "Method not allowed" });
      return;
    }
    await handleSessionProxy(req, res);
    return;
  }
  if (req.method !== "GET" && req.method !== "HEAD") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }
  await serveStatic(url.pathname, req, res);
});

server.listen(PORT, () => {
  console.log(`Issue tracker listening on http://localhost:${PORT}`);
  console.log(
    `Replay QA session proxy: REPLAY_QA_SESSION_TOKEN ${
      process.env.REPLAY_QA_SESSION_TOKEN ? "configured" : "NOT configured (sessions will not register)"
    }`,
  );
});
