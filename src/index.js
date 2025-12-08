import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import "./index.css";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);


// Register Service Worker
serviceWorkerRegistration.register({
  onUpdate: (reg) => {
    console.log("Service worker update found!", reg);
  },
});

// Listen For Sync Messages
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type === "SYNC_PENDING") {
      console.log("Background Sync Triggered: ", event.data.message);

      // Trigger your UI update event
      window.dispatchEvent(new Event("SYNC_PENDING"));
    }
  });
}
