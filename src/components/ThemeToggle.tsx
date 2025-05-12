
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const ThemeToggle = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  
  useEffect(() => {
    // Check for user preference in localStorage
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    
    // Check for OS preference if no saved preference
    if (!savedTheme) {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    } else {
      setTheme(savedTheme);
    }
  }, []);
  
  useEffect(() => {
    // Apply theme to document
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    // Save preference to localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>
      {theme === "light" ? (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      )}
    </Button>
  );
};

export default ThemeToggle;
