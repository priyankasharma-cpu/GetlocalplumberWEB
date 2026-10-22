
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";

import { locations } from "../../data/locations";
import { useLocationChoice } from "../../context/LocationContext";
import { SectionTitle } from "../../components/UI";
import "./LocationsPreview.css";
// LocationsPreview: presentation extracted without changing the rendered section.
export default function LocationsPreview() {
  const { selected, openPicker } = useLocationChoice();
  return (<section className="section locations-section scroll-reveal">
        <SectionTitle
          eyebrow="WHEREVER YOU CALL HOME"
          title={
            selected
              ? `A local starting point in ${selected.city || selected.name}.`
              : "Good homes. All across the map."
          }
          description="Explore state and city information. Confirm service areas directly with your chosen professional."
        />
        <div className="locations-home">
          <div className="location-feature">
            <span className="feature-icon">
              <MapPin size={29} />
            </span>
            <h3>
              Your home.
              <br />
              Your local starting point.
            </h3>
            <p>
              Choose a city to make your service links and call plan more
              relevant.
            </p>
            <button className="button secondary" onClick={openPicker}>
              <MapPin size={16} />
              Choose your city
            </button>
          </div>
          <div className="location-preview">
            {[
              "California",
              "Texas",
              "Florida",
              "New York",
              "Illinois",
              "Georgia",
            ].map((name) => {
              const l = locations.find((l) => l.name === name);
              return (
                <Link to={"/locations/" + l.slug} key={l.abbr}>
                  <span>{l.abbr}</span>
                  <strong>{l.name}</strong>
                  <ArrowRight size={16} />
                </Link>
              );
            })}
            <Link className="all-states-link" to="/locations">
              Explore all 50 states + DC <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>);
}
