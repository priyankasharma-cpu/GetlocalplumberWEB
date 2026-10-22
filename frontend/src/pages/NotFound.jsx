import React from "react";
import { Link } from "react-router-dom";
export function NotFound() {
  return (
    <main className="section empty">
      <h1>That page isn’t here.</h1>
      <Link className="button" to="/">
        Back to home
      </Link>
    </main>
  );
}

