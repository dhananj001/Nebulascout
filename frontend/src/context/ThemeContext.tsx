'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  const applyTheme = (t: Theme) => {
    setThemeState(t);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nebulascout-theme', t);
      const root = document.documentElement;
      if (t === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
      root.setAttribute('data-theme', t);
      root.style.colorScheme = t;
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('nebulascout-theme') as Theme | null;
    // Default to clean Apple Light Mode unless explicitly set to dark
    const initialTheme: Theme = saved === 'dark' ? 'dark' : 'light';
    applyTheme(initialTheme);
    setMounted(true);
  }, []);

  const setTheme = (newTheme: Theme) => {
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    applyTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
