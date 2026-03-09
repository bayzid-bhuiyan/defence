import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme) return savedTheme;
    return 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-bs-theme', theme);
    root.setAttribute('data-theme', theme); 
    localStorage.setItem('app-theme', theme);
    document.body.style.transition = 'background-color 0.3s ease-in-out, color 0.3s ease-in-out';
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};