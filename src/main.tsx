import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource-variable/manrope";
import "@fontsource/newsreader/500.css";
import "./index.css";
import { App } from "./App";
import { loadRouteData } from "./context/AppDataContext";

const root = document.getElementById("root")!;
async function start() {
  if (root.dataset.prerendered) {
    try {
      const initialData = await loadRouteData(window.location.pathname);
      const app = (
        <React.StrictMode>
          <App initialData={initialData} />
        </React.StrictMode>
      );
      if (window.location.search) ReactDOM.createRoot(root).render(app);
      else ReactDOM.hydrateRoot(root, app);
      return;
    } catch {
      /* The normal application presents a retry control. */
    }
  }
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
void start();
