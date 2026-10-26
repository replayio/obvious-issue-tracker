import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { initSelfHealingCapture } from "@/lib/capture";
import { setCanonicalHref } from "@/lib/canonical";

// Declares the canonical URL for this document before first render; routing
// is hash-based, so the document path never changes afterwards.
setCanonicalHref(window.location.pathname);

// Production-only; no-op in dev. Before the first render so capture sees the whole session.
initSelfHealingCapture();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
