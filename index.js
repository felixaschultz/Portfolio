import App from "./src/modules/App.js";
import React from "react";
import ReactDOM from "react-dom/client";
const container = document.getElementById('app');
const root = ReactDOM.createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<App />);