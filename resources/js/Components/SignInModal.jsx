import { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import InputError from '@/Components/InputError';

const inputCls = [
    'w-full px-4 py-3 rounded-xl border border-gray-200 bg-white',
    'text-sm text-gray-800 placeholder:text-gray-400',
    'focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500',
    'transition-all duration-200',
].join(' ');

// ── Google Sign-In Button ─────────────────────────────────────────────────────

function GoogleButton({ label = 'Continue with Google' }) {
    return (
        <a
            href={route('auth.google')}
            className={[
                'flex items-center justify-center gap-3 w-full',
                'px-4 py-3 rounded-xl border border-gray-200 bg-white',
                'text-sm font-semibold text-gray-700',
                'hover:bg-gray-50 hover:border-gray-300',
                'transition-all duration-200 shadow-sm hover:shadow',
            ].join(' ')}
        >
            {/* Official Google "G" logo */}
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path
                    d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
                    fill="#4285F4"
                />
                <path
                    d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
                    fill="#34A853"
                />
                <path
                    d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
                    fill="#FBBC05"
                />
                <path
                    d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
                    fill="#EA4335"
                />
            </svg>
            {label}
        </a>
    );
}

// ── Divider ───────────────────────────────────────────────────────────────────

function OrDivider() {
    return (
        <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs font-medium text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
        </div>
    );
}

function HapagMark() {
    return (
        <div className="flex flex-col items-center gap-1 mb-3">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                <circle cx="20" cy="20" r="17" stroke="#22C55E" strokeWidth="2"/>
                <circle cx="20" cy="20" r="10" stroke="#22C55E" strokeWidth="1.5"/>
                <circle cx="20" cy="20" r="3.5" fill="#22C55E"/>
            </svg>
            <span className="text-[23px] font-extrabold text-gray-900 tracking-[-0.03em] leading-none">hapag</span>
            <p className="text-[9px] font-semibold text-gray-400 tracking-[0.12em] uppercase">
                Good food, right to your table
            </p>
        </div>
    );
}

export default function SignInModal({ show, onClose, onSwitchToSignUp }) {
    const reduce = useReducedMotion() ?? false;

    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    function submit(e) {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
            onSuccess: () => window.location.reload(),
        });
    }

    function handleSwitch(e) {
        e.preventDefault();
        onClose();
        onSwitchToSignUp?.();
    }

    const cardAnim = {
        hidden: { opacity: 0, scale: reduce ? 1 : 0.95, y: reduce ? 0 : 10 },
        visible: {
            opacity: 1, scale: 1, y: 0,
            transition: { duration: reduce ? 0.1 : 0.25, ease: [0.16, 1, 0.3, 1] },
        },
        exit: {
            opacity: 0, scale: reduce ? 1 : 0.96, y: reduce ? 0 : -6,
            transition: { duration: reduce ? 0.1 : 0.18, ease: 'easeIn' },
        },
    };

    const stagger = {
        hidden: {},
        visible: { transition: { staggerChildren: reduce ? 0 : 0.05, delayChildren: reduce ? 0 : 0.1 } },
    };

    const field = {
        hidden: { opacity: 0, y: reduce ? 0 : 10 },
        visible: { opacity: 1, y: 0, transition: { duration: reduce ? 0.1 : 0.28, ease: 'easeOut' } },
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduce ? 0.1 : 0.2 }}
                >
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background: 'rgba(10,10,10,0.5)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                        }}
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    {/* Card */}
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Sign in"
                        className="relative z-10 w-full max-w-[400px]"
                        variants={cardAnim}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className="relative rounded-[20px] overflow-hidden"
                            style={{
                                background: '#FDFCFA',
                                boxShadow: '0 20px 60px -12px rgba(0,0,0,0.18), 0 4px 20px -4px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.05)',
                            }}
                        >
                            {/* Green accent strip */}
                            <div className="h-[3px] bg-gradient-to-r from-green-400 via-green-500 to-green-400" />

                            {/* Close */}
                            <button
                                type="button"
                                onClick={onClose}
                                className="absolute top-4 right-4 z-20 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 transition-colors"
                                aria-label="Close sign-in dialog"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <div className="px-8 pt-7 pb-7">
                                <div className="text-center mb-5">
                                    <h2 className="text-[22px] font-extrabold text-gray-900 tracking-tight">Welcome back</h2>
                                    <p className="text-sm text-gray-400 mt-1">Sign in to continue ordering</p>
                                </div>

                                {/* ── Google button (NEW) ── */}
                                <div className="mb-4">
                                    <GoogleButton label="Continue with Google" />
                                </div>

                                <OrDivider />

                                <form onSubmit={submit} className="mt-4">
                                    <motion.div
                                        className="space-y-4"
                                        variants={stagger}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        <motion.div variants={field}>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                                                Email address
                                            </label>
                                            <input
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className={inputCls}
                                                placeholder="you@example.com"
                                                autoFocus
                                                autoComplete="username"
                                            />
                                            <InputError message={errors.email} className="mt-1.5" />
                                        </motion.div>

                                        <motion.div variants={field}>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                                                Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    className={inputCls}
                                                    placeholder="Enter your password"
                                                    autoComplete="current-password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword((v) => !v)}
                                                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                                    tabIndex={-1}
                                                >
                                                    {showPassword ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.223-3.592M6.53 6.533A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7a10.05 10.05 0 01-4.132 5.411M3 3l18 18" />
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between mt-1.5 min-h-[16px]">
                                                <InputError message={errors.password} />
                                                <Link
                                                    href={route('password.request')}
                                                    className="text-xs font-medium text-green-500 hover:text-green-600 transition-colors ml-auto"
                                                >
                                                    Forgot password?
                                                </Link>
                                            </div>
                                        </motion.div>

                                        <motion.div variants={field} className="flex items-center gap-2.5 pt-0.5">
                                            <input
                                                id="remember-modal"
                                                type="checkbox"
                                                checked={data.remember}
                                                onChange={(e) => setData('remember', e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-500 cursor-pointer"
                                            />
                                            <label
                                                htmlFor="remember-modal"
                                                className="text-xs text-gray-500 cursor-pointer select-none"
                                            >
                                                Keep me signed in
                                            </label>
                                        </motion.div>

                                        <motion.div variants={field} className="pt-1">
                                            <motion.button
                                                type="submit"
                                                disabled={processing}
                                                className="w-full py-3.5 rounded-xl bg-green-500 text-white text-sm font-bold tracking-wide hover:bg-green-600 transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-lg hover:shadow-green-500/20"
                                                whileTap={reduce ? undefined : { scale: 0.97 }}
                                                transition={{ duration: 0.1 }}
                                            >
                                                {processing ? 'Signing in…' : 'Sign in'}
                                            </motion.button>
                                        </motion.div>

                                        <motion.p variants={field} className="text-center text-xs text-gray-400 pb-0.5">
                                            Don&apos;t have an account?{' '}
                                            <button
                                                type="button"
                                                onClick={handleSwitch}
                                                className="font-semibold text-green-600 hover:text-green-700 transition-colors"
                                            >
                                                Sign up
                                            </button>
                                        </motion.p>
                                    </motion.div>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
