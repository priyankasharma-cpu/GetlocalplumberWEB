
import React from "react";
import { LayoutGrid, List } from "lucide-react";
import "./ViewToggle.css";

export default function ViewToggle({ view, setView }) {
  const handleViewChange = (nextView) => {
    if (view === nextView) return;

    setView(nextView);
    localStorage.setItem("glp-view", nextView);
  };

  return (
    <div
      className="view-toggle"
      role="group"
      aria-label="Choose display layout"
    >
      <div
        className={`view-toggle__indicator ${view === "list" ? "is-list" : ""
          }`}
        aria-hidden="true"
      />

      <button
        type="button"
        className={`view-toggle__button ${view === "grid" ? "is-active" : ""
          }`}
        aria-pressed={view === "grid"}
        onClick={() => handleViewChange("grid")}
      >
        <LayoutGrid size={17} strokeWidth={2.2} />
        <span>Grid View</span>
      </button>

      <button
        type="button"
        className={`view-toggle__button ${view === "list" ? "is-active" : ""
          }`}
        aria-pressed={view === "list"}
        onClick={() => handleViewChange("list")}
      >
        <List size={18} strokeWidth={2.2} />
        <span>List View</span>
      </button>
    </div>
  );
}
