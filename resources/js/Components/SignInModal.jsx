import { useForm, Link } from '@inertiajs/react';
import InputError from '@/Components/InputError';

const inputCls = [
    'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white',
    'text-sm text-gray-800 placeholder:text-gray-400',
    'focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500',
    'transition-colors',
].join(' ');

function CloseIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    );
}

function Backdrop({ onClick, children }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 sm:px-6">
            <div
                className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClick}
            />
            <div className="relative z-10 w-full">
                {children}
            </div>
        </div>
    );
}

export default function SignInModal({ show, onClose, onSwitchToSignUp }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    if (!show) return null;

    function submit(e) {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    }

    function handleSwitchToSignUp(e) {
        e.preventDefault();
        onClose();
        if (onSwitchToSignUp) onSwitchToSignUp();
    }

    return (
        <Backdrop onClick={onClose}>
            <div
                className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 min-h-[480px]">
                    {/* Left panel — green branding */}
                    <div className="relative bg-gradient-to-br from-green-400 to-green-600 p-10 flex-col justify-end overflow-hidden hidden md:flex">
                        {/* Decorative circles */}
                        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full border-[3px] border-white/15" />
                        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full border-[3px] border-white/15" />
                        <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full border-[3px] border-white/10" />
                        <div className="absolute top-6 left-6">
                            <span className="text-white/80 text-sm font-semibold tracking-wide uppercase">Hapag</span>
                        </div>

                        <div>
                            <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
                                Welcome<br />back to the<br />table.
                            </h2>
                            <p className="text-white/80 text-sm leading-relaxed max-w-xs">
                                Sign in to pick up where you left off — your favorite restaurants and orders are waiting.
                            </p>
                        </div>
                    </div>

                    {/* Right panel — form */}
                    <div className="relative p-8 md:p-10 flex flex-col justify-center">
                        {/* Close button */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
                        >
                            <CloseIcon />
                        </button>

                        {/* Header */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-extrabold text-gray-800">Sign In</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Sign in to your account to continue ordering from your favorite Laguna restaurants.
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            {/* Email */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={inputCls}
                                    placeholder="e.g. johndoe@email.com"
                                    autoFocus
                                    autoComplete="username"
                                />
                                <InputError message={errors.email} className="mt-1" />
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-semibold text-gray-500">Password</label>
                                    <Link
                                        href={route('password.request')}
                                        className="text-xs font-semibold text-green-500 hover:text-green-600 transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className={inputCls}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                />
                                <InputError message={errors.password} className="mt-1" />
                            </div>

                            {/* Remember me */}
                            <div className="flex items-center gap-2.5">
                                <input
                                    id="remember-modal"
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-500 cursor-pointer"
                                />
                                <label htmlFor="remember-modal" className="text-xs text-gray-500 cursor-pointer select-none">
                                    Remember me
                                </label>
                            </div>

                            {/* Submit */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-3 rounded-xl bg-gray-800 text-white text-sm font-bold hover:bg-gray-900 transition-colors disabled:opacity-50"
                                >
                                    {processing ? 'Signing in\u2026' : 'Sign In'}
                                </button>
                            </div>

                            {/* Switch to Sign Up */}
                            <p className="text-center text-xs text-gray-500 pt-1">
                                Don't have an account?{' '}
                                <button
                                    type="button"
                                    onClick={handleSwitchToSignUp}
                                    className="font-semibold text-gray-800 hover:text-green-600 transition-colors underline"
                                >
                                    Sign Up
                                </button>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </Backdrop>
    );
}
