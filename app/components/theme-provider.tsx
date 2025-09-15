import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import { colors } from "../theme/colors"; // 👈 your palette file

type ThemeMode = "light" | "dark";

type ThemeContextType = {
  mode: ThemeMode;
  isDark: boolean;
  colors: typeof colors;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(
    systemScheme === "dark" ? "dark" : "light"
  );

  useEffect(() => {
    // sync with system changes (optional)
    setMode(systemScheme === "dark" ? "dark" : "light");
  }, [systemScheme]);

  const toggleTheme = () => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        isDark: mode === "dark",
        colors, // 👈 you could also merge light/dark variations here
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
