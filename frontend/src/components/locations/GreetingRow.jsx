import React, { useState, useEffect } from "react";
import { LocationButton } from "./LocationButton";
import "./GreetingRow.css";
export function GreetingRow() {
  const [hour, setHour] = useState(() => new Date().getHours());
  useEffect(() => {
    const t = setInterval(() => setHour(new Date().getHours()), 60000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="greeting-row">
      <span>
        Good {hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening"}
      </span>
      <LocationButton />
    </div>
  );
}
