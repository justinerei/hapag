import { useEffect } from 'react';
import { Head, router } from '@inertiajs/react';

/**
 * Fallback page for /login URL.
 * The actual sign-in flow is handled via the SignInModal component
 * on the Guest homepage and other pages. If someone navigates here
 * directly, redirect them to the homepage where the modal can be opened.
 */
export default function Login() {
    useEffect(() => {
        router.visit(route('home'), { replace: true });
    }, []);

    return (
        <>
            <Head title="Sign In — Hapag" />
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-sm text-gray-400">Redirecting...</p>
            </div>
        </>
    );
}
