import React, { useState, useId, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, ArrowUpRight } from "lucide-react";
import { services } from "../data/services";
import "./ServiceSearch.css";
export default function ServiceSearch() {
  const [query, setQuery] = useState(""),
    [open, setOpen] = useState(false),
    [active, setActive] = useState(-1);
  const navigate = useNavigate(),
    id = useId(),
    root = useRef();
  const matches = services
    .filter((s) =>
      `${s.title} ${s.short}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    )
    .slice(0, 6);
  useEffect(() => {
    const close = (e) => {
      if (!root.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  const select = (s) => {
    setOpen(false);
    setQuery("");
    navigate("/services/" + s.slug);
  };
  return (
    <div
      className="hero-search"
      ref={root}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <div className="hero-search-field">
        <Search size={20} />
        <input
          role="combobox"
          aria-label="What plumbing service do you need?"
          placeholder="What plumbing service do you need?"
          aria-expanded={open}
          aria-controls={id}
          aria-autocomplete="list"
          aria-activedescendant={
            open && active >= 0 && matches[active]
              ? `${id}-${active}`
              : undefined
          }
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(-1);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setActive((v) => Math.min(v + 1, matches.length - 1));
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((v) => Math.max(v - 1, 0));
            }
            if (e.key === "Enter") {
              e.preventDefault();
              if (matches.length) select(matches[active >= 0 ? active : 0]);
            }
          }}
        />
        {query && (
          <button
            aria-label="Clear service search"
            onClick={() => {
              setQuery("");
              setActive(-1);
            }}
          >
            <X size={17} />
          </button>
        )}
      </div>
      {open && (
        <div
          className="service-suggestions"
          id={id}
          role="listbox"
          aria-label="Plumbing services"
        >
          <span className="result-label">
            {query ? "Matching services" : "Popular services"}
          </span>
          {matches.length ? (
            matches.map((s, i) => (
              <button
                type="button"
                id={`${id}-${i}`}
                key={s.id}
                role="option"
                aria-selected={active === i}
                onPointerMove={() => setActive(i)}
                onClick={() => select(s)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setOpen(false);
                }}
              >
                <span>{s.title}</span>
                <ArrowUpRight size={17} />
              </button>
            ))
          ) : (
            <p role="status">
              No services found. Try “drain”, “leak”, or “water heater”.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
