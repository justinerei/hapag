import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PHRASES = [
    'Plating your order…',
    'Warming things up…',
    'Almost at the table…',
    'Finding the best bites…',
];

function PulseRing({ delay }) {
    return (
        <motion.div
            className="absolute w-3 h-3 rounded-full pointer-events-none"
            style={{ border: '1px solid rgba(74,222,128,0.45)' }}
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 9, opacity: 0 }}
            transition={{ duration: 2.4, delay, repeat: Infinity, ease: 'easeOut' }}
        />
    );
}

function CenterOrb() {
    return (
        <div className="relative w-32 h-32 flex items-center justify-center">
            <PulseRing delay={0} />
            <PulseRing delay={0.8} />
            <PulseRing delay={1.6} />
            <motion.div
                className="w-3 h-3 rounded-full bg-green-400 relative z-10"
                animate={{ scale: [0.85, 1.15, 0.85] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                    boxShadow: '0 0 20px rgba(74,222,128,0.55), 0 0 6px rgba(249,115,22,0.25)',
                }}
            />
        </div>
    );
}

const WORD_LETTERS = 'hapag'.split('');

export default function PageLoader() {
    const [phraseIndex, setPhraseIndex] = useState(0);

    useEffect(() => {
        const id = setInterval(() => {
            setPhraseIndex(prev => (prev + 1) % PHRASES.length);
        }, 2200);
        return () => clearInterval(id);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            className="fixed inset-0 z-[500] flex flex-col items-center justify-center select-none"
            style={{ background: '#0c0b0a' }}
        >
            {/* Warm amber glow — bottom-center, like candlelight on a dining table */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(ellipse 60% 45% at 50% 65%, rgba(249,115,22,0.09) 0%, transparent 70%)',
                }}
            />
            {/* Cool green glow — upper-center, like a neon restaurant sign */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(ellipse 50% 38% at 50% 38%, rgba(34,197,94,0.07) 0%, transparent 65%)',
                }}
            />

            <CenterOrb />

            {/* Wordmark — letter-by-letter stagger */}
            <div className="flex mt-5" style={{ gap: '0.45em' }}>
                {WORD_LETTERS.map((letter, i) => (
                    <motion.span
                        key={i}
                        className="text-white text-3xl font-light"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.55,
                            delay: 0.12 + i * 0.07,
                            ease: [0.16, 1, 0.3, 1],
                        }}
                    >
                        {letter}
                    </motion.span>
                ))}
            </div>

            {/* Thin scanning progress line */}
            <div
                className="mt-7 rounded-full overflow-hidden"
                style={{ width: 64, height: 1, background: 'rgba(255,255,255,0.06)' }}
            >
                <motion.div
                    className="h-full w-5/12 rounded-full"
                    style={{
                        background:
                            'linear-gradient(90deg, transparent, rgba(74,222,128,0.8), rgba(249,115,22,0.5), transparent)',
                    }}
                    animate={{ x: ['-120%', '350%'] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                />
            </div>

            {/* Cycling phrase */}
            <div className="mt-5 h-[14px] overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={phraseIndex}
                        className="text-center text-[10px] tracking-[0.18em] uppercase"
                        style={{ color: 'rgba(255,255,255,0.22)' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {PHRASES[phraseIndex]}
                    </motion.p>
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
