// resources/js/app.jsx
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';

createInertiaApp({
    // Resolves 'Home/Guest' → resources/js/Pages/Home/Guest.jsx
    resolve: name => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
        return pages[`./Pages/${name}.jsx`];
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    // Optional: show progress bar during navigation
    progress: {
        color: '#22C55E', // hapag green-500
    },
});