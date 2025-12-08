import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

// Register Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((reg) => console.log("Service Worker Registered:", reg))
      .catch((err) => console.error("SW registration failed:", err));
  });

  // Listen for background sync messages
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type === "SYNC_PENDING") {
      console.log("Background Sync:", event.data.message);
      window.dispatchEvent(new Event("SYNC_PENDING"));
    }
  });
}
