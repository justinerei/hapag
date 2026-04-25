import { Link, Head } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <>
            <Head title="Hapag" />
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-10 px-4">
                <Link href="/" className="mb-6 text-center">
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
                        🍽️ Hapag
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Good food, right to your table.</p>
                </Link>

                <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-sm px-8 py-8">
                    {children}
                </div>
            </div>
        </>
    );
}
