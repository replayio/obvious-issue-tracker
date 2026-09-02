// Side-effect import must come first: it installs the Replay QA fetch-capture shim
// before the application renders. A complete no-op unless the build sets
// VITE_FULLSTORY_ORG_ID (see .env.production).
import "./lib/replay-qa-session";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
