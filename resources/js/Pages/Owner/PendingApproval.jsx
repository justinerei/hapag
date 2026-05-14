import { Head } from '@inertiajs/react';

export default function PendingApproval({ restaurant }) {
    return (
        <>
            <Head title="Pending Approval — Hapag" />

            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm max-w-md w-full p-10 text-center">

                    {/* Icon */}
                    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mx-auto mb-6">
                        <svg
                            className="w-10 h-10 text-green-500"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                            />
                        </svg>
                    </div>

                    {/* Heading */}
                    <h1 className="text-2xl font-bold text-gray-800 mb-1">
                        Under Review
                    </h1>
                    <p className="text-sm font-medium text-green-500 mb-6">
                        {restaurant.name}
                        {restaurant.municipality ? ` — ${restaurant.municipality}` : ''}
                    </p>

                    {/* Body */}
                    <p className="text-gray-500 text-sm leading-relaxed mb-8">
                        We're reviewing your restaurant application. Our team will verify your
                        details and notify you once your listing is approved and live on Hapag.
                    </p>

                    {/* Status pill */}
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 border border-amber-200 text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        Awaiting Admin Approval
                    </span>
                </div>
            </div>
        </>
    );
}
