import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log("Starting Finexo App...");

try {
  const root = document.getElementById('root');
  if (!root) throw new Error("Root element not found");

  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (e) {
  console.error("CRITICAL RENDER ERROR:", e);
  document.body.innerHTML = `<div style="color: red; padding: 20px;">
    <h1>App Failed to Start</h1>
    <pre>${e instanceof Error ? e.toString() : JSON.stringify(e)}</pre>
  </div>`;
}
