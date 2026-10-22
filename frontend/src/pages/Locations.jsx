import StateCard from "../components/locations/StateCard";
// Geographic directory only; selecting a city does not assert provider coverage.

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Check, ChevronRight } from "lucide-react";
import { locations } from "../data/locations";

import { useLocationChoice } from "../context/LocationContext";
import "./Locations.css";
export function Locations() {
  const [q, setQ] = useState("");
  const { selected, openPicker } = useLocationChoice();
  const filtered = locations.filter((l) =>
    `${l.name} ${l.abbr}`.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <main className="section locations-directory">
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <ChevronRight size={12} />
        Locations
      </div>
      <span className="eyebrow">WHEREVER YOU CALL HOME</span>
      <h1>
        Find your local
        <br />
        plumbing starting point.
      </h1>
      <p className="lead">
        Explore plumbing information across all 50 states and Washington, DC. A
        better plan starts a little closer to home.
      </p>
      <div className="toolbar">
        <label className="search">
          <Search size={18} />
          <input
            aria-label="Search states"
            placeholder="Search state or abbreviation"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        <button className="button secondary" onClick={openPicker}>
          <MapPin size={16} />
          {selected?.city ? "Change your city" : "Search by city"}
        </button>
      </div>
      <div className="states-grid">
        {filtered.map((l) => (
          <StateCard l={l} key={l.abbr} />
        ))}
      </div>
      {!filtered.length && (
        <div className="empty">
          <Search size={32} />
          <h2>No matching states.</h2>
          <p>Try a state name or its two-letter abbreviation.</p>
        </div>
      )}
      <p className="directory-note">
        <Check size={16} />
        Geographic information for planning. Confirm provider coverage and
        availability directly.
      </p>
    </main>
  );
}

export { StateDetail } from "./StateDetail";
