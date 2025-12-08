import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import OnboardForm from "./components/OnboardForm";
import Help from "./components/Help";

import { getPending } from "./utils/indexedDb";

function App() {
  const [pending, setPending] = useState([]);

  useEffect(() => {
    refreshPending();

    function onOnline() {
      refreshPending();
    }

    function onSyncMsg() {
      refreshPending();
    }

    window.addEventListener("online", onOnline);
    window.addEventListener("SYNC_PENDING", onSyncMsg);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("SYNC_PENDING", onSyncMsg);
    };
  }, []);

  async function refreshPending() {
    const p = await getPending();
    setPending(p || []);
  }

  return (
    <Router>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={
            <div className="main-container">
              <div className="form-card">
                <h2>Farmer Registration Form</h2>
                <p className="status">
                  Status: {navigator.onLine ? "Online" : "Offline"}
                </p>

                <OnboardForm onSaved={refreshPending} />
              </div>

              <div className="pending-section">
                <h3>Pending Submissions</h3>

                {pending.length === 0 ? (
                  <p>No pending records</p>
                ) : (
                  <ul>
                    {pending.map((item) => (
                      <li key={item.id}>
                        <strong>{item.farmerName}</strong> —{" "}
                        {item.points?.length || 0} points — {item.status}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          }
        />

        <Route path="/help" element={<Help />} />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
