import React from "react";
import "./ProjectProgress.css";
export default function ProjectProgress({ p }) { return (<div className="project-progress">
                {["Planned", "Called", "Quote in", "Decided"].map((s, i) => (
                  <span
                    key={s}
                    className={
                      i <=
                      ["Planned", "Called", "Quote in", "Decided"].indexOf(
                        p.status,
                      )
                        ? "done"
                        : ""
                    }
                  >
                    {i + 1}
                    <small>{s}</small>
                  </span>
                ))}
              </div>); }
