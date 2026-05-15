import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import InputError from '@/Components/InputError';

const inputCls = [
    'w-full px-4 py-3 rounded-xl border border-gray-200 bg-white',
    'text-sm text-gray-800 placeholder:text-gray-400',
    'focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500',
    'transition-all duration-200',
].join(' ');

// ── Shared close button ───────────────────────────────────────────────────────

function CloseBtn({ onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="absolute top-4 right-4 z-20 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 transition-colors"
            aria-label="Close"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    );
}

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

// ── Left-panel food pattern (repeating plate shapes) ─────────────────────────

function FoodPattern() {
    return (
        <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
        >
            <defs>
                <pattern id="hapag-plate-bg" x="0" y="0" width="56" height="56" patternUnits="userSpaceOnUse">
                    <circle cx="28" cy="28" r="12" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5"/>
                    <circle cx="28" cy="28" r="7"  fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
                    <circle cx="28" cy="28" r="2.5" fill="rgba(255,255,255,0.06)"/>
                    <circle cx="6"  cy="6"  r="2"   fill="rgba(255,255,255,0.09)"/>
                    <circle cx="50" cy="50" r="2"   fill="rgba(255,255,255,0.09)"/>
                    <circle cx="50" cy="6"  r="1.5" fill="rgba(255,255,255,0.06)"/>
                    <circle cx="6"  cy="50" r="1.5" fill="rgba(255,255,255,0.06)"/>
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hapag-plate-bg)"/>
        </svg>
    );
}

// ── Role selection step ───────────────────────────────────────────────────────

function RoleSelection({ onSelect, onClose, reduce }) {
    const stagger = {
        hidden: {},
        visible: { transition: { staggerChildren: reduce ? 0 : 0.07, delayChildren: reduce ? 0 : 0.06 } },
    };
    const item = {
        hidden: { opacity: 0, y: reduce ? 0 : 14 },
        visible: { opacity: 1, y: 0, transition: { duration: reduce ? 0.1 : 0.3, ease: 'easeOut' } },
    };

    return (
        <div
            className="relative max-w-lg mx-auto w-full rounded-[20px] overflow-hidden"
            style={{
                background: '#FDFCFA',
                boxShadow: '0 24px 64px -12px rgba(0,0,0,0.22), 0 4px 20px -4px rgba(0,0,0,0.08)',
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <CloseBtn onClick={onClose} />

            <div className="px-8 sm:px-10 pt-10 pb-9">
                <motion.div variants={stagger} initial="hidden" animate="visible">
                    <motion.div variants={item} className="text-center mb-7">
                        <h2 className="text-[22px] font-extrabold text-gray-800 leading-tight">
                            What brings you to{' '}
                            <span className="text-green-500">Hapag</span>?
                        </h2>
                        <p className="text-sm text-gray-500 mt-2">
                            We&apos;ll tailor your experience to fit your needs.
                        </p>
                    </motion.div>

                    <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <motion.button
                            variants={item}
                            onClick={() => onSelect('customer')}
                            className="group bg-white rounded-2xl border-2 border-gray-200 hover:border-green-400 p-7 text-left transition-all duration-200 hover:shadow-md"
                            whileHover={reduce ? undefined : { y: -2 }}
                            transition={{ duration: 0.15 }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-orange-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                            </svg>
                            <h3 className="text-base font-bold text-gray-800 group-hover:text-green-600 transition-colors">Customer</h3>
                            <p className="text-sm text-gray-500 mt-1">Order and pick up some food</p>
                        </motion.button>

                        <motion.button
                            variants={item}
                            onClick={() => onSelect('owner')}
                            className="group bg-white rounded-2xl border-2 border-gray-200 hover:border-green-400 p-7 text-left transition-all duration-200 hover:shadow-md"
                            whileHover={reduce ? undefined : { y: -2 }}
                            transition={{ duration: 0.15 }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-orange-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <h3 className="text-base font-bold text-gray-800 group-hover:text-green-600 transition-colors">Resto Owner</h3>
                            <p className="text-sm text-gray-500 mt-1">List your restaurant and manage orders</p>
                        </motion.button>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}

// ── Registration form step ────────────────────────────────────────────────────

function RegistrationForm({ role, onBack, onClose, onSwitchToSignIn, reduce }) {
    const isCustomer = role === 'customer';
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role,
    });

    function submit(e) {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
            onSuccess: () => window.location.reload(),
        });
    }

    const stagger = {
        hidden: {},
        visible: { transition: { staggerChildren: reduce ? 0 : 0.05, delayChildren: reduce ? 0 : 0.08 } },
    };
    const field = {
        hidden: { opacity: 0, y: reduce ? 0 : 10 },
        visible: { opacity: 1, y: 0, transition: { duration: reduce ? 0.1 : 0.28, ease: 'easeOut' } },
    };

    return (
        <div
            className="max-w-3xl mx-auto w-full rounded-[20px] overflow-hidden"
            style={{
                background: '#FDFCFA',
                boxShadow: '0 24px 64px -12px rgba(0,0,0,0.22), 0 4px 20px -4px rgba(0,0,0,0.08)',
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.25fr] min-h-[540px]">
                {/* Left — green brand panel */}
                <div className="relative bg-green-500 p-9 flex-col justify-between overflow-hidden hidden md:flex">
                    <FoodPattern />

                    {/* Wordmark */}
                    <div className="relative z-10 flex items-center gap-2">
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                            <circle cx="11" cy="11" r="9"   stroke="rgba(255,255,255,0.8)" strokeWidth="1.5"/>
                            <circle cx="11" cy="11" r="5"   stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
                            <circle cx="11" cy="11" r="1.8" fill="rgba(255,255,255,0.8)"/>
                        </svg>
                        <span className="text-sm font-bold text-white/85 tracking-[0.02em]">hapag</span>
                    </div>

                    {/* Tagline */}
                    <div className="relative z-10">
                        <h2 className="text-[28px] font-extrabold text-white leading-[1.2] mb-3">
                            {isCustomer ? (
                                <>Your next<br />meal is<br />waiting.</>
                            ) : (
                                <>Bring your<br />kitchen<br />online.</>
                            )}
                        </h2>
                        <p className="text-white/70 text-sm leading-relaxed max-w-[220px]">
                            {isCustomer
                                ? 'Browse menus, place orders, and pick up food from your favorite Laguna restaurants.'
                                : 'List your restaurant, manage your menu, and start receiving orders from local customers.'
                            }
                        </p>
                    </div>
                </div>

                {/* Right — form */}
                <div className="relative p-8 sm:p-10 flex flex-col justify-center overflow-y-auto max-h-[92vh]">
                    {/* Back button */}
                    <button
                        type="button"
                        onClick={onBack}
                        className="absolute top-4 left-4 z-20 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 transition-colors"
                        aria-label="Back"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <CloseBtn onClick={onClose} />

                    {/* Step hint — only shown for owner (2-step flow) */}
                    {!isCustomer && (
                        <div className="mb-5">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-green-600 bg-green-50 border border-green-200/60 rounded-full px-3 py-1">
                                <span
                                    className="flex items-center justify-center w-[15px] h-[15px] rounded-full bg-green-500 text-white text-[9px] font-bold leading-none"
                                    aria-hidden="true"
                                >
                                    1
                                </span>
                                Step 1 of 2 — Account details
                            </span>
                        </div>
                    )}

                    <div className="mb-5">
                        <h2 className="text-[20px] font-extrabold text-gray-800">Create your account</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {isCustomer
                                ? 'Enter your details to get started'
                                : 'Set up your personal account — restaurant details come next'
                            }
                        </p>
                    </div>

                    {/* ── Google button (NEW) — only shown for customer signup ── */}
                    {isCustomer && (
                        <>
                            <div className="mb-4">
                                <GoogleButton label="Sign up with Google" />
                            </div>
                            <OrDivider />
                            <div className="mb-4" />
                        </>
                    )}

                    <form onSubmit={submit}>
                        <motion.div
                            className="space-y-4"
                            variants={stagger}
                            initial="hidden"
                            animate="visible"
                        >
                            {/* Name row */}
                            <motion.div variants={field} className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">First name</label>
                                    <input
                                        type="text"
                                        value={data.first_name}
                                        onChange={(e) => setData('first_name', e.target.value)}
                                        className={inputCls}
                                        placeholder="e.g. Juan"
                                        autoFocus
                                        autoComplete="given-name"
                                    />
                                    <InputError message={errors.first_name} className="mt-1" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Last name</label>
                                    <input
                                        type="text"
                                        value={data.last_name}
                                        onChange={(e) => setData('last_name', e.target.value)}
                                        className={inputCls}
                                        placeholder="e.g. dela Cruz"
                                        autoComplete="family-name"
                                    />
                                    <InputError message={errors.last_name} className="mt-1" />
                                </div>
                            </motion.div>

                            <motion.div variants={field}>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email address</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={inputCls}
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                />
                                <InputError message={errors.email} className="mt-1" />
                            </motion.div>

                            <motion.div variants={field}>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={inputCls}
                                        placeholder="Create a password"
                                        autoComplete="new-password"
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
                                <InputError message={errors.password} className="mt-1" />
                            </motion.div>

                            <motion.div variants={field}>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Confirm password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className={inputCls}
                                        placeholder="Re-enter your password"
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm((v) => !v)}
                                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                        aria-label={showConfirm ? 'Hide password' : 'Show password'}
                                        tabIndex={-1}
                                    >
                                        {showConfirm ? (
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
                                <InputError message={errors.password_confirmation} className="mt-1" />
                            </motion.div>

                            <motion.div variants={field} className="pt-1">
                                <motion.button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-3 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-colors disabled:opacity-50"
                                    whileTap={reduce ? undefined : { scale: 0.97 }}
                                    transition={{ duration: 0.1 }}
                                >
                                    {processing
                                        ? 'Creating account…'
                                        : isCustomer ? 'Create account' : 'Continue'
                                    }
                                </motion.button>
                            </motion.div>

                            <motion.p variants={field} className="text-center text-xs text-gray-500">
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    onClick={onSwitchToSignIn}
                                    className="font-semibold text-green-600 hover:text-green-700 transition-colors"
                                >
                                    Login
                                </button>
                            </motion.p>
                        </motion.div>
                    </form>
                </div>
            </div>
        </div>
    );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function SignUpModal({ show, onClose, onSwitchToSignIn }) {
    const reduce = useReducedMotion() ?? false;
    const [step, setStep] = useState('role');
    const [selectedRole, setSelectedRole] = useState(null);

    function handleClose() {
        setStep('role');
        setSelectedRole(null);
        onClose();
    }

    function handleRoleSelect(role) {
        setSelectedRole(role);
        setStep('form');
    }

    function handleBack() {
        setStep('role');
        setSelectedRole(null);
    }

    function handleSwitchToSignIn() {
        handleClose();
        onSwitchToSignIn?.();
    }

    const stepAnim = {
        initial: { opacity: 0, scale: reduce ? 1 : 0.95, y: reduce ? 0 : 10 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit:    { opacity: 0, scale: reduce ? 1 : 0.96, y: reduce ? 0 : -8 },
        transition: { duration: reduce ? 0.1 : 0.25, ease: [0.16, 1, 0.3, 1] },
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
                        onClick={handleClose}
                        aria-hidden="true"
                    />

                    {/* Step transitions */}
                    <AnimatePresence mode="wait">
                        {step === 'role' ? (
                            <motion.div key="role-step" className="relative z-10 w-full" {...stepAnim}>
                                <RoleSelection
                                    onSelect={handleRoleSelect}
                                    onClose={handleClose}
                                    reduce={reduce}
                                />
                            </motion.div>
                        ) : (
                            <motion.div key="form-step" className="relative z-10 w-full" {...stepAnim}>
                                <RegistrationForm
                                    role={selectedRole}
                                    onBack={handleBack}
                                    onClose={handleClose}
                                    onSwitchToSignIn={handleSwitchToSignIn}
                                    reduce={reduce}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
