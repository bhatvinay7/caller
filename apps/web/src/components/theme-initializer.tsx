"use client";
import {useTheme} from "../hooks/useTheme";
import { useEffect } from "react";

export default function ThemeInitializer({ children }: { children: React.ReactNode }) {
    const {theme, toggle } = useTheme();

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    return <>{children}</>;
}
