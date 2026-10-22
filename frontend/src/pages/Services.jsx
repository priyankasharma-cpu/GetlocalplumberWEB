import ViewToggle from "../components/services/ViewToggle";
import ServiceGrid from "../components/services/ServiceGrid";
// Service directory and detail routes share the centralized service catalog.

import { useLocationChoice } from "../context/LocationContext";
import React, { useState } from "react";
import { Link } from "react-router-dom";

import { Search } from "lucide-react";
import { services } from "../data/services";

import { ServiceCard } from "../components/UI";
import "./Services.css";
export function Services() {
  const { selected } = useLocationChoice();
  const [view, setView] = useState(() => {
      const requested = new URLSearchParams(window.location.search).get("view");
      return ["grid", "list"].includes(requested)
        ? requested
        : localStorage.getItem("glp-view") || "grid";
    }),
    [query, setQuery] = useState("");
  const filtered = services.filter((s) =>
    s.title.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <main className="section services-directory">
      <span className="eyebrow">A SOLUTION STARTS WITH UNDERSTANDING</span>
      <div className="breadcrumb">
        <Link to="/">Home</Link> / Services
      </div>
      <h1>
        Every plumbing need.
        <br />
        One clear next step.
      </h1>
      <p className="lead">
        Explore all 24 plumbing services
        {selected ? ` for your home in ${selected.city || selected.name}` : ""}.
        Find the information to plan your next move.
      </p>
      <div className="toolbar">
        <label className="search">
          <Search size={18} />
          <input
            aria-label="Search services"
            placeholder="Search plumbing services"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <ViewToggle {...{ view, setView }} />
      </div>
      <ServiceGrid view={view}>
        {filtered.map((s) => (
          <ServiceCard key={s.id} service={s} list={view === "list"} />
        ))}
      </ServiceGrid>
      {!filtered.length && <p>No services match your search.</p>}
    </main>
  );
}
export { NotFound } from "./NotFound";
export { ServiceDetail } from "./ServiceDetail";
