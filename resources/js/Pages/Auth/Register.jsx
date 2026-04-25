import { useForm, Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

const MUNICIPALITIES = [
    'Santa Cruz',
    'Pagsanjan',
    'Los Baños',
    'Calamba',
    'San Pablo',
    'Bay',
    'Nagcarlan',
    'Pila',
];

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        municipality: '',
        password: '',
        password_confirmation: '',
        role: 'customer',
    });

    function submit(e) {
        e.preventDefault();
        post(route('register'), { onFinish: () => reset('password', 'password_confirmation') });
    }

    return (
        <GuestLayout>
            <Head title="Create Account" />

            <h2 className="text-xl font-bold text-gray-800 mb-1">Create an account</h2>
            <p className="text-sm text-gray-500 mb-6">Start ordering from restaurants near you.</p>

            <form onSubmit={submit} noValidate>
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                        <InputLabel htmlFor="first_name" value="First Name" />
                        <TextInput
                            id="first_name"
                            type="text"
                            name="first_name"
                            value={data.first_name}
                            className="mt-1"
                            autoComplete="given-name"
                            autoFocus
                            placeholder="Juan"
                            onChange={(e) => setData('first_name', e.target.value)}
                        />
                        <InputError message={errors.first_name} className="mt-1" />
                    </div>
                    <div>
                        <InputLabel htmlFor="last_name" value="Last Name" />
                        <TextInput
                            id="last_name"
                            type="text"
                            name="last_name"
                            value={data.last_name}
                            className="mt-1"
                            autoComplete="family-name"
                            placeholder="dela Cruz"
                            onChange={(e) => setData('last_name', e.target.value)}
                        />
                        <InputError message={errors.last_name} className="mt-1" />
                    </div>
                </div>

                <div className="mb-4">
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1"
                        autoComplete="username"
                        placeholder="e.g. juan@email.com"
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-1" />
                </div>

                <div className="mb-4">
                    <InputLabel htmlFor="municipality" value="Municipality" />
                    <select
                        id="municipality"
                        name="municipality"
                        value={data.municipality}
                        onChange={(e) => setData('municipality', e.target.value)}
                        className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800
                            shadow-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                    >
                        <option value="">— Select your municipality —</option>
                        {MUNICIPALITIES.map((m) => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                    <InputError message={errors.municipality} className="mt-1" />
                </div>

                <div className="mb-4">
                    <InputLabel htmlFor="password" value="Password" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1"
                        autoComplete="new-password"
                        placeholder="Create a password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-1" />
                </div>

                <div className="mb-6">
                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1"
                        autoComplete="new-password"
                        placeholder="Repeat your password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                    />
                    <InputError message={errors.password_confirmation} className="mt-1" />
                </div>

                <PrimaryButton className="w-full justify-center py-2.5" disabled={processing}>
                    {processing ? 'Creating account…' : 'Create Account'}
                </PrimaryButton>
            </form>

            <p className="text-center text-xs text-gray-500 mt-5">
                Already have an account?{' '}
                <Link href={route('login')} className="font-semibold text-blue-500 hover:text-blue-600">
                    Sign In
                </Link>
            </p>
        </GuestLayout>
    );
}
