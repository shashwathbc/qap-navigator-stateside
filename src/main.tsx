
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add dark mode class to html if needed
const isDarkMode = localStorage.getItem("theme") === "dark" || 
  (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);

if (isDarkMode) {
  document.documentElement.classList.add("dark");
}

createRoot(document.getElementById("root")!).render(<App />);
