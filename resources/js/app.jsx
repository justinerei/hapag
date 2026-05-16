// resources/js/app.jsx
import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp, router } from '@inertiajs/react';
import { AnimatePresence } from 'framer-motion';
import { route } from 'ziggy-js';
import PageLoader from '@/Components/PageLoader';

window.route = route;

createInertiaApp({
    // Resolves 'Home/Guest' → resources/js/Pages/Home/Guest.jsx
    resolve: name => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
        return pages[`./Pages/${name}.jsx`];
    },
    setup({ el, App, props }) {
        function Root() {
            const [loading, setLoading] = useState(false);

            useEffect(() => {
                const stopStart  = router.on('start',  () => setLoading(true));
                const stopFinish = router.on('finish', () => setLoading(false));
                return () => {
                    stopStart();
                    stopFinish();
                };
            }, []);

            return (
                <>
                    <AnimatePresence>
                        {loading && <PageLoader key="page-loader" />}
                    </AnimatePresence>
                    <App {...props} />
                </>
            );
        }

        createRoot(el).render(<Root />);
    },
    // Subtle green progress bar alongside the loader
    progress: {
        color: '#22C55E',
    },
});
