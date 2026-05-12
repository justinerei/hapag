import { useRef } from 'react';
import { Link } from '@inertiajs/react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

/* ── Footer nav link (Inertia) ────────────────────────────────────────────── */

function FLink({ href, children }) {
    const cls = 'relative group inline-block text-gray-400 hover:text-green-400 transition-colors duration-150 text-sm leading-relaxed';
    const underline = (
        <span className="absolute -bottom-px left-0 h-px w-0 bg-green-400 group-hover:w-full transition-all duration-200" aria-hidden="true" />
    );
    return <Link href={href} className={cls}>{children}{underline}</Link>;
}

/* ── Footer action button (opens modal) ───────────────────────────────────── */

function FButton({ onClick, children }) {
    const cls = 'relative group inline-block text-gray-400 hover:text-green-400 transition-colors duration-150 text-sm leading-relaxed cursor-pointer';
    const underline = (
        <span className="absolute -bottom-px left-0 h-px w-0 bg-green-400 group-hover:w-full transition-all duration-200" aria-hidden="true" />
    );
    return (
        <button type="button" onClick={onClick} className={cls}>
            {children}{underline}
        </button>
    );
}

/* ── Column heading ───────────────────────────────────────────────────────── */

function ColHead({ children }) {
    return (
        <h4 className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500 mb-5">
            {children}
        </h4>
    );
}

/* ── Main footer ──────────────────────────────────────────────────────────── */

export default function Footer({ onSignIn, onSignUp }) {
    const footerRef = useRef(null);
    const reduce = useReducedMotion() ?? false;
    const inView = useInView(footerRef, { once: true, margin: '-60px' });

    const container = {
        hidden: {},
        show: {
            transition: {
                staggerChildren: reduce ? 0 : 0.08,
                delayChildren: reduce ? 0 : 0.05,
            },
        },
    };

    const col = {
        hidden: { opacity: 0, y: reduce ? 0 : 18 },
        show: {
            opacity: 1,
            y: 0,
            transition: { duration: reduce ? 0.1 : 0.45, ease: [0.16, 1, 0.3, 1] },
        },
    };

    return (
        <footer
            ref={footerRef}
            style={{ background: '#141210' }}
            className="text-white relative overflow-hidden"
        >
            {/* Green accent separator */}
            <div className="h-px bg-gradient-to-r from-transparent via-green-500/40 to-transparent" />

            {/* Watermark */}
            <div className="absolute bottom-0 right-4 pointer-events-none select-none leading-none">
                <span className="text-[7rem] font-extrabold tracking-tighter text-white/[0.03]">
                    hapag
                </span>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate={inView ? 'show' : 'hidden'}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-10 lg:gap-8 mb-12"
                >
                    {/* ── Brand ── */}
                    <motion.div variants={col}>
                        <div className="mb-3">
                            <span className="text-[22px] font-extrabold text-green-400 tracking-[-0.02em] leading-none">
                                hapag
                            </span>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed mb-1">
                            Your next meal is waiting.
                        </p>
                        <p className="text-xs text-gray-600">
                            Serving Laguna province, Philippines.
                        </p>
                    </motion.div>

                    {/* ── Explore ── */}
                    <motion.div variants={col}>
                        <ColHead>Explore</ColHead>
                        <ul className="space-y-3">
                            <li><FLink href={route('home')}>Home</FLink></li>
                            <li><FLink href={route('restaurants.index')}>Browse restaurants</FLink></li>
                            {onSignIn && <li><FButton onClick={onSignIn}>Sign in</FButton></li>}
                            {onSignUp && <li><FButton onClick={onSignUp}>Create account</FButton></li>}
                        </ul>
                    </motion.div>

                    {/* ── For restaurants ── */}
                    <motion.div variants={col}>
                        <ColHead>For restaurants</ColHead>
                        <ul className="space-y-3">
                            {onSignUp && <li><FButton onClick={onSignUp}>Register your restaurant</FButton></li>}
                            {onSignIn && <li><FButton onClick={onSignIn}>Owner login</FButton></li>}
                            <li><FLink href={route('owners.faq')}>Owner FAQ</FLink></li>
                            <li><FLink href={route('partnership')}>Partnership enquiries</FLink></li>
                        </ul>
                    </motion.div>
                </motion.div>

                {/* ── Bottom bar ── */}
                <div className="border-t border-white/[0.06] pt-6">
                    <p className="text-xs text-gray-600">
                        &copy; {new Date().getFullYear()} Hapag. For educational use only. &nbsp;·&nbsp; LSPU ITEL 203
                    </p>
                </div>
            </div>
        </footer>
    );
}
