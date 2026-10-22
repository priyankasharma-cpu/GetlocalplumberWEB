import React from "react";
import { Link } from "react-router-dom";
import "./StateCard.css";
export default function StateCard({ l }) { return (          <Link className="state-card" to={"/locations/" + l.slug}>
            <strong>{l.name}</strong>
            <span className="state-abbr">{l.abbr}</span>
          </Link>); }
