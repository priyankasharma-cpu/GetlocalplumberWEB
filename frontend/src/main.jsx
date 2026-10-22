import "./styles.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { LocationProvider } from "./context/LocationContext";
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <LocationProvider>
      <App />
    </LocationProvider>
  </BrowserRouter>,
);

// Shared section token bindings retain the original late cascade for spacing.
import "./styles/sectionTokens.css";
