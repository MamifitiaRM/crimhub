import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

// Apply saved theme before first render to avoid flash
const saved = localStorage.getItem("crimehub_theme") || "dark";
document.documentElement.setAttribute("data-theme", saved);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
