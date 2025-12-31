import React, { createContext, useState, useMemo, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Force mapped 'light' theme which is our custom #072423 Teal theme
    const [isLightTheme, setIsLightTheme] = useState(true);

    const toggleTheme = () => {
        setIsLightTheme(prev => !prev);
    };

    const [fontSize, setFontSize] = useState('medium');

    const value = useMemo(() => ({ isLightTheme, toggleTheme, fontSize, setFontSize }), [isLightTheme, fontSize]);
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useThemeContext = () => useContext(ThemeContext);
