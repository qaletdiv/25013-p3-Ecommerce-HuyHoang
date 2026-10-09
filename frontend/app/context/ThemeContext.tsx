"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
    theme: Theme;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("light");

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        const preferredTheme =
            savedTheme === "dark" || savedTheme === "light"
                ? savedTheme
                : window.matchMedia("(prefers-color-scheme: dark)").matches
                    ? "dark"
                    : "light";

        setTheme(preferredTheme);
        document.documentElement.classList.toggle("dark", preferredTheme === "dark");
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme((currentTheme) => {
            const nextTheme = currentTheme === "light" ? "dark" : "light";
            localStorage.setItem("theme", nextTheme);
            document.documentElement.classList.toggle("dark", nextTheme === "dark");
            return nextTheme;
        });
    }, []);

    const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }

    return context;
}
