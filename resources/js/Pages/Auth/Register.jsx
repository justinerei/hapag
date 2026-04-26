import { useState, useEffect } from 'react';
import { useForm, Head, Link, router } from '@inertiajs/react';
import InputError from '@/Components/InputError';

const MUNICIPALITIES = [
    'Santa Cruz', 'Pagsanjan', 'Los Baños', 'Calamba',
    'San Pablo', 'Bay', 'Nagcarlan', 'Pila',
];

const inputCls = [
    'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white',
    'text-sm text-gray-800 placeholder:text-gray-400',
    'focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500',
    'transition-colors',
].join(' ');

// ── Icons ─────────────────────────────────────────────────────────────────────

function CartIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
    );
}

function StoreIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    );
}

// ── Backdrop ──────────────────────────────────────────────────────────────────

function Backdrop({ onClick, children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
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

// ── Step 1: Role Selection Modal ─────────────────────────────────────────────

function RoleSelectionModal({ onSelect, onClose }) {
    return (
        <Backdrop onClick={onClose}>
            <div
                className="max-w-2xl mx-auto bg-gray-50 rounded-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <div className="flex justify-end p-4 pb-0">
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 transition-colors"
                    >
                        <CloseIcon />
                    </button>
                </div>

                {/* Heading */}
                <div className="text-center px-8 pb-2">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 leading-tight">
                        What brings you to{' '}
                        <span className="text-green-500">Hapag</span>?
                    </h2>
                    <p className="text-gray-500 mt-2 text-sm">
                        We'll tailor your experience to fit your needs.
                    </p>
                </div>

                {/* Role cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-8 pt-6">
                    <button
                        onClick={() => onSelect('customer')}
                        className="group bg-white rounded-2xl border-2 border-gray-200 hover:border-green-400 p-8 text-left transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                    >
                        <div className="flex items-center gap-4">
                            <CartIcon />
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 group-hover:text-green-600 transition-colors">
                                    Customer
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Order and pick up some food!
                                </p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => onSelect('owner')}
                        className="group bg-white rounded-2xl border-2 border-gray-200 hover:border-green-400 p-8 text-left transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                    >
                        <div className="flex items-center gap-4">
                            <StoreIcon />
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 group-hover:text-green-600 transition-colors">
                                    Resto Owner
                                </h3>
                                <p className="text-sm text-gray-500">
                                    List your restaurant and manage orders.
                                </p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </Backdrop>
    );
}

// ── Step 2: Registration Form Modal (Split-screen) ──────────────────────────

function RegistrationFormModal({ role, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        municipality: '',
        password: '',
        password_confirmation: '',
        role: role,
    });

    function submit(e) {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
            // Inertia follows the server redirect automatically:
            // - Customer -> home (with flash.registered = true -> welcome modal)
            // - Owner -> owner.setup (shows success modal then restaurant form)
        });
    }

    const isCustomer = role === 'customer';

    return (
        <Backdrop onClick={onClose}>
            <div
                className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 min-h-[560px]">
                    {/* Left panel — green branding */}
                    <div className="relative bg-gradient-to-br from-green-400 to-green-600 p-10 flex-col justify-end overflow-hidden hidden md:flex">
                        {/* Decorative circles */}
                        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full border-[3px] border-white/15" />
                        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full border-[3px] border-white/15" />
                        <div className="absolute top-6 left-6">
                            <span className="text-white/80 text-sm font-semibold tracking-wide uppercase">Hapag</span>
                        </div>

                        <div>
                            <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
                                {isCustomer
                                    ? <>Your next<br />meal is<br />waiting.</>
                                    : <>Bring your<br />kitchen<br />online.</>
                                }
                            </h2>
                            <p className="text-white/80 text-sm leading-relaxed max-w-xs">
                                {isCustomer
                                    ? 'Browse menus, place orders, and pick up food from your favorite Laguna restaurants.'
                                    : 'List your restaurant, manage your menu, and start receiving orders from local customers.'
                                }
                            </p>
                        </div>
                    </div>

                    {/* Right panel — form */}
                    <div className="relative p-8 md:p-10 flex flex-col justify-center overflow-y-auto max-h-[85vh]">
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
                        >
                            <CloseIcon />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-2xl font-extrabold text-gray-800">
                                Create Your Account
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {isCustomer
                                    ? 'Enter your personal data to create your account'
                                    : "Set up your personal account first \u2014 your restaurant details come next."
                                }
                            </p>
                        </div>

                        <div className="space-y-4">
                            {/* Name fields */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">First Name</label>
                                    <input
                                        type="text"
                                        value={data.first_name}
                                        onChange={(e) => setData('first_name', e.target.value)}
                                        className={inputCls}
                                        placeholder="e.g. John"
                                        autoFocus
                                    />
                                    <InputError message={errors.first_name} className="mt-1" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Last Name</label>
                                    <input
                                        type="text"
                                        value={data.last_name}
                                        onChange={(e) => setData('last_name', e.target.value)}
                                        className={inputCls}
                                        placeholder="e.g. Doe"
                                    />
                                    <InputError message={errors.last_name} className="mt-1" />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={inputCls}
                                    placeholder="e.g. johndoe@email.com"
                                />
                                <InputError message={errors.email} className="mt-1" />
                            </div>

                            {/* Municipality — customer only */}
                            {isCustomer && (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Municipality</label>
                                    <select
                                        value={data.municipality}
                                        onChange={(e) => setData('municipality', e.target.value)}
                                        className={inputCls}
                                    >
                                        <option value="">— Select your municipality —</option>
                                        {MUNICIPALITIES.map((m) => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.municipality} className="mt-1" />
                                </div>
                            )}

                            {/* Password */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Password</label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className={inputCls}
                                    placeholder="Enter your password"
                                />
                                <InputError message={errors.password} className="mt-1" />
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Confirm Password</label>
                                <input
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className={inputCls}
                                    placeholder="Re-enter your password"
                                />
                                <InputError message={errors.password_confirmation} className="mt-1" />
                            </div>

                            {/* Submit */}
                            <div className="pt-1">
                                <button
                                    onClick={submit}
                                    disabled={processing}
                                    className="w-full py-3 rounded-xl bg-gray-800 text-white text-sm font-bold hover:bg-gray-900 transition-colors disabled:opacity-50"
                                >
                                    {processing
                                        ? 'Creating account\u2026'
                                        : isCustomer ? 'Sign Up' : 'Continue'
                                    }
                                </button>
                            </div>

                            <p className="text-center text-xs text-gray-500">
                                Already have an account?{' '}
                                <Link href={route('login')} className="font-semibold text-gray-800 hover:text-green-600 transition-colors underline">
                                    Login
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Backdrop>
    );
}

// ── Main Register Page ───────────────────────────────────────────────────────

export default function Register() {
    // Steps: 'role' -> 'form'
    // After form submit, Inertia follows server redirect:
    //   Customer -> /home (shows welcome modal via flash)
    //   Owner -> /owner/setup (shows success modal then restaurant form)
    const [step, setStep] = useState('role');
    const [selectedRole, setSelectedRole] = useState(null);

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    function handleRoleSelect(role) {
        setSelectedRole(role);
        setStep('form');
    }

    function handleClose() {
        // Navigate back — if came from Guest page, go home. Otherwise go back.
        if (window.history.length > 1) {
            window.history.back();
        } else {
            router.visit(route('home'));
        }
    }

    return (
        <>
            <Head title="Sign Up \u2014 Hapag" />

            {/* Background visible behind the modal overlay */}
            <div className="min-h-screen bg-gray-50" />

            {step === 'role' && (
                <RoleSelectionModal
                    onSelect={handleRoleSelect}
                    onClose={handleClose}
                />
            )}

            {step === 'form' && selectedRole && (
                <RegistrationFormModal
                    role={selectedRole}
                    onClose={handleClose}
                />
            )}
        </>
    );
}
