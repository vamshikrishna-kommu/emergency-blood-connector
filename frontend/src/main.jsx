// ============================================================
// main.jsx — React Application Entry Point
// ============================================================
// This is the very first file React loads.
// It mounts the App component into the HTML div#root element.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";  // Import global styles
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
