import React from "react";
import { MapPin, Search, ArrowRight, Check, X } from "lucide-react";
import { locations } from "../../data/locations";
import Dialog from "../../components/Dialog";

import { locationLabel } from "../../context/locationHelpers";
import "./LocationSelector.css";
export default function LocationSelector({ setOpen, query, setQuery, selected, clearSelection, q, cities, error, matches, choose, stateMatches }) { return (        <Dialog
          title="Choose your city"
          id="location-title"
          onClose={() => setOpen(false)}
          className="location-modal"
        >
          <p>Make your plumbing plan a little more local.</p>
          <div className="location-input">
            <Search size={19} />
            <input
              data-autofocus
              aria-label="Search city or state"
              placeholder="Search city, state, or abbreviation"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                className="icon"
                aria-label="Clear location search"
                onClick={() => setQuery("")}
              >
                <X size={17} />
              </button>
            )}
          </div>
          {selected && (
            <div className="selected-location">
              <Check size={16} />
              Selected: {locationLabel(selected)}
              <button className="clear-location" onClick={clearSelection}>
                Clear selection
              </button>
            </div>
          )}
          <div className="location-results">
            {q.length > 1 && (
              <>
                <span className="result-label">Cities & places</span>
                {!cities.length && !error ? (
                  <p role="status">Loading city directory…</p>
                ) : matches.length ? (
                  matches.map((c) => {
                    const state = locations.find((l) => l.abbr === c.abbr);
                    return (
                      <button key={c.id} onClick={() => choose(state, c)}>
                        <span className="location-icon">
                          <MapPin size={18} />
                        </span>
                        <span>
                          <strong>
                            {c.name}, {c.abbr}
                          </strong>
                          <small>{state?.name}</small>
                        </span>
                        <ArrowRight size={17} />
                      </button>
                    );
                  })
                ) : (
                  <p className="no-results">
                    No matching cities. Try a city name or select a state.
                  </p>
                )}
              </>
            )}
            <span className="result-label">
              {q ? "Matching states" : "Browse by state"}
            </span>
            {stateMatches.slice(0, q ? 51 : 10).map((l) => (
              <button key={l.abbr} onClick={() => choose(l)}>
                <span className="state-abbr">{l.abbr}</span>
                <span>
                  <strong>{l.name}</strong>
                  <small>Explore state information</small>
                </span>
                <ArrowRight size={17} />
              </button>
            ))}
          </div>
          {error && <p role="alert">{error}</p>}
          <p className="location-source">
            City names: U.S. Census Bureau Gazetteer. Selecting a place does not
            confirm provider coverage.
          </p>
        </Dialog>); }
