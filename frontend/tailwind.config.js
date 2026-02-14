/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'z': {
                    // Rich dark backgrounds
                    'bg': '#0f0f0f',
                    'bg-secondary': '#0a0a0a',
                    'surface': '#1a1a1a',
                    'surface-hover': '#272727',
                    'elevated': '#212121',
                    'elevated-hover': '#2d2d2d',
                    'border': '#303030',
                    'border-light': '#3f3f3f',
                    // Text
                    'text': '#f1f1f1',
                    'text-secondary': '#aaaaaa',
                    'text-muted': '#717171',
                    // Chip / Pill
                    'chip': '#272727',
                    'chip-active': '#f1f1f1',
                    'chip-text': '#f1f1f1',
                    'chip-text-active': '#0f0f0f',
                },
                // Premium brand palette
                'brand': {
                    DEFAULT: '#9147ff',
                    light: '#bf94ff',
                    dark: '#772ce8',
                    50: '#f5f0ff',
                    100: '#ede5ff',
                    200: '#d4bfff',
                    300: '#bf94ff',
                    400: '#a970ff',
                    500: '#9147ff',
                    600: '#772ce8',
                    700: '#5c16c5',
                    800: '#41139e',
                    900: '#2c0d6b',
                },
                'accent': {
                    blue: '#2563eb',
                    'blue-light': '#3b82f6',
                    cyan: '#06b6d4',
                    gold: '#f59e0b',
                    'gold-light': '#fbbf24',
                    rose: '#f43f5e',
                    emerald: '#10b981',
                    orange: '#f97316',
                },
                // Premium gradients
                'premium': {
                    start: '#667eea',
                    mid: '#9147ff',
                    end: '#f093fb',
                },
            },
            fontFamily: {
                sans: ['Inter', 'Roboto', 'system-ui', '-apple-system', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-brand': 'linear-gradient(135deg, #9147ff 0%, #2563eb 100%)',
                'gradient-premium': 'linear-gradient(135deg, #667eea 0%, #9147ff 50%, #f093fb 100%)',
                'gradient-gold': 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                'gradient-fire': 'linear-gradient(135deg, #f43f5e 0%, #f97316 100%)',
                'gradient-ocean': 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
                'gradient-aurora': 'linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #9147ff 100%)',
                'gradient-sunset': 'linear-gradient(135deg, #f43f5e 0%, #9147ff 50%, #2563eb 100%)',
                'gradient-surface': 'linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'slide-up': 'slideUp 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                'slide-down': 'slideDown 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                'fade-in': 'fadeIn 0.2s ease-out',
                'scale-in': 'scaleIn 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                'scale-up': 'scaleUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                'shimmer': 'shimmer 2s linear infinite',
                'float': 'float 3s ease-in-out infinite',
                'progress': 'progress 2s ease-in-out infinite',
                'spin-slow': 'spin 3s linear infinite',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(145, 71, 255, 0.3)' },
                    '100%': { boxShadow: '0 0 25px rgba(145, 71, 255, 0.6), 0 0 50px rgba(145, 71, 255, 0.2)' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(8px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-8px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideInRight: {
                    '0%': { transform: 'translateX(16px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                scaleUp: {
                    '0%': { transform: 'scale(0.9)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                bounceIn: {
                    '0%': { transform: 'scale(0.3)', opacity: '0' },
                    '50%': { transform: 'scale(1.05)' },
                    '70%': { transform: 'scale(0.9)' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-6px)' },
                },
                progress: {
                    '0%': { width: '0%' },
                    '50%': { width: '70%' },
                    '100%': { width: '100%' },
                },
            },
            boxShadow: {
                'glow': '0 0 15px rgba(145, 71, 255, 0.3)',
                'glow-lg': '0 0 30px rgba(145, 71, 255, 0.4), 0 0 60px rgba(145, 71, 255, 0.1)',
                'glow-blue': '0 0 15px rgba(37, 99, 235, 0.3)',
                'glow-gold': '0 0 15px rgba(245, 158, 11, 0.3)',
                'premium': '0 8px 32px rgba(0, 0, 0, 0.4)',
                'card': '0 1px 6px rgba(0, 0, 0, 0.2)',
                'elevated': '0 4px 16px rgba(0, 0, 0, 0.3)',
            },
            borderRadius: {
                'xl': '12px',
                '2xl': '16px',
                '3xl': '24px',
            },
        },
    },
    plugins: [],
}
