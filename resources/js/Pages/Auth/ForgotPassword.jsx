import { useForm, Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    function submit(e) {
        e.preventDefault();
        post(route('password.email'));
    }

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <h2 className="text-xl font-bold text-gray-800 mb-1">Forgot your password?</h2>
            <p className="text-sm text-gray-500 mb-6">
                No problem. Enter your email and we'll send you a reset link.
            </p>

            {status && (
                <div className="mb-4 text-sm text-green-600 bg-green-100 border border-green-200 rounded-md px-4 py-3">
                    {status}
                </div>
            )}

            <form onSubmit={submit} noValidate>
                <div className="mb-5">
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1"
                        autoFocus
                        placeholder="e.g. juan@email.com"
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-1" />
                </div>

                <PrimaryButton className="w-full justify-center py-2.5" disabled={processing}>
                    {processing ? 'Sending…' : 'Email Password Reset Link'}
                </PrimaryButton>
            </form>
        </GuestLayout>
    );
}
