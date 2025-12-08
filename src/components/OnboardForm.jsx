import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { saveOfflineRecord } from "../utils/indexedDb";
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

  // ✔ FINAL SUBMIT
  const finalSubmit = async () => {
    const f = getValues();

    const formData = new FormData();
    formData.append("farmerName", f.farmerName || "");
    formData.append("fatherName", f.fatherName || "");
    formData.append("contact", f.contact || "");
    formData.append("age", f.age || "");
    formData.append("gender", f.gender || "");
    formData.append("state", f.state || "");
    formData.append("district", f.district || "");
    formData.append("village", f.village || "");
    formData.append("landArea", f.landArea || "");
    formData.append("surveyNumber", f.surveyNumber || "");
    formData.append("cropType", f.cropType || "");
    formData.append("irrigationSource", f.irrigationSource || "");
    formData.append("notes", f.notes || "");

    if (photo) formData.append("photo", photo);
    if (aadharCard) formData.append("aadharCard", aadharCard);
    if (agreement) formData.append("agreement", agreement);

    points.forEach((p) => {
      formData.append("latitude[]", p.lat);
      formData.append("longitude[]", p.lng);
    });

    const isOnline = navigator.onLine;

    // ONLINE
    if (isOnline) {
      try {
        const res = await fetch(
          "https://new-survey-zh0e.onrender.com/api/submit",
          { method: "POST", body: formData }
        );

        const text = await res.text();
        console.log("SERVER RESPONSE:", text);

        if (res.ok) {
          alert("🎉 Data Submitted Successfully!");
          return;
        }

        alert("❌ Server error");
      } catch (err) {
        console.log("Online failed, saving offline...");
      }
    }

    // OFFLINE
    await saveOfflineRecord({
      id: Date.now(),
      ...f,
      photo,
      aadharCard,
      agreement,
      points,
      createdAt: new Date().toISOString(),
    });

    alert("📴 Offline — data saved locally!");
  };

  // ----------------------------
  // STEP TITLE
  // ----------------------------
  const stepTitles = {
    1: "Farmer Information",
    2: "Upload Documents",
    3: "Capture Boundary",
    4: "Review & Submit",
  };

  return (
    <div className="form-wrapper">
      <h2 className="title">🌾 Farmer Onboarding</h2>

     {/* ---------------- PROGRESS BOXES ---------------- */}
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

      {/* -------------------------------------------------- */}
      {/* STEP 1 - FARMER INFORMATION                       */}
      {/* -------------------------------------------------- */}
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

      {/* -------------------------------------------------- */}
      {/* STEP 2 - UPLOAD DOCUMENTS                         */}
      {/* -------------------------------------------------- */}
      {currentStep === 2 && (
        <div className="section-box">
          <h3 className="section-title">Upload Documents</h3>

          <div className="field">
            <label>Farmer Photo</label>
            <input type="file" onChange={(e) => setPhoto(e.target.files[0])} />
          </div>

          <div className="field">
            <label>Aadhar Card</label>
            <input type="file" onChange={(e) => setAadharCard(e.target.files[0])} />
          </div>

          <div className="field">
            <label>Agreement Letter</label>
            <input type="file" onChange={(e) => setAgreement(e.target.files[0])} />
          </div>

          <div className="step-buttons">
            <button className="submit-btn" onClick={goBack}>← Back</button>
            <button className="submit-btn" onClick={goNext}>Save & Next →</button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* STEP 3 - MAP CAPTURE                              */}
      {/* -------------------------------------------------- */}
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

      {/* -------------------------------------------------- */}
      {/* STEP 4 - FINAL SUBMIT                             */}
      {/* -------------------------------------------------- */}
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
