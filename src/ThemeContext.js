import React, { createContext, useState, useMemo, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isLightTheme, setIsLightTheme] = useState(() => {
        const stored = localStorage.getItem('isLightTheme');
        return stored === null ? true : stored === 'true';
    });

    const toggleTheme = () => {
        setIsLightTheme((prev) => {
            localStorage.setItem('isLightTheme', !prev);
            return !prev;
        });
    };

    const value = useMemo(() => ({ isLightTheme, toggleTheme }), [isLightTheme]);
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useThemeContext = () => useContext(ThemeContext);
