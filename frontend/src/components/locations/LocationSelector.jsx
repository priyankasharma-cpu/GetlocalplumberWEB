
import React, { useRef, useState } from "react";

import {
  MapPin,
  Search,
  ArrowRight,
  Check,
  X,
  ShieldCheck,
  MapPinned,
  RotateCcw,
  LocateFixed,
  LoaderCircle,
} from "lucide-react";

import { locations } from "../../data/locations";
import Dialog from "../../components/Dialog";
import { locationLabel } from "../../context/locationHelpers";

import "./LocationSelector.css";

export default function LocationSelector({
  setOpen,
  query,
  setQuery,
  selected,
  clearSelection,
  cities,
  error,
  matches,
  choose,
}) {
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [geoError, setGeoError] = useState("");

  const geoRequestRef = useRef(0);

  const searchText = String(query || "").trim();
  const hasSearch = searchText.length > 0;
  const showCities = searchText.length > 1;

  // Display all states when search is empty.
  // Filter states when the user types.
  const visibleStates = hasSearch
    ? locations.filter((state) => {
      const term = searchText.toLowerCase();

      return (
        state.name.toLowerCase().includes(term) ||
        state.abbr.toLowerCase().includes(term)
      );
    })
    : locations;

  // Render a maximum of 30 matching cities.
  const visibleCities = showCities
    ? (matches || []).slice(0, 30)
    : [];

  const closeModal = () => {
    geoRequestRef.current += 1;
    setOpen(false);
  };

  const handleCurrentLocation = () => {
    setGeoError("");

    if (!navigator.geolocation) {
      setGeoError(
        "Your browser does not support location detection."
      );
      return;
    }

    if (!window.isSecureContext) {
      setGeoError(
        "Location detection requires HTTPS or localhost."
      );
      return;
    }

    const requestId = ++geoRequestRef.current;

    setDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const { latitude, longitude } = coords;

          const params = new URLSearchParams({
            format: "jsonv2",
            lat: String(latitude),
            lon: String(longitude),
            addressdetails: "1",
            zoom: "10",
          });

          // Reverse geocoding: coordinates -> city/state
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
            {
              headers: {
                Accept: "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error(
              "Unable to look up your location. Please search manually."
            );
          }

          const data = await response.json();

          if (requestId !== geoRequestRef.current) return;

          const address = data.address || {};

          const countryCode = String(
            address.country_code || ""
          ).toUpperCase();

          if (countryCode !== "US") {
            setGeoError(
              "Automatic location selection currently supports US locations only. Please search for a US city or state."
            );
            return;
          }

          const stateName = String(address.state || "");

          // Match a state using its name.
          const state = locations.find(
            (item) =>
              item.name.toLowerCase() ===
              stateName.toLowerCase()
          );

          if (!state) {
            throw new Error(
              "We could not identify your state. Please search manually."
            );
          }

          const detectedCity = String(
            address.city ||
            address.town ||
            address.village ||
            address.hamlet ||
            address.municipality ||
            ""
          ).trim();

          // Match city only if the existing directory
          // already contains it.
          const matchedCity = (cities || []).find(
            (city) =>
              city.abbr === state.abbr &&
              city.name.toLowerCase() ===
              detectedCity.toLowerCase()
          );

          if (requestId !== geoRequestRef.current) return;

          if (matchedCity) {
            choose(state, matchedCity);
          } else {
            // Fall back to the state instead of creating
            // an incompatible city record.
            choose(state);
          }
        } catch (err) {
          if (requestId !== geoRequestRef.current) return;

          setGeoError(
            err.message ||
            "Unable to detect your location. Please search manually."
          );
        } finally {
          if (requestId === geoRequestRef.current) {
            setDetectingLocation(false);
          }
        }
      },

      (geoErrorResult) => {
        if (requestId !== geoRequestRef.current) return;

        setDetectingLocation(false);

        switch (geoErrorResult.code) {
          case 1:
            setGeoError(
              "Location permission denied. Please allow location access in your browser settings."
            );
            break;

          case 2:
            setGeoError(
              "Your current location is unavailable. Please try again."
            );
            break;

          case 3:
            setGeoError(
              "Location request timed out. Please try again."
            );
            break;

          default:
            setGeoError(
              "Unable to detect your location. Please search manually."
            );
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  return (
    <Dialog
      title="Where is the work?"
      id="location-title"
      onClose={closeModal}
      className="location-modal"
    >
      <div className="glp-location-content">
        {/* INTRODUCTION */}
        <p className="glp-location-description">
          Choose your location to explore local plumbing
          information and services.
        </p>

        {/* CURRENT LOCATION */}
        <div className="glp-geolocation-area">
          <button
            type="button"
            className="glp-current-location-btn"
            onClick={handleCurrentLocation}
            disabled={detectingLocation}
          >
            {detectingLocation ? (
              <LoaderCircle
                size={21}
                className="glp-location-spinner"
                aria-hidden="true"
              />
            ) : (
              <LocateFixed
                size={21}
                aria-hidden="true"
              />
            )}

            <span>
              {detectingLocation
                ? "Detecting your location..."
                : "Use my current location"}
            </span>
          </button>

          {geoError && (
            <p
              className="glp-geolocation-error"
              role="alert"
            >
              {geoError}
            </p>
          )}

          <div className="glp-location-divider">
            <span>or search manually</span>
          </div>
        </div>

        {/* SEARCH */}
        <div className="glp-location-search-area">
          <div className="glp-search-heading">
            <h3>Find Your Local Plumbing Services</h3>

            <p>
              Enter your city or state to explore plumbing
              information in your area.
            </p>
          </div>

          <label
            htmlFor="glp-location-search"
            className="glp-location-label"
          >
            City or state
          </label>

          <div className="glp-location-search">
            <Search
              size={20}
              aria-hidden="true"
            />

            <input
              id="glp-location-search"
              data-autofocus
              type="text"
              autoComplete="off"
              placeholder="e.g. Dallas or Ohio"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            {query && (
              <button
                type="button"
                className="glp-search-clear"
                aria-label="Clear search"
                onClick={() => setQuery("")}
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* SELECTED LOCATION */}
        {selected && (
          <div className="glp-selected-location">
            <span
              className="glp-selected-check"
              aria-hidden="true"
            >
              <Check size={18} />
            </span>

            <div className="glp-selected-text">
              <small>Current selection</small>

              <strong>
                {locationLabel(selected)}
              </strong>
            </div>

            <button
              type="button"
              className="glp-selected-clear"
              onClick={clearSelection}
            >
              <RotateCcw size={15} />
              Clear
            </button>
          </div>
        )}

        {/* LOCATION RESULTS */}
        <div className="glp-location-results">
          {/* CITY RESULTS */}
          {showCities && (
            <section className="glp-location-section">
              <div className="glp-results-heading">
                <div className="glp-heading-left">
                  <MapPin size={18} />

                  <h3>Matching cities</h3>
                </div>

                <span className="glp-results-count">
                  {visibleCities.length}
                </span>
              </div>

              <div className="glp-location-list">
                {!cities.length && !error ? (
                  <p
                    className="glp-location-empty"
                    role="status"
                  >
                    Loading city directory…
                  </p>
                ) : visibleCities.length ? (
                  visibleCities.map((city) => {
                    const state = locations.find(
                      (item) => item.abbr === city.abbr
                    );

                    return (
                      <button
                        key={city.id}
                        type="button"
                        className="glp-location-item"
                        onClick={() => choose(state, city)}
                      >
                        <span
                          className="glp-item-icon"
                          aria-hidden="true"
                        >
                          <MapPin size={19} />
                        </span>

                        <span className="glp-item-name">
                          {city.name}
                        </span>

                        <span className="glp-item-meta">
                          {state?.name || city.abbr}
                        </span>

                        <ArrowRight
                          className="glp-item-arrow"
                          size={17}
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })
                ) : (
                  <p className="glp-location-empty">
                    No matching cities found.
                  </p>
                )}
              </div>
            </section>
          )}

          {/* STATE RESULTS */}
          <section className="glp-location-section">
            <div className="glp-results-heading">
              <div className="glp-heading-left">
                <MapPinned size={18} />

                <h3>
                  {hasSearch
                    ? "Matching states"
                    : "Browse by state"}
                </h3>
              </div>

              <span className="glp-results-count">
                {visibleStates.length}
              </span>
            </div>

            <div className="glp-location-list">
              {visibleStates.length ? (
                visibleStates.map((state) => (
                  <button
                    key={state.abbr}
                    type="button"
                    className="glp-location-item"
                    onClick={() => choose(state)}
                  >
                    <span
                      className="glp-state-badge"
                      aria-hidden="true"
                    >
                      {state.abbr}
                    </span>

                    <span className="glp-item-name">
                      {state.name}
                    </span>

                    <ArrowRight
                      className="glp-item-arrow"
                      size={17}
                      aria-hidden="true"
                    />
                  </button>
                ))
              ) : (
                <p className="glp-location-empty">
                  No matching states found.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* CITY DIRECTORY ERROR */}
        {error && (
          <p
            className="glp-location-error"
            role="alert"
          >
            {error}
          </p>
        )}

        {/* FOOTER */}
        <div className="glp-location-footer">
          <ShieldCheck
            size={19}
            aria-hidden="true"
          />

          <p>
            City names: U.S. Census Bureau Gazetteer.
            Selecting a location does not confirm
            provider coverage.
          </p>
        </div>
      </div>
    </Dialog>
  );
}
