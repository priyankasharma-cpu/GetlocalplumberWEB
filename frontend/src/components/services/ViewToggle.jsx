import React from "react";
import { LayoutGrid, List } from "lucide-react";
import "./ViewToggle.css";
export default function ViewToggle({ view, setView }) { return (        <div className="segmented">
          {["grid", "list"].map((v) => (
            <button
              aria-pressed={view === v}
              className={view === v ? "selected" : ""}
              key={v}
              onClick={() => {
                setView(v);
                localStorage.setItem("glp-view", v);
              }}
            >
              {v === "grid" ? <LayoutGrid size={16} /> : <List size={16} />}{" "}
              {v === "grid" ? "Grid" : "List"} view
            </button>
          ))}
        </div>); }
