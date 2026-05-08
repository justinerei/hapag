import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomerLayout from '@/Layouts/CustomerLayout';

// ── Constants ─────────────────────────────────────────────────────────────────

const CUISINE_IMAGES = {
    'Filipino':   'https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=200&h=200&fit=crop',
    'BBQ':        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop',
    'Ihaw':       'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop',
    'Cafe':       'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop',
    'Coffee':     'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop',
    'Bakery':     'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop',
    'Fast Food':  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop',
    'Desserts':   'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200&h=200&fit=crop',
    'Dessert':    'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200&h=200&fit=crop',
};

const WEATHER_THEME = {
    rainy: {
        emoji: '🌧️',
        text: 'Warm up with hot soups, comfort food, and hot drinks.',
        gradient: 'linear-gradient(135deg, #1a3352 0%, #2c4a6e 45%, #3b6d9c 100%)',
        accent: '#7ec8e3',
        tagBg: 'rgba(126,200,227,0.18)',
        tagText: '#bde8f5',
        ctaText: 'Find comfort food',
    },
    cloudy: {
        emoji: '☁️',
        text: 'A cloudy day calls for freshly baked goods and pastries.',
        gradient: 'linear-gradient(135deg, #374151 0%, #64748b 45%, #7d8fa0 100%)',
        accent: '#d4e4ef',
        tagBg: 'rgba(212,228,239,0.2)',
        tagText: '#e2edf5',
        ctaText: 'Browse bakeries',
    },
    cool: {
        emoji: '🍃',
        text: 'Cool weather is perfect for grilled meats and hearty meals.',
        gradient: 'linear-gradient(135deg, #064e3b 0%, #0f766e 45%, #14967e 100%)',
        accent: '#a0e8d8',
        tagBg: 'rgba(160,232,216,0.18)',
        tagText: '#b8f0e2',
        ctaText: 'Order grilled dishes',
    },
    hot: {
        emoji: '☀️',
        text: 'Beat the heat with cold desserts and refreshing drinks.',
        gradient: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 45%, #d97706 100%)',
        accent: '#fcd49a',
        tagBg: 'rgba(252,212,154,0.2)',
        tagText: '#fde9c0',
        ctaText: 'Find cool drinks',
    },
};

function getCuisineImage(name) {
    for (const [key, url] of Object.entries(CUISINE_IMAGES)) {
        if (name.includes(key)) return url;
    }
    return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop';
}

function csrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.content ?? '';
}

function fmt(price) {
    return '₱' + Number(price).toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// ── Scrollable Row ────────────────────────────────────────────────────────────

function ScrollableRow({ children, className = '', gap = 'gap-4' }) {
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 2);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        checkScroll();
        el.addEventListener('scroll', checkScroll, { passive: true });
        const ro = new ResizeObserver(checkScroll);
        ro.observe(el);
        return () => { el.removeEventListener('scroll', checkScroll); ro.disconnect(); };
    }, [checkScroll]);

    const scroll = (dir) => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollBy({ left: dir === 'left' ? -(el.clientWidth * 0.7) : el.clientWidth * 0.7, behavior: 'smooth' });
    };

    return (
        <div className="relative group/scroll">
            {canScrollLeft && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:shadow-xl transition-all opacity-0 group-hover/scroll:opacity-100"
                    aria-label="Scroll left"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            )}
            <div ref={scrollRef} className={`flex ${gap} overflow-x-auto ${className}`} style={{ scrollbarWidth: 'none' }}>
                {children}
            </div>
            {canScrollRight && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:shadow-xl transition-all opacity-0 group-hover/scroll:opacity-100"
                    aria-label="Scroll right"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            )}
        </div>
    );
}

// ── Restaurant Card ───────────────────────────────────────────────────────────

function RestaurantCard({ restaurant, hasPromo, isFavorited, onFavoriteToggle }) {
    return (
        <Link href={route('restaurants.show', restaurant.id)} className="group block">
            <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden rounded-2xl">
                {restaurant.image_url ? (
                    <img
                        src={restaurant.image_url}
                        alt={restaurant.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                        <span className="text-5xl">{restaurant.category?.icon ?? '🍽️'}</span>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {hasPromo && (
                    <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-sm">
                        PROMO
                    </span>
                )}

                <button
                    type="button"
                    onClick={(e) => onFavoriteToggle(restaurant.id, e)}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${isFavorited ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"
                         fill={isFavorited ? 'currentColor' : 'none'}
                         viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                </button>
            </div>

            <div className="mt-3">
                <h3 className="font-bold text-gray-800 text-sm leading-tight truncate group-hover:text-green-600 transition-colors duration-200">
                    {restaurant.name}{restaurant.municipality ? ` – ${restaurant.municipality}` : ''}
                </h3>
                <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    5–15 min
                </p>
            </div>
        </Link>
    );
}

// ── Weather Item Card ─────────────────────────────────────────────────────────

function WeatherItemCard({ item, onAdd }) {
    return (
        <div
            className="shrink-0 w-52 rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 hover:-translate-y-1"
            style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
            }}
        >
            <div className="aspect-[4/3] bg-white/5 overflow-hidden">
                {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl opacity-60">🍽️</div>
                )}
            </div>
            <div className="p-4">
                <p className="text-white font-bold text-xs leading-tight truncate">{item.name}</p>
                <p className="text-white/50 text-[10px] truncate mt-0.5">{item.restaurant?.name}</p>
                <div className="flex items-center justify-between mt-3">
                    <span className="text-white font-extrabold text-sm">{fmt(item.price)}</span>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onAdd(item.id, item.restaurant?.name ?? ''); }}
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-95"
                        style={{ background: 'rgba(255,255,255,0.2)' }}
                        title="Add to cart"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Voucher Ticket Card ───────────────────────────────────────────────────────

function VoucherCard({ deal }) {
    const dr = deal.restaurant;
    const isGlobal = !dr;
    const discLabel = deal.type === 'percentage'
        ? `${Number(deal.value).toFixed(0)}%`
        : `₱${Number(deal.value).toLocaleString('en-PH', { maximumFractionDigits: 0 })}`;
    const href = dr ? route('restaurants.show', dr.id) : route('restaurants.index');

    return (
        <Link href={href} className="shrink-0 w-[300px] group">
            <div className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className={`h-2 w-full ${isGlobal ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-orange-400 to-orange-600'}`} />

                <div className="flex">
                    <div className="flex-1 p-5 pr-3">
                        <div className="flex items-center gap-1.5 mb-2.5">
                            {isGlobal ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-600 border border-green-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    ALL RESTAURANTS
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-100 max-w-full truncate">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                    </svg>
                                    <span className="truncate">{dr.name}</span>
                                </span>
                            )}
                        </div>

                        <p className="font-bold text-gray-800 text-sm leading-tight">
                            {deal.type === 'percentage'
                                ? `${Number(deal.value).toFixed(0)}% off your order`
                                : `₱${Number(deal.value).toFixed(0)} off your order`}
                        </p>
                        <p className="text-gray-400 text-[11px] mt-1.5 leading-relaxed">
                            {deal.min_order_amount ? `Min. order ${fmt(deal.min_order_amount)}` : 'No minimum order'}
                            {deal.expires_at && ` · Exp. ${new Date(deal.expires_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}`}
                        </p>

                        <div className="mt-3.5">
                            <span className="inline-block text-[11px] font-bold text-green-600 tracking-widest uppercase bg-green-50 border border-green-100 px-2.5 py-1 rounded-lg">
                                {deal.code}
                            </span>
                        </div>
                    </div>

                    <div className="relative flex items-center justify-center w-[90px] shrink-0">
                        <div className="absolute left-0 top-4 bottom-4 w-px border-l border-dashed border-gray-200" />
                        <div className="absolute left-[-6px] top-[-1px] w-3 h-3 rounded-full bg-gray-50 border border-gray-100" />
                        <div className="absolute left-[-6px] bottom-[-1px] w-3 h-3 rounded-full bg-gray-50 border border-gray-100" />

                        <div className="text-center">
                            <span className={`block text-3xl font-extrabold leading-none ${isGlobal ? 'text-green-500' : 'text-orange-500'}`}>
                                {discLabel}
                            </span>
                            <span className={`block text-[10px] font-bold uppercase tracking-widest mt-1 ${isGlobal ? 'text-green-400' : 'text-orange-400'}`}>
                                OFF
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

// ── AI Chat Widget ────────────────────────────────────────────────────────────

function AIChatWidget() {
    const [open, setOpen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [addingId, setAddingId] = useState(null);
    const inputRef = useRef(null);
    const bodyRef = useRef(null);

    useEffect(() => {
        if (open && inputRef.current) inputRef.current.focus();
    }, [open]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!prompt.trim() || loading) return;
        setLoading(true);
        setResult(null);
        setError('');
        try {
            const res = await fetch(route('ai.recommend'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken() },
                body: JSON.stringify({ prompt: prompt.trim() }),
            });
            const data = await res.json();
            if (res.ok) {
                if (data.dishes && data.dishes.length > 0) {
                    setResult({ intro: data.intro || '', dishes: data.dishes });
                } else if (data.intro) {
                    setResult({ intro: data.intro, dishes: [] });
                } else if (data.recommendation) {
                    setResult({ intro: data.recommendation, dishes: [] });
                } else {
                    setError('No recommendations found. Try a different craving.');
                }
            } else {
                setError(data.error || 'Something went wrong.');
            }
        } catch {
            setError('Could not connect. Try again.');
        }
        setLoading(false);
        setTimeout(() => bodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 100);
    }

    async function quickAdd(dishId) {
        setAddingId(dishId);
        try {
            const res = await fetch(route('cart.add'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken() },
                body: JSON.stringify({ menu_item_id: dishId, quantity: 1 }),
            });
            if (res.ok) {
                setAddingId('done-' + dishId);
                setTimeout(() => setAddingId(null), 1500);
            } else if (res.status === 409) {
                setAddingId(null);
                setError('Your cart has items from another restaurant. Clear it first.');
                setTimeout(() => setError(''), 3000);
            }
        } catch {
            setAddingId(null);
        }
    }

    function reset() {
        setResult(null);
        setError('');
        setPrompt('');
    }

    const suggestions = ['Masarap na sabaw', 'Something sweet', 'Budget meal under ₱100', 'Best for rainy day'];

    return (
        <>
            {/* FAB */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 group/fab">
                {/* Tooltip — appears on FAB hover */}
                {!open && (
                    <div className="relative mb-1 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-xl shadow-lg pointer-events-none select-none whitespace-nowrap opacity-0 translate-y-1 group-hover/fab:opacity-100 group-hover/fab:translate-y-0 transition-all duration-200">
                        Ask about dishes
                        <div className="absolute -bottom-1 right-5 w-2.5 h-2.5 bg-gray-900 rotate-45" />
                    </div>
                )}
                <div className="relative">
                    {!open && <div className="fab-ring absolute inset-0 rounded-full" />}
                    <button
                        onClick={() => setOpen(v => !v)}
                        className={`relative w-14 h-14 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center active:scale-95 ${open ? 'bg-gray-700 hover:bg-gray-800' : 'bg-green-500 hover:bg-green-600'} text-white`}
                        aria-label="AI Food Recommender"
                    >
                        {open ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"/></svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Chat panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 8 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed bottom-24 right-6 z-50 w-[390px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
                        style={{ maxHeight: '580px' }}
                    >
                        {/* Header */}
                        <div className="shrink-0 px-5 py-4" style={{ background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)' }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-sm leading-tight">Hapag AI</h3>
                                        <p className="text-white/65 text-[11px]">Tell me what you're craving</p>
                                    </div>
                                </div>
                                {result && (
                                    <button onClick={reset} className="text-white/70 hover:text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/25 hover:border-white/50 transition-colors">
                                        New search
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Body */}
                        <div ref={bodyRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: '220px' }}>
                            {/* Empty state */}
                            {!result && !loading && !error && (
                                <motion.div
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <p className="text-gray-400 text-xs font-medium mb-3">Try asking:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {suggestions.map(s => (
                                            <button
                                                key={s}
                                                onClick={() => setPrompt(s)}
                                                className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-gray-50 text-gray-600 border border-gray-100 hover:bg-green-50 hover:text-green-600 hover:border-green-100 transition-colors"
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Skeleton loading */}
                            {loading && (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex gap-3 p-3 rounded-xl bg-gray-50">
                                            <div className="w-16 h-16 rounded-xl bg-gray-200 shrink-0 animate-pulse" />
                                            <div className="flex-1 space-y-2 py-1">
                                                <div className="h-3 bg-gray-200 rounded-full animate-pulse" style={{ width: `${55 + i * 12}%` }} />
                                                <div className="h-2.5 bg-gray-200 rounded-full animate-pulse" style={{ width: `${40 + i * 8}%` }} />
                                                <div className="h-2.5 bg-gray-200 rounded-full animate-pulse w-1/4" />
                                            </div>
                                        </div>
                                    ))}
                                    <p className="text-center text-xs text-gray-400 pt-1">Finding the best dishes for you…</p>
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <div className="bg-red-50 rounded-xl p-3.5 border border-red-100 flex items-start gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                    <p className="text-red-600 text-xs leading-relaxed">{error}</p>
                                </div>
                            )}

                            {/* Results */}
                            {result && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-3"
                                >
                                    {result.intro && (
                                        <div className="bg-green-50 rounded-xl px-4 py-3 border border-green-100">
                                            <p className="text-gray-700 text-xs leading-relaxed">{result.intro}</p>
                                        </div>
                                    )}

                                    {result.dishes.length > 0 && (
                                        <div className="space-y-2">
                                            {result.dishes.map((dish, idx) => {
                                                const isAdding = addingId === dish.id;
                                                const isDone = addingId === 'done-' + dish.id;
                                                return (
                                                    <motion.div
                                                        key={dish.id}
                                                        initial={{ opacity: 0, y: 8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.3, delay: idx * 0.06 }}
                                                        className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                                                    >
                                                        <Link href={route('restaurants.show', dish.restaurant_id)} className="flex">
                                                            <div className="w-20 h-20 shrink-0 bg-gray-100 overflow-hidden">
                                                                {dish.image_url ? (
                                                                    <img src={dish.image_url} alt={dish.name} className="w-full h-full object-cover" loading="lazy" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 p-3 min-w-0 flex flex-col justify-between">
                                                                <div>
                                                                    <h4 className="text-xs font-bold text-gray-800 leading-tight truncate">{dish.name}</h4>
                                                                    <p className="text-[10px] text-gray-400 truncate mt-0.5">{dish.restaurant_name} · {dish.municipality}</p>
                                                                </div>
                                                                <div className="flex items-center justify-between mt-1.5">
                                                                    <span className="text-xs font-extrabold text-green-600">₱{Number(dish.price).toFixed(0)}</span>
                                                                    {dish.category && <span className="text-[9px] text-gray-300 font-medium">{dish.category}</span>}
                                                                </div>
                                                            </div>
                                                        </Link>
                                                        <div className="border-t border-gray-50 px-3 py-2">
                                                            <button
                                                                type="button"
                                                                disabled={isAdding || isDone}
                                                                onClick={(e) => { e.preventDefault(); quickAdd(dish.id); }}
                                                                className={`w-full py-2 rounded-lg text-[11px] font-bold transition-all active:scale-98 ${
                                                                    isDone
                                                                        ? 'bg-green-50 text-green-600 border border-green-100'
                                                                        : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-green-500 hover:text-white hover:border-green-500'
                                                                } ${isAdding ? 'opacity-60' : ''}`}
                                                            >
                                                                {isDone ? (
                                                                    <span className="flex items-center justify-center gap-1.5">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                                                                        Added to cart
                                                                    </span>
                                                                ) : isAdding ? 'Adding…' : (
                                                                    <span className="flex items-center justify-center gap-1.5">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                                                                        Add to cart
                                                                    </span>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {result.dishes.length === 0 && result.intro && (
                                        <p className="text-gray-400 text-[11px] text-center mt-1 leading-relaxed">No specific dishes matched. Try rephrasing your craving.</p>
                                    )}
                                </motion.div>
                            )}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSubmit} className="border-t border-gray-100 p-3.5 flex gap-2 shrink-0">
                            <input
                                ref={inputRef}
                                type="text"
                                value={prompt}
                                onChange={e => setPrompt(e.target.value)}
                                placeholder="I'm craving…"
                                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
                                maxLength={300}
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading || !prompt.trim()}
                                className="w-11 h-11 rounded-xl bg-green-500 text-white flex items-center justify-center hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shrink-0"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────

function PageStyles() {
    return (
        <style>{`
            @keyframes weatherFloat {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
            }
            @keyframes weatherPulse {
                0%, 100% { opacity: 0.65; }
                50% { opacity: 1; }
            }
            @keyframes sunRays {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes rainDrop {
                0% { transform: translateY(-8px); opacity: 0; }
                50% { opacity: 1; }
                100% { transform: translateY(10px); opacity: 0; }
            }
            @keyframes fabRing {
                0% { transform: scale(1); opacity: 0.55; }
                100% { transform: scale(1.65); opacity: 0; }
            }
            @keyframes cardFadeUp {
                from { opacity: 0; transform: translateY(14px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .weather-float { animation: weatherFloat 4s ease-in-out infinite; }
            .weather-pulse { animation: weatherPulse 3s ease-in-out infinite; }
            .sun-rays { animation: sunRays 22s linear infinite; }
            .rain-drop { animation: rainDrop 1.6s ease-in-out infinite; }
            .rain-drop-2 { animation: rainDrop 1.6s ease-in-out infinite 0.35s; }
            .rain-drop-3 { animation: rainDrop 1.6s ease-in-out infinite 0.7s; }
            .fab-ring {
                background: rgba(34,197,94,0.45);
                animation: fabRing 2s ease-out infinite;
            }
            .card-fade-up {
                animation: cardFadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
            }
        `}</style>
    );
}

// ── Section heading ───────────────────────────────────────────────────────────

function SectionHeading({ title, subtitle, badge }) {
    return (
        <div className="flex items-start justify-between mb-5">
            <div>
                <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">{title}</h2>
                {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
            </div>
            {badge && (
                <span className="shrink-0 text-xs font-bold text-orange-600 bg-orange-50 border border-orange-100 px-3 py-1 rounded-full mt-1">
                    {badge}
                </span>
            )}
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Customer({
    restaurants,
    categories,
    weather,
    weatherTag,
    suggested,
    weatherItems = [],
    deals,
    cartCount,
    promoRestaurantIds,
    popular,
    featuredItemMap,
    favoriteIds,
}) {
    const [search, setSearch] = useState('');
    const [selectedCuisines, setSelectedCuisines] = useState([]);
    const [hasDealsFilter, setHasDealsFilter] = useState(false);
    const [sortBy, setSortBy] = useState('relevance');
    const [favorites, setFavorites] = useState(() => new Set(favoriteIds));
    const [localCartCount, setLocalCartCount] = useState(cartCount);
    const [toast, setToast] = useState(null);
    const [conflict, setConflict] = useState(null);

    const pageProps = usePage().props;
    const [showWelcome, setShowWelcome] = useState(() => !!pageProps?.flash?.registered);

    const toastTimer = useRef(null);
    const gridRef = useRef(null);

    function showToast(message, isError = false) {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast({ message, isError });
        toastTimer.current = setTimeout(() => setToast(null), 2500);
    }

    async function toggleFavorite(restaurantId, e) {
        e.preventDefault();
        e.stopPropagation();
        try {
            const res = await fetch(route('favorites.toggle'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken() },
                body: JSON.stringify({ restaurant_id: restaurantId }),
            });
            if (res.ok) {
                const data = await res.json();
                setFavorites(prev => {
                    const next = new Set(prev);
                    data.favorited ? next.add(restaurantId) : next.delete(restaurantId);
                    return next;
                });
                showToast(data.favorited ? 'Added to favorites.' : 'Removed from favorites.');
            }
        } catch {
            showToast('Could not update favorites.', true);
        }
    }

    async function addToCart(menuItemId, restaurantName) {
        if (!menuItemId) return;
        try {
            const res = await fetch(route('cart.add'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken() },
                body: JSON.stringify({ menu_item_id: menuItemId, quantity: 1 }),
            });
            if (res.status === 409) { setConflict({ menuItemId, restaurantName }); return; }
            if (res.ok) {
                const data = await res.json();
                setLocalCartCount(data.cart_count);
                showToast('Item added to cart.');
            }
        } catch {
            showToast('Could not add to cart.', true);
        }
    }

    async function confirmClearAndAdd() {
        try {
            await fetch(route('cart.clear'), {
                method: 'DELETE',
                headers: { 'X-CSRF-TOKEN': csrfToken() },
            });
        } catch { /* ignore */ }
        const saved = conflict;
        setConflict(null);
        await addToCart(saved.menuItemId, saved.restaurantName);
    }

    function toggleCuisine(catId) {
        setSelectedCuisines(prev =>
            prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
        );
    }

    function handleCuisineCircleClick(catId) {
        setSelectedCuisines([catId]);
        setSearch('');
        setHasDealsFilter(false);
        setTimeout(() => gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }

    function clearFilters() {
        setSearch('');
        setSelectedCuisines([]);
        setHasDealsFilter(false);
        setSortBy('relevance');
    }

    const filteredRestaurants = useMemo(() => {
        let list = [...restaurants];
        if (search) list = list.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
        if (selectedCuisines.length > 0) list = list.filter(r => selectedCuisines.includes(r.category_id));
        if (hasDealsFilter) list = list.filter(r => promoRestaurantIds.includes(r.id));
        return sortBy === 'newest'
            ? list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            : list.sort((a, b) => a.name.localeCompare(b.name));
    }, [restaurants, search, selectedCuisines, hasDealsFilter, sortBy, promoRestaurantIds]);

    const allDeals = deals;

    const wTheme = WEATHER_THEME[weatherTag] ?? WEATHER_THEME.hot;
    const temp = weather ? Math.round(weather.main?.temp ?? 0) : null;
    const condition = weather ? (weather.weather?.[0]?.main ?? '').toLowerCase() : '';
    const city = weather?.name ?? 'Laguna';

    const filterKey = `${search}|${selectedCuisines.join(',')}|${hasDealsFilter}|${sortBy}`;

    return (
        <CustomerLayout cartCount={localCartCount}>
            <Head title="Home — Hapag" />
            <PageStyles />

            {/* ── Welcome Modal ─────────────────────────────────────── */}
            <AnimatePresence>
                {showWelcome && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[300] flex items-center justify-center px-4 py-6"
                    >
                        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowWelcome(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 12 }}
                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                            className="relative z-10 max-w-sm w-full bg-white rounded-2xl shadow-2xl text-center p-10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-center mb-5">
                                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">You're all set</h2>
                            <p className="text-sm text-gray-500 leading-relaxed mb-6">
                                Your account is ready. Start exploring restaurants and ordering your favorite dishes.
                            </p>
                            <button
                                onClick={() => setShowWelcome(false)}
                                className="w-full py-3 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-colors active:scale-98"
                            >
                                Start exploring
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Toast ─────────────────────────────────────────────── */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className={`fixed top-20 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-6 py-3 rounded-2xl shadow-lg text-sm font-bold text-white pointer-events-none ${toast.isError ? 'bg-red-500' : 'bg-green-500'}`}
                    >
                        {toast.isError ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        )}
                        <span>{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Cart conflict modal ───────────────────────────────── */}
            <AnimatePresence>
                {conflict && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                            className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                    </svg>
                                </div>
                                <h3 className="font-bold text-gray-800 text-base leading-tight">Cart has items from another restaurant</h3>
                            </div>
                            <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                                Clear your cart to add items from &ldquo;{conflict.restaurantName}&rdquo;?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConflict(null)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmClearAndAdd}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors active:scale-98"
                                >
                                    Clear &amp; add
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══════════════════════════════════════════════════════
                WEATHER HERO
                ═══════════════════════════════════════════════════════ */}
            {weather && (
                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.7 }}
                    className="relative overflow-hidden"
                    style={{ background: wTheme.gradient, minHeight: '440px' }}
                >
                    {/* SVG Weather Illustration */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {weatherTag === 'hot' && (
                            <svg className="absolute -right-8 -top-8 w-[600px] h-[600px] opacity-40" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="300" cy="200" r="80" fill="url(#sunGrad)" className="sun-rays" style={{ transformOrigin: '300px 200px' }} />
                                <circle cx="300" cy="200" r="130" fill="#fbbf24" opacity="0.12" className="weather-pulse" />
                                <circle cx="300" cy="200" r="175" fill="#fbbf24" opacity="0.07" className="weather-pulse" style={{ animationDelay: '1s' }} />
                                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                                    <line key={i}
                                        x1={300 + 105 * Math.cos(angle * Math.PI / 180)}
                                        y1={200 + 105 * Math.sin(angle * Math.PI / 180)}
                                        x2={300 + 160 * Math.cos(angle * Math.PI / 180)}
                                        y2={200 + 160 * Math.sin(angle * Math.PI / 180)}
                                        stroke="#fcd34d" strokeWidth="3.5" strokeLinecap="round" opacity="0.55"
                                        className="weather-pulse" style={{ animationDelay: `${i * 0.2}s` }}
                                    />
                                ))}
                                <path d="M50 380 Q100 360 150 380 Q200 400 250 380 Q300 360 350 380 Q400 400 450 380" stroke="#fcd34d" strokeWidth="2.5" opacity="0.25" fill="none" className="weather-float" />
                                <path d="M30 420 Q80 400 130 420 Q180 440 230 420 Q280 400 330 420 Q380 440 430 420" stroke="#fcd34d" strokeWidth="2" opacity="0.18" fill="none" className="weather-float" style={{ animationDelay: '1.5s' }} />
                                <defs>
                                    <radialGradient id="sunGrad" cx="0.4" cy="0.4" r="0.6">
                                        <stop offset="0%" stopColor="#fef08a" />
                                        <stop offset="100%" stopColor="#f59e0b" />
                                    </radialGradient>
                                </defs>
                            </svg>
                        )}

                        {weatherTag === 'rainy' && (
                            <svg className="absolute -right-8 -top-4 w-[620px] h-[500px] opacity-40" viewBox="0 0 550 450" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <ellipse cx="350" cy="120" rx="120" ry="70" fill="#5b8cbe" opacity="0.55" className="weather-float" />
                                <ellipse cx="285" cy="108" rx="85" ry="58" fill="#6b9fd1" opacity="0.45" className="weather-float" style={{ animationDelay: '0.5s' }} />
                                <ellipse cx="418" cy="132" rx="75" ry="48" fill="#5b8cbe" opacity="0.4" className="weather-float" style={{ animationDelay: '1s' }} />
                                <ellipse cx="198" cy="78" rx="65" ry="38" fill="#7eb3dc" opacity="0.25" className="weather-float" style={{ animationDelay: '2s' }} />
                                {[[260,190],[292,202],[324,187],[356,197],[388,192],[418,204],[272,245],[306,238],[338,250],[370,234],[402,246],[248,296],[312,284],[344,300],[376,288],[424,294]].map(([x, y], i) => (
                                    <line key={i} x1={x} y1={y} x2={x - 5} y2={y + 20} stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" opacity="0.65"
                                        className={`rain-drop${i % 3 === 1 ? '-2' : i % 3 === 2 ? '-3' : ''}`} />
                                ))}
                                <ellipse cx="320" cy="410" rx="65" ry="9" fill="none" stroke="#93c5fd" strokeWidth="1.5" opacity="0.22" className="weather-pulse" />
                                <ellipse cx="320" cy="410" rx="42" ry="5.5" fill="none" stroke="#93c5fd" strokeWidth="1.5" opacity="0.32" className="weather-pulse" style={{ animationDelay: '0.7s' }} />
                            </svg>
                        )}

                        {weatherTag === 'cloudy' && (
                            <svg className="absolute -right-8 -top-4 w-[620px] h-[440px] opacity-35" viewBox="0 0 550 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <ellipse cx="350" cy="140" rx="130" ry="75" fill="white" opacity="0.32" className="weather-float" />
                                <ellipse cx="288" cy="128" rx="95" ry="63" fill="white" opacity="0.28" className="weather-float" style={{ animationDelay: '0.8s' }} />
                                <ellipse cx="424" cy="152" rx="85" ry="54" fill="white" opacity="0.22" className="weather-float" style={{ animationDelay: '1.2s' }} />
                                <ellipse cx="178" cy="88" rx="72" ry="42" fill="white" opacity="0.17" className="weather-float" style={{ animationDelay: '2s' }} />
                                <ellipse cx="218" cy="83" rx="52" ry="32" fill="white" opacity="0.13" className="weather-float" style={{ animationDelay: '2.5s' }} />
                                <ellipse cx="482" cy="78" rx="42" ry="24" fill="white" opacity="0.1" className="weather-float" style={{ animationDelay: '3s' }} />
                            </svg>
                        )}

                        {weatherTag === 'cool' && (
                            <svg className="absolute -right-8 -top-4 w-[580px] h-[500px] opacity-35" viewBox="0 0 500 450" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g className="weather-float">
                                    <path d="M350 80 Q372 102 362 134 Q340 112 350 80Z" fill="#86efac" opacity="0.55" />
                                    <line x1="350" y1="80" x2="356" y2="122" stroke="#86efac" strokeWidth="1.5" opacity="0.45" />
                                </g>
                                <g className="weather-float" style={{ animationDelay: '1.2s' }}>
                                    <path d="M422 152 Q448 168 442 205 Q416 184 422 152Z" fill="#6ee7b7" opacity="0.45" />
                                    <line x1="422" y1="152" x2="430" y2="188" stroke="#6ee7b7" strokeWidth="1.5" opacity="0.35" />
                                </g>
                                <g className="weather-float" style={{ animationDelay: '2.4s' }}>
                                    <path d="M280 122 Q302 144 292 174 Q270 152 280 122Z" fill="#a7f3d0" opacity="0.4" />
                                </g>
                                <path d="M50 200 Q150 185 250 200 Q350 215 450 195" stroke="#a7f3d0" strokeWidth="2" strokeLinecap="round" opacity="0.25" fill="none" className="weather-float" style={{ animationDelay: '0.5s' }} />
                                <path d="M80 255 Q180 240 280 258 Q380 278 480 254" stroke="#a7f3d0" strokeWidth="1.5" strokeLinecap="round" opacity="0.18" fill="none" className="weather-float" style={{ animationDelay: '1.8s' }} />
                                <circle cx="382" cy="282" r="3.5" fill="#a7f3d0" opacity="0.35" className="weather-float" />
                                <circle cx="302" cy="324" r="2.5" fill="#86efac" opacity="0.28" className="weather-float" style={{ animationDelay: '1s' }} />
                                <circle cx="444" cy="304" r="3" fill="#6ee7b7" opacity="0.22" className="weather-float" style={{ animationDelay: '2s' }} />
                            </svg>
                        )}
                    </div>

                    {/* Content */}
                    <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-12">

                            {/* Left: glass info card */}
                            <motion.div
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                                className="max-w-md"
                            >
                                <div
                                    className="rounded-2xl p-6 sm:p-8"
                                    style={{
                                        background: 'rgba(0,0,0,0.18)',
                                        backdropFilter: 'blur(18px)',
                                        WebkitBackdropFilter: 'blur(18px)',
                                        border: '1px solid rgba(255,255,255,0.14)',
                                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 12px 40px rgba(0,0,0,0.12)',
                                    }}
                                >
                                    <p className="text-white/55 text-[11px] font-bold uppercase tracking-widest mb-5">
                                        Weather in {city}
                                    </p>

                                    <div className="flex items-start gap-4 mb-4">
                                        <span className="text-6xl sm:text-7xl weather-pulse leading-none select-none">{wTheme.emoji}</span>
                                        <div>
                                            <p className="text-white font-extrabold leading-none tracking-tighter" style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)' }}>
                                                {temp}°
                                            </p>
                                            <p className="text-white/65 text-lg font-semibold capitalize mt-1">{condition}</p>
                                        </div>
                                    </div>

                                    <p className="text-white/90 text-base sm:text-lg font-semibold leading-relaxed mb-5">
                                        {wTheme.text}
                                    </p>

                                    {suggested.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {suggested.map(cat => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => handleCuisineCircleClick(cat.id)}
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105 active:scale-95"
                                                    style={{
                                                        background: wTheme.tagBg,
                                                        color: wTheme.tagText,
                                                        border: '1px solid rgba(255,255,255,0.18)',
                                                    }}
                                                >
                                                    <span>{cat.icon}</span>
                                                    <span>{cat.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <a
                                        href="#restaurants"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 select-none"
                                        style={{
                                            background: 'rgba(255,255,255,0.14)',
                                            color: 'white',
                                            border: '1px solid rgba(255,255,255,0.28)',
                                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
                                        }}
                                    >
                                        {wTheme.ctaText}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                                        </svg>
                                    </a>
                                </div>
                            </motion.div>

                            {/* Right: weather-recommended dishes */}
                            {weatherItems.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                    className="lg:max-w-[540px] w-full"
                                >
                                    <p className="text-white/55 text-[11px] font-bold uppercase tracking-widest mb-3">
                                        Recommended for this weather
                                    </p>
                                    <ScrollableRow gap="gap-3">
                                        {weatherItems.map(item => (
                                            <WeatherItemCard key={item.id} item={item} onAdd={addToCart} />
                                        ))}
                                    </ScrollableRow>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.section>
            )}

            {/* ═══════════════════════════════════════════════════════
                MAIN CONTENT
                ═══════════════════════════════════════════════════════ */}
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <div className="flex gap-8 items-start">

                    {/* ── Filter sidebar ─────────────────────────────── */}
                    <aside className="hidden lg:block w-[220px] shrink-0 sticky top-20">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-6 space-y-6">
                            <h2 className="text-base font-extrabold text-gray-800">Filters</h2>

                            <div>
                                <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Sort by</h3>
                                <div className="space-y-2.5">
                                    {[['relevance', 'Relevance'], ['newest', 'Newest']].map(([val, label]) => (
                                        <label key={val} className="flex items-center gap-2.5 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="sort-by"
                                                value={val}
                                                checked={sortBy === val}
                                                onChange={() => setSortBy(val)}
                                                className="w-4 h-4 text-green-500 border-gray-300 focus:ring-green-500/30 cursor-pointer"
                                            />
                                            <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-[11px] font-bold text-green-600 uppercase tracking-wider mb-3">Offers</h3>
                                <label className="flex items-center gap-2.5 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={hasDealsFilter}
                                        onChange={e => setHasDealsFilter(e.target.checked)}
                                        className="w-4 h-4 rounded text-green-500 border-gray-300 focus:ring-green-500/30 cursor-pointer"
                                    />
                                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Has active deals</span>
                                </label>
                            </div>

                            <div>
                                <h3 className="text-[11px] font-bold text-green-600 uppercase tracking-wider mb-3">Cuisines</h3>
                                <div className="space-y-2.5">
                                    {categories.map(cat => (
                                        <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={selectedCuisines.includes(cat.id)}
                                                onChange={() => toggleCuisine(cat.id)}
                                                className="w-4 h-4 rounded text-green-500 border-gray-300 focus:ring-green-500/30 cursor-pointer"
                                            />
                                            <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{cat.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {(search || selectedCuisines.length > 0 || hasDealsFilter || sortBy !== 'relevance') && (
                                <button
                                    onClick={clearFilters}
                                    className="w-full text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors text-left"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    </aside>

                    {/* ── Main content ──────────────────────────────── */}
                    <main className="flex-1 min-w-0 space-y-10 lg:space-y-12">

                        {/* Cuisines */}
                        <section>
                            <SectionHeading
                                title="Cuisines"
                                subtitle="Filter by what you're in the mood for"
                            />
                            <ScrollableRow gap="gap-5">
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => handleCuisineCircleClick(cat.id)}
                                        className="shrink-0 flex flex-col items-center gap-2.5 group"
                                    >
                                        <div className={`w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-200 shadow-sm ${selectedCuisines.includes(cat.id) ? 'border-green-500 shadow-green-100 scale-105' : 'border-transparent group-hover:border-green-400 group-hover:scale-105'}`}>
                                            <img
                                                src={getCuisineImage(cat.name)}
                                                alt={cat.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-400"
                                                loading="lazy"
                                            />
                                        </div>
                                        <span className={`text-xs font-semibold text-center leading-tight max-w-[80px] transition-colors ${selectedCuisines.includes(cat.id) ? 'text-green-600' : 'text-gray-600 group-hover:text-gray-800'}`}>
                                            {cat.name}
                                        </span>
                                    </button>
                                ))}
                            </ScrollableRow>
                        </section>

                        {/* Daily Deals */}
                        {allDeals.length > 0 && (
                            <section>
                                <SectionHeading
                                    title="Daily deals"
                                    subtitle="Exclusive vouchers for your next order"
                                    badge="Save up to 50%"
                                />
                                <ScrollableRow gap="gap-4">
                                    {allDeals.map(deal => (
                                        <VoucherCard key={deal.id} deal={deal} />
                                    ))}
                                </ScrollableRow>
                            </section>
                        )}

                        {/* Popular nearby */}
                        {popular.length > 0 && (
                            <section>
                                <SectionHeading
                                    title="Popular nearby"
                                    subtitle="Favorites from your community"
                                />
                                <ScrollableRow gap="gap-4">
                                    {popular.map(r => (
                                        <div key={r.id} className="shrink-0 w-52">
                                            <RestaurantCard
                                                restaurant={r}
                                                hasPromo={promoRestaurantIds.includes(r.id)}
                                                isFavorited={favorites.has(r.id)}
                                                onFavoriteToggle={toggleFavorite}
                                            />
                                        </div>
                                    ))}
                                </ScrollableRow>
                            </section>
                        )}

                        {/* All Restaurants */}
                        <section id="restaurants" ref={gridRef} className="pb-10">
                            <div className="flex items-start justify-between mb-5">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">All restaurants</h2>
                                    <p className="text-sm text-gray-400 mt-0.5">
                                        {filteredRestaurants.length !== restaurants.length
                                            ? `${filteredRestaurants.length} of ${restaurants.length} shown`
                                            : `${restaurants.length} restaurants in Laguna`}
                                    </p>
                                </div>
                            </div>

                            {/* Mobile filter row */}
                            <div className="lg:hidden flex items-center gap-2 mb-5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                                <button
                                    onClick={() => setHasDealsFilter(v => !v)}
                                    className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${hasDealsFilter ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                                >
                                    Has deals
                                </button>
                                {['relevance', 'newest'].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => setSortBy(val)}
                                        className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${sortBy === val ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                                    >
                                        {val === 'relevance' ? 'Relevance' : 'Newest'}
                                    </button>
                                ))}
                                {(search || selectedCuisines.length > 0 || hasDealsFilter || sortBy !== 'relevance') && (
                                    <button
                                        onClick={clearFilters}
                                        className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-gray-200 text-gray-400 hover:text-gray-600 bg-white transition-colors"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>

                            {filteredRestaurants.length === 0 ? (
                                <div className="text-center py-20">
                                    {restaurants.length === 0 ? (
                                        <>
                                            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                                                </svg>
                                            </div>
                                            <p className="text-gray-500 font-semibold">No restaurants available yet.</p>
                                            <p className="text-gray-400 text-sm mt-1">Check back soon.</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                                </svg>
                                            </div>
                                            <p className="text-gray-500 font-semibold">No restaurants match your filters.</p>
                                            <button
                                                onClick={clearFilters}
                                                className="mt-3 text-sm font-semibold text-green-500 hover:text-green-600 transition-colors"
                                            >
                                                Clear filters
                                            </button>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div key={filterKey} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {filteredRestaurants.map((r, i) => (
                                        <div
                                            key={r.id}
                                            className="card-fade-up"
                                            style={{ animationDelay: `${Math.min(i * 45, 450)}ms`, animationFillMode: 'both' }}
                                        >
                                            <RestaurantCard
                                                restaurant={r}
                                                hasPromo={promoRestaurantIds.includes(r.id)}
                                                isFavorited={favorites.has(r.id)}
                                                onFavoriteToggle={toggleFavorite}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                    </main>
                </div>
            </div>

            {/* AI Chat */}
            <AIChatWidget />
        </CustomerLayout>
    );
}
