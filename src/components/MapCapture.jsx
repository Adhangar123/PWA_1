import React, { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapCapture.css";

export default function MapCapture({
  points,
  setPoints,
  area,
  setArea,
  polygonSaved,
  setPolygonSaved,
}) {
  const mapRef = useRef(null);
  const polygonRef = useRef(null);

  const rad = (deg) => (deg * Math.PI) / 180;

  const calculateArea = useCallback((pts) => {
    if (pts.length < 3) return 0;

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

  // MAP INIT
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("capture-map", {
        center: [20.59, 78.96],
        zoom: 6,
      });

      L.tileLayer("https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
        maxZoom: 22,
      }).addTo(mapRef.current);

      setTimeout(() => mapRef.current.invalidateSize(), 150);
    }
  }, []);

  // DRAW POLYGON WHEN SAVED
  useEffect(() => {
    if (!mapRef.current) return;

    if (polygonRef.current) {
      mapRef.current.removeLayer(polygonRef.current);
    }

    if (polygonSaved && points.length >= 3) {
      polygonRef.current = L.polygon(points, {
        color: "blue",
        weight: 2,
        fillOpacity: 0.3,
      }).addTo(mapRef.current);

      mapRef.current.fitBounds(polygonRef.current.getBounds(), {
        padding: [20, 20],
      });
    }

    setArea(calculateArea(points));
  }, [polygonSaved, points, calculateArea, setArea]);

  // CAPTURE POINT FUNCTION
  const capturePoint = () => {
    if (points.length >= 50) {
      alert("Maximum 50 GPS points allowed.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setPoints((prev) => [...prev, p]);
      },
      (err) => alert("GPS error: " + err.message),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // SHOW POLYGON BUTTON CLICK
  const showPolygon = () => {
    if (points.length < 3) {
      alert("Minimum 3 points required to draw polygon.");
      return;
    }
    setPolygonSaved(true);
  };

  // RESET ALL
  const resetPolygon = () => {
    setPoints([]);
    setPolygonSaved(false);
    setArea(0);
  };

  return (
    <div className="map-wrapper">
      {/* MAP */}
      <div id="capture-map" className="map-container"></div>

      {/* CONTROLS */}
      <div className="map-controls">
        <button onClick={capturePoint} disabled={polygonSaved}>
          📍 Capture Point ({points.length}/50)
        </button>

        {!polygonSaved ? (
          <button
            className="save-btn"
            disabled={points.length < 3}
            onClick={showPolygon}
          >
            👀 Show Polygon
          </button>
        ) : (
          <button className="edit-btn" onClick={resetPolygon}>
            ✏️ Edit Polygon
          </button>
        )}

        {/* AREA DISPLAY */}
        <div className="area-display">
          <strong>Area: </strong>
          {area > 0 ? (area / 10000).toFixed(4) + " Ha" : "—"}
        </div>
      </div>
    </div>
  );
}
