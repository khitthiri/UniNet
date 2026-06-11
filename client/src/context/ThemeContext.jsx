import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("uninet_theme") || "uninet");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("uninet_theme", theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === "uninetdark" ? "#000000" : "#f5f5f7";
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "uninet" ? "uninetdark" : "uninet"));
  return <ThemeContext.Provider value={{ theme, toggle, isDark: theme === "uninetdark" }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
