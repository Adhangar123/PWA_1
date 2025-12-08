// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

// Register Service Worker (CRA Compatible)
serviceWorkerRegistration.register({
  onUpdate: (reg) => {
    console.log("SW update detected!", reg);
  },
});

// Listen For SW → Client Messages
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type === "SYNC_PENDING") {
      console.log("⏳ Background Sync Triggered", event.data.message);

      // Trigger event to refresh pending list
      window.dispatchEvent(new Event("SYNC_PENDING"));
    }
  });
}
