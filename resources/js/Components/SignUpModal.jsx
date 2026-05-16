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

function CloseBtn({ onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="absolute top-4 right-4 z-20 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    );
}

function GoogleButton({ label = 'Continue with Google', role = null }) {
    const href = role ? `${route('auth.google')}?role=${role}` : route('auth.google');
    return (
        <a
            href={href}
            className={[
                'flex items-center justify-center gap-3 w-full',
                'px-4 py-3 rounded-xl border border-gray-200 bg-white',
                'text-sm font-semibold text-gray-700',
                'hover:bg-gray-50 hover:border-gray-300',
                'transition-all duration-200 shadow-sm hover:shadow',
            ].join(' ')}
        >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
            </svg>
            {label}
        </a>
    );
}

function OrDivider() {
    return (
        <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs font-medium text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
        </div>
    );
}

function EyeOpen() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    );
}

function EyeOff() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.223-3.592M6.53 6.533A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7a10.05 10.05 0 01-4.132 5.411M3 3l18 18" />
        </svg>
    );
}

/* Top-down dining table illustration for the left panel */
function DiningIllustration() {
    return (
        <svg
            viewBox="0 0 220 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full max-w-[200px]"
            aria-hidden="true"
        >
            {/* Table surface glow */}
            <circle cx="110" cy="155" r="88" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5"/>

            {/* Outer plate rim */}
            <circle cx="110" cy="155" r="62" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"/>

            {/* Inner plate */}
            <circle cx="110" cy="155" r="50" fill="rgba(255,255,255,0.1)"/>

            {/* Food mound */}
            <ellipse cx="110" cy="155" rx="32" ry="20" fill="rgba(255,255,255,0.16)"/>
            <ellipse cx="100" cy="150" rx="12" ry="7" fill="rgba(255,255,255,0.12)"/>
            <ellipse cx="118" cy="153" rx="10" ry="6" fill="rgba(255,255,255,0.10)"/>
            <ellipse cx="109" cy="163" rx="9" ry="5" fill="rgba(255,255,255,0.09)"/>

            {/* Steam lines */}
            <path d="M96 93 C94.5 86 97.5 81 96 74" stroke="rgba(255,255,255,0.38)" strokeWidth="2" strokeLinecap="round"/>
            <path d="M110 90 C108.5 83 111.5 78 110 71" stroke="rgba(255,255,255,0.38)" strokeWidth="2" strokeLinecap="round"/>
            <path d="M124 93 C122.5 86 125.5 81 124 74" stroke="rgba(255,255,255,0.38)" strokeWidth="2" strokeLinecap="round"/>

            {/* Fork (left of plate) */}
            <rect x="37" y="108" width="3" height="90" rx="1.5" fill="rgba(255,255,255,0.28)"/>
            <rect x="31" y="108" width="1.8" height="28" rx="0.9" fill="rgba(255,255,255,0.28)"/>
            <rect x="35.5" y="108" width="1.8" height="28" rx="0.9" fill="rgba(255,255,255,0.28)"/>
            <rect x="40" y="108" width="1.8" height="28" rx="0.9" fill="rgba(255,255,255,0.28)"/>
            <rect x="44.5" y="108" width="1.8" height="28" rx="0.9" fill="rgba(255,255,255,0.28)"/>
            <path d="M31 136 Q38.5 142 46.5 136" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" fill="none"/>

            {/* Spoon (right of plate) */}
            <ellipse cx="183" cy="122" rx="10" ry="13" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5"/>
            <rect x="181" y="135" width="4" height="63" rx="2" fill="rgba(255,255,255,0.28)"/>

            {/* Decorative dots */}
            <circle cx="62" cy="68" r="3.5" fill="rgba(255,255,255,0.18)"/>
            <circle cx="158" cy="72" r="2.5" fill="rgba(255,255,255,0.14)"/>
            <circle cx="176" cy="218" r="3" fill="rgba(255,255,255,0.14)"/>
            <circle cx="42" cy="228" r="4" fill="rgba(255,255,255,0.12)"/>
            <circle cx="192" cy="148" r="2.5" fill="rgba(255,255,255,0.16)"/>
            <circle cx="27" cy="160" r="2" fill="rgba(255,255,255,0.16)"/>

            {/* Sparkle stars */}
            <path d="M165 88 L166.8 84 L168.6 88 L172 89.8 L168.6 91.6 L166.8 95.6 L165 91.6 L161.6 89.8 Z" fill="rgba(255,255,255,0.22)"/>
            <path d="M52 235 L53.4 231.8 L54.8 235 L58 236.4 L54.8 237.8 L53.4 241 L52 237.8 L48.8 236.4 Z" fill="rgba(255,255,255,0.18)"/>
            <path d="M188 100 L189 97.6 L190 100 L192.4 101 L190 102 L189 104.4 L188 102 L185.6 101 Z" fill="rgba(255,255,255,0.16)"/>

            {/* Small rice grain dots on food */}
            <ellipse cx="104" cy="148" rx="3.5" ry="2" fill="rgba(255,255,255,0.2)" transform="rotate(-20 104 148)"/>
            <ellipse cx="113" cy="145" rx="3.5" ry="2" fill="rgba(255,255,255,0.18)" transform="rotate(10 113 145)"/>
            <ellipse cx="120" cy="156" rx="3" ry="1.8" fill="rgba(255,255,255,0.18)" transform="rotate(-15 120 156)"/>
            <ellipse cx="100" cy="161" rx="3" ry="1.8" fill="rgba(255,255,255,0.16)" transform="rotate(25 100 161)"/>
        </svg>
    );
}

/* Role selection step */
function RoleSelection({ onSelect, onClose, reduce }) {
    const stagger = {
        hidden: {},
        visible: { transition: { staggerChildren: reduce ? 0 : 0.08, delayChildren: reduce ? 0 : 0.05 } },
    };
    const item = {
        hidden: { opacity: 0, y: reduce ? 0 : 16 },
        visible: { opacity: 1, y: 0, transition: { duration: reduce ? 0.1 : 0.32, ease: 'easeOut' } },
    };

    return (
        <div
            className="relative max-w-[480px] mx-auto w-full rounded-[24px] overflow-hidden"
            style={{
                background: '#FDFCFA',
                boxShadow: '0 24px 64px -12px rgba(0,0,0,0.22), 0 4px 20px -4px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)',
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <CloseBtn onClick={onClose} />

            <div className="px-8 sm:px-10 pt-10 pb-9">
                <motion.div variants={stagger} initial="hidden" animate="visible">
                    {/* Heading */}
                    <motion.div variants={item} className="mb-8">
                        <h2 className="text-[22px] font-extrabold text-gray-900 tracking-tight leading-tight justify-center items-center flex">
                            How will you use Hapag?
                        </h2>
                        <p className="text-sm text-gray-500 mt-2 text-center">
                            Pick what fits you best. You can always reach out  if you <br />need both.
                        </p>
                    </motion.div>

                    {/* Role cards */}
                    <motion.div variants={stagger} className="flex flex-col gap-3">

                        {/* Customer */}
                        <motion.button
                            variants={item}
                            onClick={() => onSelect('customer')}
                            className="group relative flex items-center gap-5 rounded-2xl bg-white border-2 border-gray-200 hover:border-green-400 p-5 text-left transition-all duration-200 hover:shadow-md"
                            whileHover={reduce ? undefined : { y: -1 }}
                            whileTap={reduce ? undefined : { scale: 0.98 }}
                            transition={{ duration: 0.15 }}
                        >
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-bold text-gray-800 group-hover:text-green-600 transition-colors leading-tight">I want to order food</h3>
                                <p className="text-sm text-gray-500 mt-0.5">Browse restaurants and place orders</p>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 flex-shrink-0 group-hover:text-green-400 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </motion.button>

                        {/* Owner — secondary, outlined */}
                        <motion.button
                            variants={item}
                            onClick={() => onSelect('owner')}
                            className="group relative flex items-center gap-5 rounded-2xl bg-white border-2 border-gray-200 hover:border-green-400 p-5 text-left transition-all duration-200 hover:shadow-md"
                            whileHover={reduce ? undefined : { y: -1 }}
                            whileTap={reduce ? undefined : { scale: 0.98 }}
                            transition={{ duration: 0.15 }}
                        >
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-bold text-gray-800 group-hover:text-green-600 transition-colors leading-tight">I own a restaurant</h3>
                                <p className="text-sm text-gray-500 mt-0.5">List your place and manage orders</p>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 flex-shrink-0 group-hover:text-green-400 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </motion.button>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}

/* Registration form step */
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
            className="max-w-3xl mx-auto w-full rounded-[24px] overflow-hidden"
            style={{
                background: '#FDFCFA',
                boxShadow: '0 24px 64px -12px rgba(0,0,0,0.22), 0 4px 20px -4px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)',
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.3fr] min-h-[560px]">

                {/* Left — brand panel */}
                <div className="relative bg-green-500 p-8 flex-col justify-between overflow-hidden hidden md:flex">
                    {/* Ambient background blobs */}
                    <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-green-400/30 blur-3xl pointer-events-none" aria-hidden="true"/>
                    <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-green-600/30 blur-3xl pointer-events-none" aria-hidden="true"/>

                    {/* Wordmark */}
                    <div className="relative z-10 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                            <img src="/images/favicon_dark.png" alt="" aria-hidden="true" className="w-4 h-4 object-contain" />
                        </div>
                        <span className="text-sm font-bold text-white/90 tracking-[0.04em]">hapag</span>
                    </div>

                    {/* Center illustration */}
                    <div className="relative z-10 flex justify-center my-auto py-4">
                        <DiningIllustration />
                    </div>

                    {/* Tagline */}
                    <div className="relative z-10">
                        <h2 className="text-[26px] font-extrabold text-white leading-[1.15] mb-3" style={{ textWrap: 'balance' }}>
                            {isCustomer ? (
                                <>Your next meal<br />is a tap away.</>
                            ) : (
                                <>Bring your<br />kitchen online.</>
                            )}
                        </h2>
                        <p className="text-white/65 text-[13px] leading-relaxed">
                            {isCustomer
                                ? 'Browse menus from Laguna\'s best restaurants and order for pickup or delivery.'
                                : 'List your restaurant, manage your menu, and start receiving orders from local customers.'
                            }
                        </p>
                    </div>
                </div>

                {/* Right — form */}
                <div className="relative px-7 sm:px-9 pt-14 pb-9 flex flex-col justify-center overflow-y-auto max-h-[92dvh]">
                    {/* Back button */}
                    <button
                        type="button"
                        onClick={onBack}
                        className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        aria-label="Back"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>

                    <CloseBtn onClick={onClose} />

                    {/* Step badge — only for owner (2-step flow) */}
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

                    <div className="mb-6">
                        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Create your account</h2>
                        <p className="text-sm text-gray-500 mt-1.5">
                            {isCustomer
                                ? 'Enter your details to get started.'
                                : 'Set up your personal account — restaurant details come next.'
                            }
                        </p>
                    </div>

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
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">First name</label>
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
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Last name</label>
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

                            {/* Email */}
                            <motion.div variants={field}>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email address</label>
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

                            {/* Password */}
                            <motion.div variants={field}>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
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
                                        {showPassword ? <EyeOff /> : <EyeOpen />}
                                    </button>
                                </div>
                                <InputError message={errors.password} className="mt-1" />
                            </motion.div>

                            {/* Confirm password */}
                            <motion.div variants={field}>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirm password</label>
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
                                        {showConfirm ? <EyeOff /> : <EyeOpen />}
                                    </button>
                                </div>
                                <InputError message={errors.password_confirmation} className="mt-1" />
                            </motion.div>

                            {/* Submit */}
                            <motion.div variants={field} className="pt-1">
                                <motion.button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-3.5 rounded-xl bg-green-500 text-white text-sm font-bold tracking-wide hover:bg-green-600 transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-lg hover:shadow-green-500/25"
                                    whileTap={reduce ? undefined : { scale: 0.97 }}
                                    transition={{ duration: 0.1 }}
                                >
                                    {processing
                                        ? 'Creating account…'
                                        : isCustomer ? 'Create account' : 'Continue'
                                    }
                                </motion.button>
                            </motion.div>

                            {/* Or divider + Google */}
                            <motion.div variants={field}>
                                <OrDivider />
                            </motion.div>

                            <motion.div variants={field}>
                                <GoogleButton label="Sign up with Google" role={role} />
                            </motion.div>

                            {/* Switch to sign in */}
                            <motion.p variants={field} className="text-center text-xs text-gray-400">
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    onClick={onSwitchToSignIn}
                                    className="font-semibold text-green-600 hover:text-green-700 transition-colors"
                                >
                                    Sign in
                                </button>
                            </motion.p>
                        </motion.div>
                    </form>
                </div>
            </div>
        </div>
    );
}

/* Main export */
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
        setStep('role');
        setSelectedRole(null);
        onSwitchToSignIn?.();
    }

    const stepAnim = {
        initial: { opacity: 0, scale: reduce ? 1 : 0.95, y: reduce ? 0 : 12 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit:    { opacity: 0, scale: reduce ? 1 : 0.96, y: reduce ? 0 : -8 },
        transition: { duration: reduce ? 0.1 : 0.26, ease: [0.16, 1, 0.3, 1] },
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
                            background: 'rgba(10,10,10,0.52)',
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
