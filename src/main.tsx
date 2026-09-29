import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { initSelfHealingCapture } from "@/lib/capture";

// Production-only; no-op in dev. Before the first render so capture sees the whole session.
initSelfHealingCapture();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
