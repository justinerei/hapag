import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', ...defaultTheme.fontFamily.sans],
                mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
            },
            colors: {
                hapag: {
                    red:    '#E63946',
                    amber:  '#F4A261',
                    teal:   '#2A9D8F',
                    brown:  '#6B3A2A',
                    ink:    '#1A0F0A',
                    gray:   '#8B7355',
                    cream:  '#FFF8EF',
                    cream2: '#F5ECD7',
                },
            },
        },
    },

    plugins: [forms],
};