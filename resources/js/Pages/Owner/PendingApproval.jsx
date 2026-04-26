import { Head, Link, router } from '@inertiajs/react';

function ClockIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}

export default function PendingApproval({ restaurant = null }) {
    function handleLogout(e) {
        e.preventDefault();
        router.post(route('logout'));
    }

    return (
        <>
            <Head title="Waiting for Approval — Hapag" />

            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
                {/* Branding */}
                <div className="mb-10 text-center">
                    <Link href="/" className="inline-block">
                        <span className="text-3xl font-bold text-green-500 tracking-tight">Hapag</span>
                    </Link>
                </div>

                {/* Card */}
                <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-28 h-28 rounded-full bg-orange-50 flex items-center justify-center">
                            <ClockIcon />
                        </div>
                    </div>

                    {/* Status */}
                    <h1 className="text-2xl font-extrabold text-gray-800 mb-3">
                        Waiting for approval
                    </h1>

                    <p className="text-sm text-gray-500 leading-relaxed mb-2">
                        Your restaurant{restaurant?.name ? (
                            <> <span className="font-semibold text-gray-700">"{restaurant.name}"</span></>
                        ) : ''} has been submitted and is currently under review by the Hapag team.
                    </p>

                    <p className="text-sm text-gray-500 leading-relaxed mb-8">
                        This usually takes a short while. Once approved, you'll have full access to your
                        dashboard where you can manage your menu, orders, and vouchers.
                    </p>

                    {/* Status indicator */}
                    <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-3.5 mb-8">
                        <div className="flex items-center justify-center gap-2">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
                            </span>
                            <span className="text-sm font-semibold text-orange-700">Review in progress</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <button
                            onClick={() => router.visit(route('owner.dashboard'))}
                            className="w-full py-2.5 rounded-xl bg-gray-800 text-white text-sm font-bold hover:bg-gray-900 transition-colors"
                        >
                            Check Again
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-semibold hover:bg-gray-200 transition-colors"
                        >
                            Log Out
                        </button>
                    </div>
                </div>

                {/* Footer hint */}
                <p className="mt-6 text-xs text-gray-400 text-center max-w-xs">
                    If you believe this is taking too long, please contact the Hapag admin team for assistance.
                </p>
            </div>
        </>
    );
}
