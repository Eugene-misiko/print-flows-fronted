import React from "react";
import ReactDOM from "react-dom/client"; 
import { Provider } from "react-redux";
import App from "./App";
import Store from "./store/Store.js";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={Store}>
      <App />
    </Provider>
  </React.StrictMode>
);