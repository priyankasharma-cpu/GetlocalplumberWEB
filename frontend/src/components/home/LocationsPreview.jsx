
import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  MapPin,
  Map,
  Navigation,
  House,
  CheckCircle2,
  Globe2,
} from "lucide-react";

import { locations } from "../../data/locations";
import { useLocationChoice } from "../../context/LocationContext";
import { SectionTitle } from "../../components/UI";

import "./LocationsPreview.css";

const featuredStates = [
  {
    name: "California",
    image:
      "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=240&h=180&fit=crop",
  },
  {
    name: "Texas",
    image:
      "https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=240&h=180&fit=crop",
  },
  {
    name: "Florida",
    image:
      "https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=240&h=180&fit=crop",
  },
  {
    name: "New York",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=240&h=180&fit=crop",
  },
  {
    name: "Illinois",
    image:
      "https://images.unsplash.com/photo-1494522358652-f30e61ef3a16?w=240&h=180&fit=crop",
  },
  {
    name: "Georgia",
    image:
      "https://images.unsplash.com/photo-1575917649705-5b59aaa12e6b?w=240&h=180&fit=crop",
  },
];

export default function LocationsPreview() {
  const { selected, openPicker } = useLocationChoice();

  return (
    <section
      className="section locations-section scroll-reveal"
      aria-label="Explore plumbing service locations"
    >
      {/* ======================================
          SECTION HEADING
      ====================================== */}

      <div className="locations-heading">
        <SectionTitle
          eyebrow="WHEREVER YOU CALL HOME"
          title={
            selected
              ? `A local starting point in ${selected.city || selected.name
              }.`
              : "Good homes. All across the map."
          }
          description="Explore state and city information. Confirm service areas directly with your chosen professional."
        />
      </div>

      {/* ======================================
          MAIN LAYOUT
      ====================================== */}

      <div className="locations-home">
        {/* LEFT FEATURE CARD */}

        <div className="location-feature">
          <div className="location-feature-content">
            <span className="location-feature-icon">
              <MapPin size={29} strokeWidth={2.5} />
            </span>

            <div className="location-feature-label">
              <span className="location-feature-dot" />
              EXPLORE YOUR LOCAL OPTIONS
            </div>

            <h3>
              Your home.
              <br />
              <span>Your local starting point.</span>
            </h3>

            <p>
              Choose a city to make your service links and
              call plan more relevant.
            </p>

            <button
              type="button"
              className="location-choose-btn"
              onClick={openPicker}
            >
              <Navigation size={19} />

              <span>Choose your city</span>

              <ArrowRight
                size={20}
                className="location-btn-arrow"
              />
            </button>
          </div>

          {/* Decorative map illustration */}

          <div className="location-map-art" aria-hidden="true">
            <Globe2 className="location-map-globe" />

            <span className="location-map-pin pin-one">
              <MapPin size={17} fill="currentColor" />
            </span>

            <span className="location-map-pin pin-two">
              <MapPin size={17} fill="currentColor" />
            </span>

            <span className="location-map-pin pin-three">
              <MapPin size={17} fill="currentColor" />
            </span>

            <span className="location-map-pin pin-four">
              <MapPin size={17} fill="currentColor" />
            </span>
          </div>

          <div className="location-feature-bottom">
            <span className="location-coverage-icon">
              <House size={19} />
            </span>

            <div>
              <small>EXPLORE LOCATIONS</small>
              <strong>50 STATES + DC</strong>
            </div>

            <CheckCircle2 size={17} />
          </div>
        </div>

        {/* ======================================
            RIGHT STATES GRID
        ====================================== */}

        <div className="location-preview">
          {featuredStates.map((item, index) => {
            const state = locations.find(
              (location) => location.name === item.name
            );

            if (!state) return null;

            return (
              <Link
                to={`/locations/${state.slug}`}
                key={state.abbr}
                className="location-state-card"
                style={{ "--state-index": index }}
              >
                <span className="location-state-image">
                  <img
                    src={item.image}
                    alt=""
                    loading="lazy"
                  />
                </span>

                <span className="location-state-info">
                  <span className="location-state-heading">
                    <span className="location-state-code">
                      {state.abbr}
                    </span>

                    <strong>{state.name}</strong>
                  </span>

                  <small>Cities &amp; service areas</small>
                </span>

                <span className="location-state-arrow">
                  <ArrowRight size={19} />
                </span>
              </Link>
            );
          })}

          {/* ALL STATES CTA */}

          <Link
            className="location-all-states"
            to="/locations"
          >
            <span className="location-all-icon">
              <Map size={25} />
            </span>

            <span>Explore all 50 states + DC</span>

            <span className="location-all-arrow">
              <ArrowUpRight size={21} />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
