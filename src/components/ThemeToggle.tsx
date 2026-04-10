/**
 * @file ThemeToggle.tsx
 * @description Provides a UI element to switch the application between Light and Dark themes. 
 * Manipulates the data-theme attribute on the root HTML element and persists user preference.
 */

import React, { useEffect, useState } from "react";

const MoonIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
);

const SunIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
);

/**
 * Default Theme Toggle Component
 * @returns {JSX.Element} A button that switches between Moon and Sun icons based on active theme
 */
function ThemeToggle() {
    const [theme, setTheme] = useState("light");

    // Initialize theme based on localStorage, default to 'light'
    useEffect(() => {
        const savedTheme = localStorage.getItem("appTheme") || "light";
        setTheme(savedTheme);
        document.documentElement.setAttribute("data-theme", savedTheme);
    }, []);

    /**
     * Toggles the local state and updates the global data attribute and localStorage.
     */
    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("appTheme", newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
    };

    return (
        <button 
            onClick={toggleTheme} 
            style={styles.toggleBtn}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === "light" ? <MoonIcon /> : <SunIcon />}
        </button>
    );
}

const styles = {
    toggleBtn: {
        background: "var(--bg-card)",
        color: "var(--text-primary)",
        border: "1px solid var(--border-color)",
        borderRadius: "6px",
        width: "36px",
        height: "36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: "var(--shadow-sm)"
    }
};

export default ThemeToggle;
