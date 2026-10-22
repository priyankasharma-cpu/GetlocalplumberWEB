import React from "react";
import "./CallTicket.css";
export default function CallTicket({ planner, selected, state, answers, steps }) { return (<div className="ticket">
              <h3>{planner.service.title}</h3>
              <div>
                <small>Where</small>
                <strong>
                  {selected?.city && state === selected.name
                    ? `${selected.city}, ${selected.abbr}`
                    : state || "Choose a location"}
                </strong>
              </div>
              {answers.map((a, i) => (
                <div key={i}>
                  <small>{steps[i][0]}</small>
                  <strong>{a}</strong>
                </div>
              ))}
              <p>
                Pricing and call duration: confirm directly with your chosen
                professional. Ask about visit fees and a written quote.
              </p>
            </div>); }
