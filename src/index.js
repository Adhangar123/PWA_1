import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((reg) => console.log("Service Worker Registered:", reg))
      .catch((err) => console.error("SW registration failed:", err));
  });

  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type === "SYNC_SUCCESS") {
      console.log("Background Sync Success:", event.data.id);
    }
  });
}
