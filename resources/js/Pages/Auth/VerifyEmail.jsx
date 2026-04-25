import { useForm, Head, router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import PrimaryButton from '@/Components/PrimaryButton';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    function resend(e) {
        e.preventDefault();
        post(route('verification.send'));
    }

    return (
        <GuestLayout>
            <Head title="Verify Email" />

            <h2 className="text-xl font-bold text-gray-800 mb-1">Verify your email</h2>
            <p className="text-sm text-gray-500 mb-4">
                Thanks for signing up! Before getting started, please verify your email address
                by clicking the link we sent you. If you didn't receive it, we can send another.
            </p>

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-sm text-green-600 bg-green-100 border border-green-200 rounded-md px-4 py-3">
                    A new verification link has been sent to your email address.
                </div>
            )}

            <div className="flex items-center justify-between mt-2">
                <form onSubmit={resend}>
                    <PrimaryButton disabled={processing}>
                        {processing ? 'Sending…' : 'Resend Verification Email'}
                    </PrimaryButton>
                </form>

                <button
                    type="button"
                    onClick={() => router.post(route('logout'))}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                    Log Out
                </button>
            </div>
        </GuestLayout>
    );
}
