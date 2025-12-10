// src/components/OnboardForm.jsx
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { saveOfflineRecord } from "../utils/offline";
import MapCapture from "./MapCapture";
import "./OnboardForm.css";

export default function OnboardForm() {
  const { register, getValues } = useForm();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [points, setPoints] = useState([]);
  const [area, setArea] = useState(0);
  const [polygonSaved, setPolygonSaved] = useState(false);

  const [photo, setPhoto] = useState(null);
  const [agreement, setAgreement] = useState(null);
  const [aadharCard, setAadharCard] = useState(null);

  const goNext = () => setCurrentStep((s) => Math.min(totalSteps, s + 1));
  const goBack = () => setCurrentStep((s) => Math.max(1, s - 1));

  // helper to build FormData from current form values
  const buildFormData = (f) => {
    const fd = new FormData();
    fd.append("farmerName", f.farmerName || "");
    fd.append("fatherName", f.fatherName || "");
    fd.append("contact", f.contact || "");
    fd.append("age", f.age || "");
    fd.append("gender", f.gender || "");
    fd.append("state", f.state || "");
    fd.append("district", f.district || "");
    fd.append("village", f.village || "");
    fd.append("landArea", f.landArea || "");
    fd.append("surveyNumber", f.surveyNumber || "");
    fd.append("cropType", f.cropType || "");
    fd.append("irrigationSource", f.irrigationSource || "");
    fd.append("notes", f.notes || "");

    if (photo) fd.append("photo", photo);
    if (aadharCard) fd.append("aadharCard", aadharCard);
    if (agreement) fd.append("agreement", agreement);

    points.forEach((p) => {
      fd.append("latitude[]", p.lat);
      fd.append("longitude[]", p.lng);
    });

    return fd;
  };
const finalSubmit = async () => {
  const f = getValues();
  const fd = buildFormData(f);

  if (navigator.onLine) {
    try {
      const res = await fetch("https://new-survey-zh0e.onrender.com/api/submit", {
        method: "POST",
        body: fd,
      });

      if (res.ok) {
        alert("✅ Submitted Successfully!");
        return;
      }
    } catch (err) {
      console.log("Online failed, saving offline…");
    }
  }

  // FINAL OFFLINE FORMAT
  const record = {
    id: Date.now().toString(),
    formFields: {
      farmerName: f.farmerName || "",
      fatherName: f.fatherName || "",
      contact: f.contact || "",
      age: f.age || "",
      gender: f.gender || "",
      state: f.state || "",
      district: f.district || "",
      village: f.village || "",
      landArea: f.landArea || "",
      surveyNumber: f.surveyNumber || "",
      cropType: f.cropType || "",
      irrigationSource: f.irrigationSource || "",
      notes: f.notes || "",
    },
    photo,
    aadharCard,
    agreement,
    points,
  };

  await saveOfflineRecord(record);
  alert("📴 Offline — Saved Locally!");
};

  // optional: listen to messages from SW (sync status)
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (!event.data) return;
      const data = event.data;
      if (data.type === "SYNC_SUCCESS") {
        // you can refresh pending list or show toast
        console.log("Sync success for id:", data.id);
      }
    });
  }, []);

  // UI omitted for brevity — your existing markup remains; using the same handlers
  // I'll return the same JSX structure you had, just using the new finalSubmit handler.

  const stepTitles = {
    1: "Farmer Information",
    2: "Upload Documents",
    3: "Capture Boundary",
    4: "Review & Submit",
  };

  return (
    <div className="form-wrapper">
      <h2 className="title">🌾 Farmer Onboarding</h2>

      <div className="progress-container">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`progress-step ${currentStep >= step ? "active" : ""}`}
          >
            {step}
          </div>
        ))}
      </div>

      <h3 className="step-heading">
        Step {currentStep} / {totalSteps}: {stepTitles[currentStep]}
      </h3>

      {currentStep === 1 && (
        <div className="section-box">
          <h3 className="section-title">Farmer Information</h3>

          <div className="fields-grid">
            <div className="field">
              <label>Farmer Name</label>
              <input {...register("farmerName")} />
            </div>

            <div className="field">
              <label>Father Name</label>
              <input {...register("fatherName")} />
            </div>

            <div className="field">
              <label>Contact</label>
              <input {...register("contact")} />
            </div>

            <div className="field">
              <label>Age</label>
              <input type="number" {...register("age")} />
            </div>

            <div className="field">
              <label>Gender</label>
              <select {...register("gender")}>
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>

            <div className="field">
              <label>State</label>
              <input {...register("state")} />
            </div>

            <div className="field">
              <label>District</label>
              <input {...register("district")} />
            </div>

            <div className="field">
              <label>Village</label>
              <input {...register("village")} />
            </div>

            <div className="field">
              <label>Land Area</label>
              <input type="number" {...register("landArea")} />
            </div>

            <div className="field">
              <label>Survey Number</label>
              <input {...register("surveyNumber")} />
            </div>

            <div className="field">
              <label>Crop Type</label>
              <input {...register("cropType")} />
            </div>

            <div className="field">
              <label>Irrigation Source</label>
              <input {...register("irrigationSource")} />
            </div>

            <div className="field full-width">
              <label>Notes</label>
              <textarea {...register("notes")} />
            </div>
          </div>

          <button className="submit-btn" onClick={goNext}>
            Save & Next →
          </button>
        </div>
      )}

      {currentStep === 2 && (
        <div className="section-box">
          <h3 className="section-title">Upload Documents</h3>

          <div className="field">
            <label>Farmer Photo</label>
            <input type="file" onChange={(e) => setPhoto(e.target.files[0] || null)} />
          </div>

          <div className="field">
            <label>Aadhar Card</label>
            <input type="file" onChange={(e) => setAadharCard(e.target.files[0] || null)} />
          </div>

          <div className="field">
            <label>Agreement Letter</label>
            <input type="file" onChange={(e) => setAgreement(e.target.files[0] || null)} />
          </div>

          <div className="step-buttons">
            <button className="submit-btn" onClick={goBack}>← Back</button>
            <button className="submit-btn" onClick={goNext}>Save & Next →</button>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="section-box">
          <h3 className="section-title">Capture Boundary</h3>

          <MapCapture
            points={points}
            setPoints={setPoints}
            area={area}
            setArea={setArea}
            polygonSaved={polygonSaved}
            setPolygonSaved={setPolygonSaved}
          />

          <div className="step-buttons">
            <button className="submit-btn" onClick={goBack}>← Back</button>
            <button className="submit-btn" onClick={goNext}>Save & Next →</button>
          </div>
        </div>
      )}

      {currentStep === 4 && (
        <div className="section-box">
          <h3 className="section-title">Final Submit</h3>

          <button className="submit-btn" onClick={finalSubmit}>
            ✔ Submit All Data
          </button>

          <button className="submit-btn" onClick={goBack} style={{ marginTop: 10 }}>
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}
