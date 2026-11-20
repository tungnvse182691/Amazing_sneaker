import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// MSW mock API chạy LUÔN cho bản demo (chưa có backend thật).
// Khi có backend thật, đổi thành chỉ chạy khi import.meta.env.DEV
// hoặc gỡ hẳn khối này.
async function start() {
  try {
    const { worker } = await import("./mocks/browser");
    await worker.start({ onUnhandledFrame: "bypass" });
  } catch {
    /* MSW không khởi động được thì app vẫn chạy */
  }
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

start();
