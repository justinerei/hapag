import { useEffect } from 'react';
import { Head, router } from '@inertiajs/react';

/**
 * Fallback page for /register URL.
 * The actual sign-up flow is handled via the SignUpModal component
 * on the Guest homepage and other pages. If someone navigates here
 * directly, redirect them to the homepage where the modal will appear.
 */
export default function Register() {
    useEffect(() => {
        router.visit(route('home'), { replace: true });
    }, []);

    return (
        <>
            <Head title="Sign Up — Hapag" />
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-sm text-gray-400">Redirecting...</p>
            </div>
        </>
    );
}
