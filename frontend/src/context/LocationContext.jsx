import LocationSelector from "../components/locations/LocationSelector";
import React, { useState, useEffect, useMemo } from "react";

import { locations } from "../data/locations";

import { loadCities } from "../data/cities";
import { Context } from "./locationState";
export { useLocationChoice } from "./locationState";
import { locationLabel } from "./locationHelpers";
export { locationLabel } from "./locationHelpers";
export function LocationProvider({ children }) {
  const [selected, setSelected] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem("glp-location"));
      const state = locations.find((l) => l.abbr === s?.abbr);
      return state
        ? {
            ...state,
            city: typeof s.city === "string" ? s.city.slice(0, 100) : null,
            cityId: s.cityId || null,
          }
        : null;
    } catch {
      return null;
    }
  });
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState(""),
    [cities, setCities] = useState([]),
    [error, setError] = useState("");
  useEffect(() => {
    if (open && !cities.length)
      loadCities()
        .then(setCities)
        .catch(() =>
          setError("City search could not load. You can still select a state."),
        );
  }, [open, cities.length]);
  const choose = (state, city) => {
    const value = {
      ...state,
      city: city?.name || null,
      cityId: city?.id || null,
    };
    try {
      localStorage.setItem("glp-location", JSON.stringify(value));
    } catch {
      setError("Your browser could not save this location.");
    }
    setSelected(value);
    setOpen(false);
    setQuery("");
  };
  const q = query.trim().toLowerCase();
  const clearSelection = () => {
    try {
      localStorage.removeItem("glp-location");
      setSelected(null);
      setOpen(false);
      setQuery("");
    } catch {
      setError("This browser could not clear the saved location.");
    }
  };
  const matches = useMemo(() => {
    if (q.length < 2) return [];
    return cities
      .filter((c) => {
        const state = locations.find((l) => l.abbr === c.abbr);
        return `${c.name}, ${c.abbr} ${state?.name}`.toLowerCase().includes(q);
      })
      .sort(
        (a, b) =>
          (a.name.toLowerCase().startsWith(q) ? 0 : 1) -
            (b.name.toLowerCase().startsWith(q) ? 0 : 1) ||
          a.name.localeCompare(b.name),
      )
      .slice(0, 35);
  }, [cities, q]);
  const stateMatches = locations.filter((l) =>
    `${l.name} ${l.abbr}`.toLowerCase().includes(q),
  );
  return (
    <Context.Provider
      value={{
        selected,
        choose,
        openPicker: () => setOpen(true),
        label: locationLabel(selected),
      }}
    >
      {children}
      {open && (
        <LocationSelector {...{ setOpen, query, setQuery, selected, clearSelection, q, cities, error, matches, choose, stateMatches }} />
      )}
    </Context.Provider>
  );
}
export { LocationButton } from "../components/locations/LocationButton";
export { GreetingRow } from "../components/locations/GreetingRow";
