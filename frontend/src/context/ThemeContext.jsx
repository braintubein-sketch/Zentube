import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setThemeState] = useState(() => {
        const saved = localStorage.getItem('zentube_theme');
        if (saved) return saved;
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    });

    const [resolvedTheme, setResolvedTheme] = useState('dark');

    useEffect(() => {
        const root = document.documentElement;

        const applyTheme = (t) => {
            if (t === 'system') {
                const systemPref = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
                root.setAttribute('data-theme', systemPref);
                root.classList.toggle('dark', systemPref === 'dark');
                root.classList.toggle('light', systemPref === 'light');
                setResolvedTheme(systemPref);
            } else {
                root.setAttribute('data-theme', t);
                root.classList.toggle('dark', t === 'dark');
                root.classList.toggle('light', t === 'light');
                setResolvedTheme(t);
            }
            // Update meta theme-color for mobile browsers
            const meta = document.querySelector('meta[name="theme-color"]');
            const resolved = t === 'system'
                ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
                : t;
            if (meta) meta.setAttribute('content', resolved === 'dark' ? '#0f0f0f' : '#ffffff');
        };

        applyTheme(theme);
        localStorage.setItem('zentube_theme', theme);

        // Listen for system theme changes
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = () => applyTheme('system');
            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
        }
    }, [theme]);

    const setTheme = (newTheme) => {
        setThemeState(newTheme);
    };

    const toggleTheme = () => {
        setThemeState(prev => {
            if (prev === 'dark') return 'light';
            if (prev === 'light') return 'dark';
            return 'dark';
        });
    };

    const isDark = resolvedTheme === 'dark';

    const value = {
        theme,
        resolvedTheme,
        isDark,
        setTheme,
        toggleTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
