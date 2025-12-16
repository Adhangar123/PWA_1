import React, { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapCapture.css";

export default function MapCapture({
  points,
  setPoints,
  area,
  setArea,
  setPolygonSaved,
  setLatitude,
  setLongitude,
}) {
  const mapRef = useRef(null);
  const polygonRef = useRef(null);
  const lineRef = useRef(null);
  const watchIdRef = useRef(null);

  const rad = (deg) => (deg * Math.PI) / 180;

  // 🔢 Area calc
  const calculateArea = useCallback((pts) => {
    if (pts.length < 4) return 0;
    const R = 6378137;
    let total = 0;

    for (let i = 0; i < pts.length; i++) {
      const p1 = pts[i];
      const p2 = pts[(i + 1) % pts.length];
      total +=
        rad(p2.lng - p1.lng) *
        (2 + Math.sin(rad(p1.lat)) + Math.sin(rad(p2.lat)));
    }
    return Math.abs((total * R * R) / 2);
  }, []);

  // 🗺️ MAP INIT
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("capture-map").setView([20.59, 78.96], 6);

      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 22,
        }
      ).addTo(mapRef.current);


      setTimeout(() => mapRef.current.invalidateSize(), 200);
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // 🔁 DRAW POLY
  useEffect(() => {
    if (!mapRef.current) return;

    if (polygonRef.current) mapRef.current.removeLayer(polygonRef.current);
    if (lineRef.current) mapRef.current.removeLayer(lineRef.current);

    if (points.length >= 2) {
      lineRef.current = L.polyline(points, {
        color: "orange",
        weight: 3,
        dashArray: "5,5",
      }).addTo(mapRef.current);
    }

    if (points.length >= 4) {
      polygonRef.current = L.polygon(points, {
        color: "green",
        fillOpacity: 0.3,
      }).addTo(mapRef.current);

      mapRef.current.fitBounds(polygonRef.current.getBounds(), {
        padding: [20, 20],
      });
    }

    setArea(calculateArea(points));
  }, [points, calculateArea, setArea]);

  // 📍 UNIVERSAL GPS CAPTURE
  const capturePoint = () => {
    if (!navigator.geolocation) {
      alert("❌ GPS not supported on this device");
      return;
    }

    if (points.length >= 50) {
      alert("⚠️ Max 50 GPS points allowed");
      return;
    }

    // 🔄 fallback logic
    let resolved = false;

    const success = (pos) => {
      if (resolved) return;
      resolved = true;

      const { latitude, longitude, accuracy } = pos.coords;

      // 🛑 very bad accuracy ignore
      if (accuracy > 100) {
        alert("📡 GPS accuracy low, please wait...");
        resolved = false;
        return;
      }

      setLatitude(latitude.toFixed(6));
      setLongitude(longitude.toFixed(6));

      setPoints((prev) => [...prev, { lat: latitude, lng: longitude }]);

      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };

    const error = () => {
      if (!resolved) {
        // 🔁 fallback to low accuracy
        navigator.geolocation.getCurrentPosition(success, () => {
          alert("❌ Unable to capture GPS. Move to open area.");
        }, {
          enableHighAccuracy: false,
        });
      }
    };

    // 🚀 watchPosition works BEST across devices
    watchIdRef.current = navigator.geolocation.watchPosition(success, error, {
      enableHighAccuracy: false,
      maximumAge: 10000,
    });
  };

  // 💾 SAVE
  const savePolygon = () => {
    if (points.length < 4) {
      alert("Minimum 4 points required");
      return;
    }
    setPolygonSaved(true);
    alert("✅ Land parcel saved");
  };

  // ♻️ RESET
  const resetPolygon = () => {
    setPoints([]);
    setArea(0);
    setPolygonSaved(false);
    if (polygonRef.current) mapRef.current.removeLayer(polygonRef.current);
    if (lineRef.current) mapRef.current.removeLayer(lineRef.current);
  };

  return (
    <div className="map-wrapper">
      <div id="capture-map" className="map-container" />

      <div className="map-controls">
        <button onClick={capturePoint}>
          📍 Capture Point ({points.length}/50)
        </button>

        <button disabled={points.length < 4} onClick={savePolygon}>
          💾 Save Polygon
        </button>

        <button onClick={resetPolygon}>
          ✏️ Reset Polygon
        </button>

        <div className="area-display">
          <strong>Area:</strong>{" "}
          {area > 0 ? (area / 10000).toFixed(4) + " Ha" : "—"}
        </div>
      </div>
    </div>
  );
}
