import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { registerManifestPlugins } from "./plugins/registerManifestPlugins";
import { registerBuiltInWorkloads } from "./workloads";

async function start() {
  registerBuiltInWorkloads();

  // A broken or missing manifest must never stop the shell from starting.
  try {
    const skipped = await registerManifestPlugins(
      `${import.meta.env.BASE_URL}plugins/manifest.json`,
    );
    for (const message of skipped) console.warn(`[plugins] ${message}`);
  } catch (error) {
    console.warn("[plugins] Could not load the plugin manifest:", error);
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
    </StrictMode>,
  );
}

void start();