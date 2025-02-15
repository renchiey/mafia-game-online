import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";
import App from "./App.tsx";
import { WebSocketProvider } from "./contexts/WSContext.tsx";
import { safelist } from "./utils/tailwind-safelist";

safelist; // loading safelist for tailwind

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WebSocketProvider>
      <App />
    </WebSocketProvider>
  </StrictMode>
);
