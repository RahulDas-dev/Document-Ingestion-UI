import { createContext } from 'react';

import { useEffect, useState, ReactNode, useCallback } from 'react';

export interface ThemeContextType {
    isDark: boolean;
    toggleTheme: () => void;
}

// Provide default values to avoid undefined context
export const ThemeContext = createContext<ThemeContextType>({
    isDark: false,
    toggleTheme: () => { },
});


// Apply initial theme before React hydration
const getInitialTheme = () => {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = saved ? saved === 'dark' : prefersDark;
  
  // Apply theme immediately
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  return isDark;
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(getInitialTheme);

  // Force theme application whenever isDark changes
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setIsDark(prevDark => {
      const newDark = !prevDark;
      localStorage.setItem('theme', newDark ? 'dark' : 'light');
      return newDark;
    });
  }, []);

  // Re-apply theme when isDark changes (in case of system preference change)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (!localStorage.getItem('theme')) {
        setIsDark(mediaQuery.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}