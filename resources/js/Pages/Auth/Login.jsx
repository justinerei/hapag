import { useForm, Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    function submit(e) {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    }

    return (
        <GuestLayout>
            <Head title="Sign In" />

            {status && (
                <div className="mb-4 text-sm text-green-600 bg-green-100 border border-green-200 rounded-md px-4 py-3">
                    {status}
                </div>
            )}

            <h2 className="text-xl font-bold text-gray-800 mb-1">Welcome back!</h2>
            <p className="text-sm text-gray-500 mb-6">Sign in to continue ordering.</p>

            <form onSubmit={submit} noValidate>
                <div className="mb-4">
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1"
                        autoComplete="username"
                        placeholder="e.g. johndoe@email.com"
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-1" />
                </div>

                <div className="mb-1">
                    <InputLabel htmlFor="password" value="Password" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1"
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-1" />
                </div>

                <div className="text-right mb-4 mt-1">
                    <Link
                        href={route('password.request')}
                        className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                    >
                        Forgot your password?
                    </Link>
                </div>

                <div className="flex items-center gap-2 mb-5">
                    <input
                        id="remember"
                        type="checkbox"
                        name="remember"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-500 cursor-pointer"
                    />
                    <label htmlFor="remember" className="text-xs text-gray-500 cursor-pointer select-none">
                        Remember me
                    </label>
                </div>

                <PrimaryButton className="w-full justify-center py-2.5" disabled={processing}>
                    {processing ? 'Signing in…' : 'Sign In'}
                </PrimaryButton>
            </form>

            <p className="text-center text-xs text-gray-500 mt-5">
                Don't have an account?{' '}
                <Link href={route('register')} className="font-semibold text-blue-500 hover:text-blue-600">
                    Sign Up
                </Link>
            </p>
        </GuestLayout>
    );
}
