
import React from "react";
import { MapPin, ChevronDown } from "lucide-react";
import { useLocationChoice } from "../../context/locationState";
import "./LocationButton.css";

export function LocationButton({ compact = false }) {
  const { openPicker, label } = useLocationChoice();

  return (
    <button
      type="button"
      className={`location-button ${compact ? "compact" : ""}`}
      onClick={openPicker}
      aria-label={`Choose location. Current selection: ${label || "Not selected"}`}
      title="Choose your location"
    >
      <span className="location-button-icon" aria-hidden="true">
        <MapPin size={19} strokeWidth={2.4} />
        <span className="location-pin-pulse" />
      </span>

      <span className="location-button-content">
        {!compact && (
          <small className="location-button-caption">
            YOUR LOCATION
          </small>
        )}

        <span className="location-button-label">
          {label || "Choose location"}
        </span>
      </span>

      <span className="location-button-chevron" aria-hidden="true">
        <ChevronDown size={16} strokeWidth={2.5} />
      </span>
    </button>
  );
}
