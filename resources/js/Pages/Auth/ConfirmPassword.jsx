import { useForm, Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({ password: '' });

    function submit(e) {
        e.preventDefault();
        post(route('password.confirm'), { onFinish: () => reset('password') });
    }

    return (
        <GuestLayout>
            <Head title="Confirm Password" />

            <h2 className="text-xl font-bold text-gray-800 mb-1">Confirm your password</h2>
            <p className="text-sm text-gray-500 mb-6">
                This is a secure area. Please confirm your password before continuing.
            </p>

            <form onSubmit={submit} noValidate>
                <div className="mb-6">
                    <InputLabel htmlFor="password" value="Password" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1"
                        autoFocus
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-1" />
                </div>

                <PrimaryButton className="w-full justify-center py-2.5" disabled={processing}>
                    {processing ? 'Confirming…' : 'Confirm'}
                </PrimaryButton>
            </form>
        </GuestLayout>
    );
}
