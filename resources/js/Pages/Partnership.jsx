import { useState, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { motion, AnimatePresence, useInView } from 'framer-motion';

// ── Constants ──────────────────────────────────────────────────────────────────

const MUNICIPALITIES = [
    'Santa Cruz', 'Pagsanjan', 'Los Baños', 'Calamba',
    'San Pablo', 'Bay', 'Nagcarlan', 'Pila',
];

const BENEFITS = [
    {
        num: '01',
        title: 'Direct access to local customers',
        body: 'Reach verified customers in your municipality who are actively browsing restaurants and placing orders. No cold traffic — these are people who already want to eat.',
    },
    {
        num: '02',
        title: 'Full control over your menu',
        body: 'Add and remove items, toggle availability in real time, set your own prices, and upload photos — all from a clean owner dashboard built for fast service.',
    },
    {
        num: '03',
        title: 'You run your own delivery',
        body: 'No third-party couriers taking a cut. You dispatch your own staff. Hapag handles the order intake and customer communication while you focus on the food.',
    },
    {
        num: '04',
        title: 'Vouchers and promos on your terms',
        body: 'Create time-limited discount codes scoped to your restaurant. Set minimum spends, usage caps, and expiry dates — or run them indefinitely.',
    },
];

// ── Animation ──────────────────────────────────────────────────────────────────

const ease = [0.16, 1, 0.3, 1];

const fadeUp = {
    hidden:  { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

const stagger = {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

// ── Input component ────────────────────────────────────────────────────────────

function Field({ label, error, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-[0.08em]">
                {label}
            </label>
            {children}
            {error && (
                <p className="text-xs text-red-500">{error}</p>
            )}
        </div>
    );
}

const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400/40 focus:border-green-400 transition-all duration-200';

// ── Benefit item ───────────────────────────────────────────────────────────────

function BenefitItem({ num, title, body }) {
    return (
        <motion.div
            variants={fadeUp}
            whileHover={{ x: 5, transition: { type: 'spring', stiffness: 300, damping: 22 } }}
            className="flex gap-5 items-start cursor-default"
        >
            <div className="shrink-0 w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center mt-0.5">
                <span className="text-sm font-bold tabular-nums text-green-600">{num}</span>
            </div>
            <div>
                <p className="text-base font-bold text-gray-800 mb-1.5 leading-snug">{title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
            </div>
        </motion.div>
    );
}

// ── Success state ──────────────────────────────────────────────────────────────

function SuccessPanel() {
    return (
        <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease }}
            className="flex flex-col items-start justify-center h-full py-8"
        >
            <motion.div
                className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-6"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.15 }}
            >
                <svg width="20" height="20" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path d="M3.5 9.5l3.5 3.5 7-8" stroke="#22C55E" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </motion.div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Inquiry received</h3>
            <p className="text-sm text-gray-500 leading-relaxed max-w-[40ch] mb-7">
                We have received your message and will follow up within 1–2 business days.
            </p>
            <Link
                href={route('owners.faq')}
                className="text-sm font-semibold text-green-600 hover:text-green-700 transition-colors duration-150 inline-flex items-center gap-1.5"
            >
                Read the Owner FAQ
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2.5 6h7M6.5 2.5 10 6l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </Link>
        </motion.div>
    );
}

// ── Contact form ───────────────────────────────────────────────────────────────

function ContactForm() {
    const [fields, setFields] = useState({
        name: '',
        email: '',
        restaurant: '',
        municipality: '',
        message: '',
    });
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const set = (key) => (e) => setFields(f => ({ ...f, [key]: e.target.value }));

    function validate() {
        const errs = {};
        if (!fields.name.trim())       errs.name        = 'Name is required.';
        if (!fields.email.trim())      errs.email       = 'Email is required.';
        else if (!/\S+@\S+\.\S+/.test(fields.email)) errs.email = 'Enter a valid email address.';
        if (!fields.restaurant.trim()) errs.restaurant  = 'Restaurant name is required.';
        if (!fields.municipality)      errs.municipality = 'Select your municipality.';
        if (!fields.message.trim())    errs.message     = 'Message is required.';
        return errs;
    }

    function handleSubmit(e) {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
        }, 900);
    }

    return (
        <AnimatePresence mode="wait">
            {submitted ? (
                <SuccessPanel key="success" />
            ) : (
                <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    noValidate
                    className="flex flex-col gap-5"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <Field label="Full name" error={errors.name}>
                            <input
                                type="text"
                                value={fields.name}
                                onChange={set('name')}
                                placeholder="Maria Santos"
                                className={`${inputCls} ${errors.name ? 'border-red-400 focus:ring-red-400/40 focus:border-red-400' : ''}`}
                            />
                        </Field>
                        <Field label="Email address" error={errors.email}>
                            <input
                                type="email"
                                value={fields.email}
                                onChange={set('email')}
                                placeholder="maria@restaurant.ph"
                                className={`${inputCls} ${errors.email ? 'border-red-400 focus:ring-red-400/40 focus:border-red-400' : ''}`}
                            />
                        </Field>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <Field label="Restaurant name" error={errors.restaurant}>
                            <input
                                type="text"
                                value={fields.restaurant}
                                onChange={set('restaurant')}
                                placeholder="e.g. Lutong Bahay ni Clara"
                                className={`${inputCls} ${errors.restaurant ? 'border-red-400 focus:ring-red-400/40 focus:border-red-400' : ''}`}
                            />
                        </Field>
                        <Field label="Municipality" error={errors.municipality}>
                            <select
                                value={fields.municipality}
                                onChange={set('municipality')}
                                className={`${inputCls} ${errors.municipality ? 'border-red-400 focus:ring-red-400/40 focus:border-red-400' : ''}`}
                            >
                                <option value="">Select municipality</option>
                                {MUNICIPALITIES.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    <Field label="Message" error={errors.message}>
                        <textarea
                            value={fields.message}
                            onChange={set('message')}
                            rows={5}
                            placeholder="Tell us about your restaurant — what you serve, how many branches you have, and anything else you'd like us to know."
                            className={`${inputCls} resize-none leading-relaxed ${errors.message ? 'border-red-400 focus:ring-red-400/40 focus:border-red-400' : ''}`}
                        />
                    </Field>

                    <button
                        type="submit"
                        disabled={loading}
                        className="self-start px-6 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-bold tracking-wider transition-all duration-150 active:scale-[0.98] disabled:opacity-60 shadow-sm hover:shadow-md hover:shadow-green-500/20 flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                Sending
                            </>
                        ) : 'Send inquiry'}
                    </button>
                </motion.form>
            )}
        </AnimatePresence>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function Partnership({ cartCount = 0 }) {
    const heroRef    = useRef(null);
    const heroInView = useInView(heroRef, { once: true });
    const benRef     = useRef(null);
    const benInView  = useInView(benRef, { once: true, margin: '-40px' });
    const formRef    = useRef(null);
    const formInView = useInView(formRef, { once: true, margin: '-40px' });

    return (
        <CustomerLayout cartCount={cartCount}>
            <Head title="Partnership — Hapag" />

            <div className="min-h-[100dvh] bg-gray-50">

                {/* ── Hero ── */}
                <section className="relative overflow-hidden bg-white border-b border-gray-100">
                    {/* Dot grid */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        aria-hidden="true"
                        style={{ backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)', backgroundSize: '28px 28px', opacity: 0.5 }}
                    />
                    {/* Green ambient glow */}
                    <div
                        className="absolute -top-32 -left-32 w-[560px] h-[560px] rounded-full pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)' }}
                        aria-hidden="true"
                    />
                    {/* Watermark */}
                    <div
                        className="absolute right-0 top-0 bottom-0 flex items-center pointer-events-none select-none overflow-hidden"
                        aria-hidden="true"
                    >
                        <span className="text-[10rem] font-extrabold tracking-tighter text-gray-100 leading-none translate-x-12">
                            PARTNER
                        </span>
                    </div>

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
                        <motion.div
                            ref={heroRef}
                            variants={stagger}
                            initial="hidden"
                            animate={heroInView ? 'visible' : 'hidden'}
                        >
                            <motion.span variants={fadeUp} className="inline-block text-xs font-bold uppercase tracking-[0.18em] text-green-500 mb-5">
                                Partnership enquiries
                            </motion.span>
                            <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tighter leading-[0.95] mb-5 max-w-xl">
                                Bring your restaurant to Laguna
                            </motion.h1>
                            <motion.p variants={fadeUp} className="text-lg text-gray-500 leading-relaxed max-w-[52ch]">
                                Join the restaurants already serving customers across 8 Laguna municipalities. Tell us about your business and we will reach out within 1–2 business days.
                            </motion.p>
                        </motion.div>
                    </div>
                </section>

                {/* ── Body: benefits + form ── */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-12 lg:gap-16 items-start">

                        {/* Left: benefits */}
                        <motion.div
                            ref={benRef}
                            variants={stagger}
                            initial="hidden"
                            animate={benInView ? 'visible' : 'hidden'}
                        >
                            <motion.h2 variants={fadeUp} className="text-sm font-bold uppercase tracking-[0.1em] text-gray-400 mb-8">
                                Why list on Hapag
                            </motion.h2>
                            <div className="flex flex-col gap-8">
                                {BENEFITS.map(b => (
                                    <BenefitItem key={b.num} {...b} />
                                ))}
                            </div>

                            <motion.div variants={fadeUp} className="mt-10 pt-8 border-t border-gray-200">
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Already have an account?{' '}
                                    <Link href={route('login')} className="text-green-600 hover:text-green-700 font-semibold transition-colors duration-150">
                                        Sign in
                                    </Link>{' '}
                                    and visit your owner dashboard. Have questions first?{' '}
                                    <Link href={route('owners.faq')} className="text-green-600 hover:text-green-700 font-semibold transition-colors duration-150">
                                        Read the FAQ.
                                    </Link>
                                </p>
                            </motion.div>
                        </motion.div>

                        {/* Right: form */}
                        <motion.div
                            ref={formRef}
                            variants={fadeUp}
                            initial="hidden"
                            animate={formInView ? 'visible' : 'hidden'}
                            className="bg-white rounded-3xl border border-gray-200/60 p-8 sm:p-10 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)]"
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-1">Send an inquiry</h2>
                            <p className="text-sm text-gray-400 mb-8">We reply within 1–2 business days.</p>
                            <ContactForm />
                        </motion.div>

                    </div>
                </section>

            </div>
        </CustomerLayout>
    );
}
