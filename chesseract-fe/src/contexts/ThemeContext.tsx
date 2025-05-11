"use client";

import { getLocalStorage, setLocalStorage } from '@/utils/localstorage';
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>('dark');

  // Initialize theme from localStorage or default to 'light'
  useEffect(() => {
    const storedTheme = getLocalStorage('theme') as ThemeType | null;
    
    if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
      setTheme(storedTheme);
    } else {
      // Default to light theme if no valid theme found in localStorage
      setTheme('light');
      setLocalStorage('theme', 'light');
    }
  }, []);

  // Apply theme class to HTML element whenever theme changes
  useEffect(() => {
    const htmlElement = document.documentElement;
    
    // Remove any existing theme classes
    htmlElement.classList.remove('light', 'dark');
    
    // Add the current theme class
    htmlElement.classList.add(theme);
    
    // Store in localStorage for persistence
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Explicitly set theme to a specific value
  const changeTheme = (newTheme: ThemeType) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        toggleTheme, 
        setTheme: changeTheme 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};