import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Country, State, City } from "country-state-city"; 
import { saveOfflineRecord } from "../utils/offline";
import MapCapture from "./MapCapture";
import "./OnboardForm.css";

export default function OnboardForm() {
  const { register, getValues, setValue, formState: { errors }, trigger } = useForm({
    mode: "onChange", 
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedStep, setCompletedStep] = useState(1);
  const totalSteps = 4;

  const [points, setPoints] = useState([]);
  const [area, setArea] = useState(0);
  const [polygonSaved, setPolygonSaved] = useState(false);

  const [farmerPhoto, setFarmerPhoto] = useState(null);
  const [farmerID, setFarmerID] = useState(null);
  const [agreement, setAgreement] = useState(null);

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedState, setSelectedState] = useState("");

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  useEffect(() => {
    const indianStates = State.getStatesOfCountry("IN");
    setStates(indianStates);
  }, []);

  useEffect(() => {
    if (selectedState) {
      const distList = City.getCitiesOfState("IN", selectedState);
      setDistricts(distList);
    }
  }, [selectedState]);

  const goNext = async () => {
    const valid = await trigger();
    if (!valid) return; 
    setCompletedStep((prev) => Math.max(prev, currentStep + 1));
    setCurrentStep((s) => Math.min(totalSteps, s + 1));
  };

  const goBack = () => setCurrentStep((s) => Math.max(1, s - 1));
const finalSubmit = async () => {
  setIsSubmitting(true);

  try {
    const f = getValues();
    const formData = new FormData();

    // -------- FORM DATA --------
    formData.append("projectName", f.projectName || "");
    formData.append("interventionAreaType", f.interventionType || "");
    formData.append("surveyDate", f.surveyDate || "");
    formData.append("interviewerName", f.interviewerName || "");

    formData.append("state", f.state || "");
    formData.append("district", f.district || "");
    formData.append("village", f.village || "");
    formData.append("block", f.block || "");
    formData.append("grampanchayat", f.gramPanchayat || "");

    formData.append("farmerName", f.farmerName || "");
    formData.append("contact", f.contact || "");
    formData.append("gender", f.gender || "");
    formData.append("khata_num", f.khataNumber || "");
    formData.append("plot_num", f.plotNumber || "");

    formData.append("latitude", latitude || "");
    formData.append("longitude", longitude || "");

    points.forEach((p, i) => {
      formData.append(`points[${i}][lat]`, p.lat);
      formData.append(`points[${i}][lng]`, p.lng);
    });

    formData.append("polygonSaved", polygonSaved ? "true" : "false");
    formData.append("area", area || 0);

    if (farmerPhoto) formData.append("photo", farmerPhoto);
    if (farmerID) formData.append("aadharCard", farmerID);
    if (agreement) formData.append("agreement", agreement);

    // 🚨 ONLY OFFLINE CASE
    if (!navigator.onLine) {
      await saveOfflineRecord({
        id: Date.now(),
        ...f,
        farmerPhoto,
        farmerID,
        agreement,
        points,
        polygonSaved,
        area,
        latitude,
        longitude,
        createdAt: new Date().toISOString(),
      });

      alert("📴 No Internet — Data saved locally!");
      return;
    }

    // 🌐 ONLINE CASE
    const res = await fetch(
      "https://backend-survey-13977221722.asia-south2.run.app/api/submit",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) {
      const msg = await res.text();
      console.error("Server Error:", msg);
      alert("❌ Server error! Please try again.");
      return;
    }

    // ✅ SUCCESS
    alert("🎉 Data submitted successfully!");

  } catch (err) {
    console.error("Unexpected error:", err);
    alert("❌ Something went wrong. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};



  const stepTitles = {
    1: "CRP Details",
    2: "Farmer Information",
    3: "Capture Land Boundary",
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
            onClick={() => { if (step <= completedStep) setCurrentStep(step); }}
            style={{ cursor: step <= completedStep ? "pointer" : "not-allowed", opacity: step <= completedStep ? 1 : 0.4 }}
          >
            {step}
          </div>
        ))}
      </div>

      <h3 className="step-heading">
        Step {currentStep} / {totalSteps}: {stepTitles[currentStep]}
      </h3>

      {/* STEP 1 → CRP FORM */}
      {currentStep === 1 && (
        <div className="section-box">
          <h3 className="section-title">CRP Section</h3>
          <div className="fields-grid">
            {/* Project Name */}
            <div className="field">
              <label>Project Name</label>
                  <input     {...register("projectName", { 
                      required: "Project Name is required",
                      pattern: { value: /^[A-Za-z\s]+$/, message: "Numbers not allowed" }
                    })} 
                  />
              {errors.projectName && <p className="error">{errors.projectName.message}</p>}
            </div>
            {/* Intervention Type */}
           <div className="field">
            <label>Intervention Area Type</label>
            <input 
              {...register("interventionType", { 
                required: "Intervention Area Type is required",
                pattern: { value: /^[A-Za-z\s]+$/, message: "Numbers not allowed" }
              })} 
            />
            {errors.interventionType && <p className="error">{errors.interventionType.message}</p>}
          </div>
            {/* Survey Date */}
            <div className="field">
              <label>Survey Date</label>
              <input type="date" {...register("surveyDate", { required: true })} />
              {errors.surveyDate && <p className="error">{errors.surveyDate.message}</p>}
            </div>
            {/* Interviewer Name */}
            <div className="field">
              <label>Interviewer Name</label>
              <input
               {...register("interviewerName", { 
                  required: "interviewerName is required",
                  pattern: { value: /^[A-Za-z\s]+$/, message: "Numbers not allowed" }
                })} 
               
              />
              {errors.interviewerName && <p className="error">{errors.interviewerName.message}</p>}
            </div>
            {/* State */}
            <div className="field">
              <label>State</label>
              <select
                {...register("state", { required: true })}
                onChange={(e) => { const iso = e.target.value; setSelectedState(iso); setValue("state", iso); }}
              >
                <option value="">Select State</option>
                {states.map((st) => <option key={st.isoCode} value={st.isoCode}>{st.name}</option>)}
              </select>
            </div>
            {/* District */}
            <div className="field">
              <label>District</label>
              <select {...register("district", { required: true })}>
                <option value="">Select District</option>
                {districts.map((d) => <option key={d.name} value={d.name}>{d.name}</option>)}
              </select>
            </div>
            {/* Block */}
            <div className="field">
              <label>Block</label>
              <input
               {...register("block")} 
               />
            </div>
            {/* Gram Panchayat */}
            <div className="field">
              <label>Gram Panchayat</label>
              <input {...register("gramPanchayat")} />
            </div>
            {/* Village */}
            <div className="field">
              <label>Village</label>
              <input {...register("village")} />
            </div>
          </div>
          <button className="submit-btn" onClick={goNext}>Save & Next →</button>
        </div>
      )}

      {/* STEP 2 → FARMER SECTION */}
      {currentStep === 2 && (
        <div className="section-box">
          <h3 className="section-title">Farmer Information</h3>
          <div className="fields-grid">
            <div className="field">
              <label>Farmer Name</label>
              <input 
                {...register("farmerName", { 
                  required: "Farmer Name is required",
                  pattern: { value: /^[A-Za-z\s]+$/, message: "Numbers not allowed" }
                })} 
              />
              {errors.farmerName && <p className="error">{errors.farmerName.message}</p>}
            </div>
           <div className="field">
              <label>Phone Number</label>
              <input
                type="text"  // number type ke saath maxLength kaam nahi karta, isliye text use karenge
                {...register("contact", {
                  required: "Phone Number is required",
                  pattern: { value: /^[0-9]{10}$/, message: "Enter a valid 10-digit number" }
                })}
                maxLength={10} // optional, user experience ke liye
              />
              {errors.contact && <p className="error">{errors.contact.message}</p>}
            </div>

            <div className="field">
              <label>Gender</label>
              <select {...register("gender")}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="field">
              <label>Khata Number</label>
              <input 
                {...register("khataNumber", { 
                  required: "Khata Number is required",
                  pattern: { value: /^[0-9]+$/, message: "Only numbers are allowed" }
                })} 
              />
              {errors.khataNumber && <p className="error">{errors.khataNumber.message}</p>}
            </div>
           <div className="field">
              <label>Plot Number</label>
              <input 
                {...register("plotNumber", { 
                  required: "Plot Number is required",
                  pattern: { value: /^[0-9]+$/, message: "Only numbers are allowed" }
                })} 
              />
              {errors.plotNumber && <p className="error">{errors.plotNumber.message}</p>}
            </div>
            <div className="field">
              <label>Farmer Photo</label>
              <input type="file" onChange={(e) => setFarmerPhoto(e.target.files[0])} />
            </div>
            <div className="field">
              <label>Farmer ID (Aadhar / Voter)</label>
              <input type="file" onChange={(e) => setFarmerID(e.target.files[0])} />
            </div>
            <div className="field">
              <label>Agreement</label>
              <input type="file" onChange={(e) => setAgreement(e.target.files[0])} />
            </div>
          </div>
          <div className="step-buttons">
            <button className="submit-btn" onClick={goBack}>← Back</button>
            <button className="submit-btn" onClick={goNext}>Save & Next →</button>
          </div>
        </div>
      )}

      {/* STEP 3 → MAP CAPTURE */}
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
            setLatitude={setLatitude} 
            setLongitude={setLongitude} 
          />
          <div className="step-buttons">
            <button className="submit-btn" onClick={goBack}>← Back</button>
            <button className="submit-btn" onClick={goNext}>Save & Next →</button>
          </div>
        </div>
      )}

      {/* STEP 4 → FINAL SUBMIT */}
      {currentStep === 4 && (
        <div className="section-box">
          <h3 className="section-title">Final Submit</h3>
          <button className="submit-btn" onClick={finalSubmit} disabled={isSubmitting}>
            {isSubmitting ? "⏳ Submitting..." : "✔ Submit All Data"}
          </button>          
          <button className="submit-btn" onClick={goBack} style={{ marginTop: 10 }}>← Back</button>
        </div>
      )}
    </div>
  );
}
