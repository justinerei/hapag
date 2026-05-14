import { useState, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion';

// ── Data ───────────────────────────────────────────────────────────────────────

const FAQS = [
    {
        section: 'Getting started',
        items: [
            {
                q: 'How do I register my restaurant on Hapag?',
                a: 'Create a free account and select "Restaurant owner" during sign-up. Fill in your restaurant details — name, branch location, and operating hours — then submit for review. Our team will verify and approve your listing within 1–3 business days.',
            },
            {
                q: 'What happens after I register?',
                a: 'Your restaurant is set to "Pending" status until an admin approves it. You can still log in, set up your menu, and configure your branch while waiting. Once approved, your restaurant goes live and customers in your municipality can start ordering.',
            },
            {
                q: 'Can I own multiple branches?',
                a: 'Yes. A single owner account can manage multiple branches across different municipalities. Each branch has its own menu, hours, and order queue — all accessible from one dashboard.',
            },
        ],
    },
    {
        section: 'Orders & delivery',
        items: [
            {
                q: 'What order types does Hapag support?',
                a: 'Hapag supports two order types: Cash on Pickup and Cash on Delivery (COD). Both are cash-based — there is no online payment integration. Customers pay upon receiving their order.',
            },
            {
                q: 'How does delivery work?',
                a: "Delivery is handled entirely by your restaurant staff. When a delivery order comes in, you will see the customer's full delivery address and municipality in your dashboard. You dispatch your own rider — Hapag does not provide couriers. A flat delivery fee is charged to the customer at checkout.",
            },
            {
                q: 'Can I set my own delivery fee?',
                a: 'Currently, Hapag applies a flat delivery fee configured at the system level. Custom per-branch delivery fees and zone-based pricing are on our product roadmap.',
            },
        ],
    },
    {
        section: 'Menu & operations',
        items: [
            {
                q: 'How do I manage my menu?',
                a: "From your owner dashboard, you can add new items with names, descriptions, prices, and photos. You can toggle any item's availability on or off in real time — useful when you run out of stock mid-service.",
            },
            {
                q: 'Can I create vouchers or discounts?',
                a: 'Yes. Owners can create vouchers scoped to their specific restaurant. You control the discount type (percentage or fixed amount), minimum order amount, usage limits, and expiry date. Vouchers appear to customers during checkout when they meet the conditions.',
            },
            {
                q: 'How do I update my opening and closing hours?',
                a: 'Opening and closing hours can be updated from your restaurant settings inside the owner dashboard. Changes take effect immediately and are reflected on your public listing.',
            },
        ],
    },
    {
        section: 'Technical & support',
        items: [
            {
                q: 'Is Hapag available outside Laguna?',
                a: 'Currently, Hapag covers 8 municipalities in Laguna province: Santa Cruz, Pagsanjan, Los Baños, Calamba, San Pablo, Bay, Nagcarlan, and Pila. Expansion to neighboring provinces is planned for a future release.',
            },
            {
                q: 'What if I run into a problem with my account or orders?',
                a: "Reach out via the Partnership & Support page or contact the Hapag team directly. For urgent order issues, your customer's contact details are visible in each order card inside your dashboard.",
            },
        ],
    },
];

// ── Animation config ───────────────────────────────────────────────────────────

const ease = [0.16, 1, 0.3, 1];

const fadeUp = {
    hidden:  { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

const stagger = {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

// ── FAQ item ───────────────────────────────────────────────────────────────────

function FaqItem({ q, a }) {
    const [open, setOpen] = useState(false);
    const reduce = useReducedMotion() ?? false;

    return (
        <motion.div variants={fadeUp} className="border-b border-gray-200 last:border-0">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-start justify-between gap-6 py-6 text-left group"
                aria-expanded={open}
            >
                <span className={`text-base font-semibold leading-snug transition-colors duration-150 ${open ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'}`}>
                    {q}
                </span>
                <span className={`mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${open ? 'bg-green-500 rotate-45' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                    <svg width="11" height="11" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                        <path d="M5 1v8M1 5h8" stroke={open ? '#fff' : '#6B7280'} strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </span>
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1, transition: { height: { duration: reduce ? 0.1 : 0.32, ease }, opacity: { duration: 0.2, delay: 0.05 } } }}
                        exit={{ height: 0, opacity: 0, transition: { height: { duration: reduce ? 0.1 : 0.25, ease }, opacity: { duration: 0.15 } } }}
                        style={{ overflow: 'hidden' }}
                    >
                        <p className="text-[15px] text-gray-500 leading-relaxed pb-6 pr-10 max-w-[65ch]">
                            {a}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ── Section block ──────────────────────────────────────────────────────────────

function FaqSection({ section, items, sectionIndex }) {
    const ref    = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-50px' });

    return (
        <motion.div
            ref={ref}
            variants={stagger}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="mb-16"
        >
            <motion.div variants={fadeUp} className="flex items-center gap-4 mb-2">
                <span className="text-sm font-bold tabular-nums text-green-500">
                    {String(sectionIndex + 1).padStart(2, '0')}
                </span>
                <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-gray-500">
                    {section}
                </h2>
            </motion.div>

            <div className="mt-3 border-l-2 border-green-100 pl-6">
                {items.map((item, i) => (
                    <FaqItem key={i} q={item.q} a={item.a} />
                ))}
            </div>
        </motion.div>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function OwnerFAQ({ cartCount = 0 }) {
    const heroRef    = useRef(null);
    const heroInView = useInView(heroRef, { once: true });

    return (
        <CustomerLayout cartCount={cartCount}>
            <Head title="Owner FAQ — Hapag" />

            <div className="min-h-[100dvh] bg-white">

                {/* ── Hero ── */}
                <section className="relative overflow-hidden bg-white">
                    {/* Ambient green glow */}
                    <div
                        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
                        style={{ background: 'radial-gradient(ellipse, rgba(34,197,94,0.07) 0%, transparent 70%)' }}
                        aria-hidden="true"
                    />
                    {/* Dot grid texture */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.45 }}
                        aria-hidden="true"
                    />
                    {/* Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" aria-hidden="true">
                        <span className="text-[14rem] font-extrabold tracking-tighter text-gray-50 leading-none">FAQ</span>
                    </div>

                    <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 text-center">
                        <motion.div
                            ref={heroRef}
                            variants={stagger}
                            initial="hidden"
                            animate={heroInView ? 'visible' : 'hidden'}
                        >
                            <motion.span variants={fadeUp} className="inline-block text-xs font-bold uppercase tracking-[0.18em] text-green-500 mb-5">
                                For restaurant owners
                            </motion.span>
                            <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tighter leading-none mb-6">
                                Owner FAQ
                            </motion.h1>
                            <motion.p variants={fadeUp} className="text-lg text-gray-500 leading-relaxed mx-auto max-w-[52ch]">
                                Everything you need to know about listing your restaurant, managing orders, and running your branch on Hapag.
                            </motion.p>
                            <motion.div variants={fadeUp} className="mt-10 flex items-center justify-center gap-5">
                                <Link
                                    href={route('partnership')}
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-bold tracking-wide transition-all duration-150 active:scale-[0.98] shadow-sm hover:shadow-md hover:shadow-green-500/20"
                                >
                                    Contact us
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="text-sm font-semibold text-gray-500 hover:text-green-600 transition-colors duration-150"
                                >
                                    Register a restaurant
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* ── Divider ── */}
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="h-px bg-gray-100" />
                </div>

                {/* ── FAQ body ── */}
                <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    {FAQS.map((group, i) => (
                        <FaqSection
                            key={group.section}
                            section={group.section}
                            items={group.items}
                            sectionIndex={i}
                        />
                    ))}
                </section>

                {/* ── CTA strip ── */}
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="h-px bg-gray-100" />
                </div>
                <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <p className="text-xl font-bold text-gray-900 mb-2">Still have questions?</p>
                    <p className="text-base text-gray-500 mb-8">Send us a message and we will get back to you.</p>
                    <Link
                        href={route('partnership')}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:border-green-400 hover:text-green-600 transition-all duration-150 active:scale-[0.98]"
                    >
                        Get in touch
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                            <path d="M3 7h8M7.5 3.5 11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Link>
                </section>

            </div>
        </CustomerLayout>
    );
}
