import React from "react";
import { MapPin, ChevronDown } from "lucide-react";
import { useLocationChoice } from "../../context/locationState";
import "./LocationButton.css";
export function LocationButton({ compact = false }) {
  const { openPicker, label } = useLocationChoice();
  return (
    <button
      className={"location-button " + (compact ? "compact" : "")}
      onClick={openPicker}
    >
      <MapPin size={16} />
      <span>{label}</span>
      <ChevronDown className="location-chevron" size={13} />
    </button>
  );
}
