// Replay QA session capture (FullStory).
//
// Imported first from main.tsx so the window.fetch capture shim is installed before
// the application renders. The whole module is gated on the build-time env
// VITE_FULLSTORY_ORG_ID (set only in .env.production): when it is absent this module
// is a complete no-op — no fetch wrapping, no network, and no SDK load (the FullStory
// SDK is imported dynamically inside the gate so dev bundles never download it).
//
// See the README "FullStory session capture" section for the full picture.

const MAX_BODY_BYTES = 1_000_000;
const MAX_CAPTURE_BYTES = 8_000_000;

type CapturedExchange = {
  source_timestamp: number;
  method: string;
  url: string;
  status: number;
  request_headers: Record<string, string>;
  request_body: string | null;
  response_headers: Record<string, string>;
  response_body: string | null;
  startup_body?: ArrayBuffer;
  status_text?: string;
};

const nativeFetch = window.fetch.bind(window);
const capturedExchanges: CapturedExchange[] = [];
let fullStoryReady = false;
let fullStorySessionUrl: string | null = null;
let syntheticExchange: CapturedExchange | null = null;
let uploadTimer: ReturnType<typeof setTimeout> | null = null;
let uploadChain: Promise<void> = Promise.resolve();
let capturedBytes = 0;

async function boundedBody(value: Request | Response): Promise<string | null> {
  const bytes = await value.clone().arrayBuffer();
  if (bytes.byteLength > MAX_BODY_BYTES) return null;
  return new TextDecoder().decode(bytes);
}

function queueCaptureUpload(): Promise<void> {
  const sessionUrl = fullStorySessionUrl;
  if (!sessionUrl) return Promise.resolve();
  const exchanges = capturedExchanges
    .map((item) => ({
      source_timestamp: item.source_timestamp,
      method: item.method,
      url: item.url,
      status: item.status,
      request_headers: item.request_headers,
      request_body: item.request_body,
      response_headers: item.response_headers,
      response_body: item.response_body,
    }))
    .sort((a, b) => a.source_timestamp - b.source_timestamp);
  const payload = {
    session_url: sessionUrl,
    ...(exchanges.length
      ? {
          auxiliary_data: {
            namespace: "network",
            key: "captured-exchanges",
            schema_version: 1,
            payload: { version: 1, exchanges },
          },
        }
      : {}),
  };
  // Serialize uploads so an older, shorter snapshot can never overwrite a newer one.
  uploadChain = uploadChain
    .then(async () => {
      const response = await nativeFetch("/api/replay-qa-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok && response.status !== 409) {
        throw new Error(`Replay QA session upload failed: ${response.status}`);
      }
    })
    .catch((error: unknown) => console.error(error));
  return uploadChain;
}

function uploadCapture(): void {
  if (!fullStorySessionUrl) return;
  if (uploadTimer) clearTimeout(uploadTimer);
  uploadTimer = setTimeout(() => {
    uploadTimer = null;
    void queueCaptureUpload();
  }, 250);
}

async function replayForFullStory(exchange: CapturedExchange): Promise<void> {
  syntheticExchange = exchange;
  try {
    // FullStory wraps window.fetch after initialization. Its wrapper observes this
    // response, while the shim returns the bytes captured from the original request.
    await window.fetch(exchange.url, {
      method: exchange.method,
      headers: { "x-fs-recapture": "1" },
    });
  } finally {
    syntheticExchange = null;
  }
}

function installCaptureShim(): void {
  window.fetch = async (input, init) => {
    const request = new Request(input, init);
    const synthetic = syntheticExchange;
    if (
      synthetic &&
      request.headers.get("x-fs-recapture") === "1" &&
      request.method === synthetic.method &&
      request.url === synthetic.url
    ) {
      const startupBody = synthetic.startup_body;
      return new Response(
        startupBody && startupBody.byteLength > 0 ? startupBody.slice(0) : null,
        {
          status: synthetic.status,
          statusText: synthetic.status_text,
          headers: synthetic.response_headers,
        },
      );
    }

    const sourceTimestamp = Math.round(performance.now());
    const requestBody =
      request.method !== "GET" && request.method !== "HEAD"
        ? boundedBody(request).catch(() => null)
        : Promise.resolve(null);
    const response = await nativeFetch(request);
    const clone = response.clone();
    const responseBytes = await clone.arrayBuffer().catch(() => null);
    const capturedRequestBody = await requestBody;
    const exchangeBytes =
      (responseBytes?.byteLength ?? 0) +
      new TextEncoder().encode(capturedRequestBody ?? "").byteLength;
    if (capturedBytes + exchangeBytes > MAX_CAPTURE_BYTES) return response;

    const isStartup =
      !fullStoryReady && (request.method === "GET" || request.method === "HEAD");
    const keepStartupBody =
      isStartup &&
      responseBytes !== null &&
      responseBytes.byteLength <= MAX_BODY_BYTES;
    const exchange: CapturedExchange = {
      source_timestamp: sourceTimestamp,
      method: request.method,
      url: request.url,
      status: clone.status,
      request_headers: Object.fromEntries(request.headers.entries()),
      request_body: capturedRequestBody,
      response_headers: Object.fromEntries(clone.headers.entries()),
      response_body:
        responseBytes && responseBytes.byteLength <= MAX_BODY_BYTES
          ? new TextDecoder().decode(responseBytes)
          : null,
      ...(keepStartupBody
        ? { startup_body: responseBytes, status_text: clone.statusText }
        : {}),
    };
    capturedBytes += exchangeBytes;
    capturedExchanges.push(exchange);
    uploadCapture();
    return response;
  };
}

async function bootstrap(orgId: string): Promise<void> {
  // The shim must exist before the app renders and before FullStory wraps fetch.
  installCaptureShim();
  const { init } = await import("@fullstory/browser");
  // Mark ready before registering the session: this flushes any completed startup
  // exchanges, while an in-flight startup request replays itself when its original
  // response arrives.
  init({ orgId }, async ({ sessionUrl }) => {
    fullStorySessionUrl = sessionUrl ?? null;
    fullStoryReady = true;
    for (const exchange of capturedExchanges.filter((item) => item.startup_body)) {
      await replayForFullStory(exchange);
    }
    if (uploadTimer) clearTimeout(uploadTimer);
    uploadTimer = null;
    await queueCaptureUpload();
  });
}

// Build-time gate: VITE_FULLSTORY_ORG_ID exists only in .env.production, so dev
// builds (and any build without it) evaluate nothing but the check below.
const fullStoryOrgId: string | undefined = import.meta.env.VITE_FULLSTORY_ORG_ID;
if (fullStoryOrgId) void bootstrap(fullStoryOrgId);
