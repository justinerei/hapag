import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
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
        gradient: 'linear-gradient(135deg, #2c4a6e 0%, #3b6d9c 40%, #4a85b8 100%)',
        accent: '#7ec8e3',
        tagBg: 'rgba(126,200,227,0.18)',
        tagText: '#7ec8e3',
    },
    cloudy: {
        emoji: '☁️',
        text: 'A cloudy day calls for freshly baked goods and pastries.',
        gradient: 'linear-gradient(135deg, #64748b 0%, #7d8fa0 40%, #94a3b8 100%)',
        accent: '#d4e4ef',
        tagBg: 'rgba(212,228,239,0.22)',
        tagText: '#d4e4ef',
    },
    cool: {
        emoji: '🍃',
        text: 'Cool weather is perfect for grilled meats and hearty meals.',
        gradient: 'linear-gradient(135deg, #0f766e 0%, #14967e 40%, #19b893 100%)',
        accent: '#a0e8d8',
        tagBg: 'rgba(160,232,216,0.18)',
        tagText: '#a0e8d8',
    },
    hot: {
        emoji: '☀️',
        text: 'Beat the heat with cold desserts and refreshing drinks.',
        gradient: 'linear-gradient(135deg, #c2410c 0%, #d97706 40%, #e8a317 100%)',
        accent: '#fcd49a',
        tagBg: 'rgba(252,212,154,0.22)',
        tagText: '#fcd49a',
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

// ── Scrollable Row (reusable) ─────────────────────────────────────────────────

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
        const amount = el.clientWidth * 0.7;
        el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    };

    return (
        <div className="relative group/scroll">
            {canScrollLeft && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:shadow-xl transition-all opacity-0 group-hover/scroll:opacity-100"
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
                    className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:shadow-xl transition-all opacity-0 group-hover/scroll:opacity-100"
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
        <Link
            href={route('restaurants.show', restaurant.id)}
            className="group block"
        >
            <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden rounded-xl">
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

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {hasPromo && (
                    <span className="absolute top-2.5 left-2.5 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shadow-sm">
                        PROMO
                    </span>
                )}

                <button
                    type="button"
                    onClick={(e) => onFavoriteToggle(restaurant.id, e)}
                    className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center transition-all duration-200 hover:scale-110 ${isFavorited ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5"
                         fill={isFavorited ? 'currentColor' : 'none'}
                         viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                </button>
            </div>

            <div className="mt-2">
                <h3 className="font-bold text-gray-800 text-sm leading-tight truncate group-hover:text-green-600 transition-colors duration-200">
                    {restaurant.name}{restaurant.municipality ? ` – ${restaurant.municipality}` : ''}
                </h3>
                <p className="text-gray-400 text-xs mt-0.5">5–15 min.</p>
            </div>
        </Link>
    );
}

// ── Weather Item Card (for hero section) ──────────────────────────────────────

function WeatherItemCard({ item, onAdd }) {
    return (
        <div className="shrink-0 w-44 bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:bg-white/15 transition-all group cursor-pointer">
            <div className="aspect-[4/3] bg-white/5 overflow-hidden">
                {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl opacity-60">🍽️</div>
                )}
            </div>
            <div className="p-3">
                <p className="text-white font-bold text-xs leading-tight truncate">{item.name}</p>
                <p className="text-white/50 text-[10px] truncate mt-0.5">{item.restaurant?.name}</p>
                <div className="flex items-center justify-between mt-2">
                    <span className="text-white font-extrabold text-sm">{fmt(item.price)}</span>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onAdd(item.id, item.restaurant?.name ?? ''); }}
                        className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                        title="Add to cart"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
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
        <Link href={href} className="shrink-0 w-[280px] group">
            <div className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                {/* Top color bar */}
                <div className={`h-1.5 w-full ${isGlobal ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-orange-400 to-orange-600'}`} />

                <div className="flex">
                    {/* Left: info */}
                    <div className="flex-1 p-4 pr-3">
                        <div className="flex items-center gap-1.5 mb-2">
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
                            {deal.type === 'percentage' ? `${Number(deal.value).toFixed(0)}% off your order` : `₱${Number(deal.value).toFixed(0)} off your order`}
                        </p>
                        <p className="text-gray-400 text-[11px] mt-1 leading-relaxed">
                            {deal.min_order_amount ? `Min. order ${fmt(deal.min_order_amount)}` : 'No minimum order'}
                            {deal.expires_at && ` · Exp. ${new Date(deal.expires_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}`}
                        </p>

                        <div className="mt-3 flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-green-600 tracking-wide uppercase">{deal.code}</span>
                        </div>
                    </div>

                    {/* Right: discount badge with perforated edge */}
                    <div className="relative flex items-center justify-center w-[80px] shrink-0">
                        <div className="absolute left-0 top-3 bottom-3 w-px border-l border-dashed border-gray-200" />
                        <div className="absolute left-[-5px] top-[-1px] w-2.5 h-2.5 rounded-full bg-gray-50 border border-gray-100" />
                        <div className="absolute left-[-5px] bottom-[-1px] w-2.5 h-2.5 rounded-full bg-gray-50 border border-gray-100" />

                        <div className="text-center">
                            <span className={`block text-2xl font-extrabold ${isGlobal ? 'text-green-500' : 'text-orange-500'}`}>
                                {discLabel}
                            </span>
                            <span className={`block text-[10px] font-bold uppercase tracking-wider ${isGlobal ? 'text-green-400' : 'text-orange-400'}`}>
                                OFF
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}


// ── AI Chat Floating Widget ───────────────────────────────────────────────────

function AIChatWidget() {
    const [open, setOpen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [reply, setReply] = useState('');
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (open && inputRef.current) inputRef.current.focus();
    }, [open]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!prompt.trim() || loading) return;
        setLoading(true);
        setReply('');
        setError('');
        try {
            const res = await fetch(route('ai.recommend'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken() },
                body: JSON.stringify({ prompt: prompt.trim() }),
            });
            const data = await res.json();
            if (res.ok && data.recommendation) {
                setReply(data.recommendation);
            } else {
                setError(data.error || 'Something went wrong.');
            }
        } catch {
            setError('Could not connect to AI. Try again.');
        }
        setLoading(false);
    }

    const suggestions = ['Masarap na sabaw', 'Something sweet', 'Budget meal under ₱100', 'Best for rainy day'];

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => setOpen(v => !v)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center justify-center ${open ? 'bg-gray-700 hover:bg-gray-800' : 'bg-green-500 hover:bg-green-600'} text-white`}
                aria-label="AI Food Recommender"
            >
                {open ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"/>
                    </svg>
                )}
            </button>

            {/* Chat panel */}
            {open && (
                <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col" style={{ maxHeight: '500px' }}>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-500 to-green-600 px-5 py-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm">Hapag AI</h3>
                                <p className="text-white/60 text-[11px]">Tell me what you're craving</p>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: '180px' }}>
                        {!reply && !loading && !error && (
                            <div>
                                <p className="text-gray-500 text-xs mb-3">Try asking:</p>
                                <div className="flex flex-wrap gap-1.5">
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
                            </div>
                        )}

                        {loading && (
                            <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                                <span className="text-xs">Finding the best dishes for you…</span>
                            </div>
                        )}

                        {reply && (
                            <div className="bg-green-50 rounded-xl p-3.5 border border-green-100">
                                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{reply}</p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 rounded-xl p-3.5 border border-red-100">
                                <p className="text-red-600 text-xs">{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="border-t border-gray-100 p-3 flex gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            placeholder="I'm craving…"
                            className="flex-1 px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
                            maxLength={300}
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !prompt.trim()}
                            className="w-10 h-10 rounded-xl bg-green-500 text-white flex items-center justify-center hover:bg-green-600 disabled:opacity-40 disabled:hover:bg-green-500 transition-all shrink-0"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                            </svg>
                        </button>
                    </form>
                </div>
            )}
        </>
    );
}


// ── CSS Animations ────────────────────────────────────────────────────────────

function WeatherAnimStyles() {
    return (
        <style>{`
            @keyframes weatherFloat {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-8px); }
            }
            @keyframes weatherPulse {
                0%, 100% { opacity: 0.7; }
                50% { opacity: 1; }
            }
            @keyframes sunRays {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes rainDrop {
                0% { transform: translateY(-8px); opacity: 0; }
                50% { opacity: 1; }
                100% { transform: translateY(8px); opacity: 0; }
            }
            .weather-float { animation: weatherFloat 4s ease-in-out infinite; }
            .weather-pulse { animation: weatherPulse 3s ease-in-out infinite; }
            .sun-rays { animation: sunRays 20s linear infinite; }
            .rain-drop { animation: rainDrop 1.5s ease-in-out infinite; }
            .rain-drop-2 { animation: rainDrop 1.5s ease-in-out infinite 0.3s; }
            .rain-drop-3 { animation: rainDrop 1.5s ease-in-out infinite 0.6s; }
        `}</style>
    );
}


// ── Page ───────────────────────────────────────────────────────────────────────

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
                showToast(data.favorited ? 'Added to favorites!' : 'Removed from favorites.');
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
                showToast('Item added to cart!');
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

    return (
        <CustomerLayout cartCount={localCartCount}>
            <Head title="Home — Hapag" />
            <WeatherAnimStyles />

            {/* ── Welcome Modal ─────────────────────────────────────── */}
            {showWelcome && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center px-4 py-6">
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowWelcome(false)} />
                    <div className="relative z-10 max-w-sm w-full bg-white rounded-2xl shadow-2xl text-center p-10" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-center mb-5">
                            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-800 mb-2">You're all set!</h2>
                        <p className="text-sm text-gray-500 leading-relaxed mb-6">
                            Your account has been created successfully. Start exploring restaurants and ordering your favorite dishes!
                        </p>
                        <button
                            onClick={() => setShowWelcome(false)}
                            className="w-full py-3 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-colors"
                        >
                            Start Exploring
                        </button>
                    </div>
                </div>
            )}

            {/* ── Toast ─────────────────────────────────────────────── */}
            {toast && (
                <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-6 py-3 rounded-2xl shadow-lg text-sm font-bold text-white pointer-events-none transition-all ${toast.isError ? 'bg-red-500' : 'bg-green-500'}`}>
                    {toast.isError ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                    )}
                    <span>{toast.message}</span>
                </div>
            )}

            {/* ── Cart conflict modal ──────────────────────────────── */}
            {conflict && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                </svg>
                            </div>
                            <h3 className="font-bold text-gray-800 text-base">Cart has items from another restaurant</h3>
                        </div>
                        <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                            Your cart has items from another restaurant. Clear it to add from &ldquo;{conflict.restaurantName}&rdquo;?
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
                                className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors"
                            >
                                Clear &amp; Add
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════
                 WEATHER HERO — full width, tall, the wow factor
                 ═══════════════════════════════════════════════════════════ */}
            {weather && (
                <section className="relative overflow-hidden" style={{ background: wTheme.gradient, minHeight: '320px' }}>

                    {/* ── SVG Weather Illustration (replaces PNG backgrounds) ── */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {weatherTag === 'hot' && (
                            <svg className="absolute -right-10 -top-10 w-[500px] h-[500px] opacity-30" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                                {/* Sun core */}
                                <circle cx="300" cy="200" r="80" fill="url(#sunGrad)" className="sun-rays" style={{ transformOrigin: '300px 200px' }} />
                                {/* Sun glow */}
                                <circle cx="300" cy="200" r="120" fill="#fbbf24" opacity="0.15" className="weather-pulse" />
                                <circle cx="300" cy="200" r="160" fill="#fbbf24" opacity="0.08" className="weather-pulse" style={{ animationDelay: '1s' }} />
                                {/* Rays */}
                                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                                    <line
                                        key={i}
                                        x1={300 + 100 * Math.cos(angle * Math.PI / 180)}
                                        y1={200 + 100 * Math.sin(angle * Math.PI / 180)}
                                        x2={300 + 150 * Math.cos(angle * Math.PI / 180)}
                                        y2={200 + 150 * Math.sin(angle * Math.PI / 180)}
                                        stroke="#fcd34d" strokeWidth="3" strokeLinecap="round" opacity="0.5"
                                        className="weather-pulse" style={{ animationDelay: `${i * 0.2}s` }}
                                    />
                                ))}
                                {/* Heatwave lines */}
                                <path d="M50 380 Q100 360 150 380 Q200 400 250 380 Q300 360 350 380 Q400 400 450 380" stroke="#fcd34d" strokeWidth="2" opacity="0.2" fill="none" className="weather-float" />
                                <path d="M30 420 Q80 400 130 420 Q180 440 230 420 Q280 400 330 420 Q380 440 430 420" stroke="#fcd34d" strokeWidth="1.5" opacity="0.15" fill="none" className="weather-float" style={{ animationDelay: '1.5s' }} />
                                <defs>
                                    <radialGradient id="sunGrad" cx="0.4" cy="0.4" r="0.6">
                                        <stop offset="0%" stopColor="#fef08a" />
                                        <stop offset="100%" stopColor="#f59e0b" />
                                    </radialGradient>
                                </defs>
                            </svg>
                        )}

                        {weatherTag === 'rainy' && (
                            <svg className="absolute -right-10 -top-5 w-[550px] h-[450px] opacity-35" viewBox="0 0 550 450" fill="none" xmlns="http://www.w3.org/2000/svg">
                                {/* Dark cloud */}
                                <ellipse cx="350" cy="120" rx="110" ry="65" fill="#5b8cbe" opacity="0.5" className="weather-float" />
                                <ellipse cx="290" cy="110" rx="80" ry="55" fill="#6b9fd1" opacity="0.4" className="weather-float" style={{ animationDelay: '0.5s' }} />
                                <ellipse cx="410" cy="130" rx="70" ry="45" fill="#5b8cbe" opacity="0.35" className="weather-float" style={{ animationDelay: '1s' }} />
                                {/* Small back cloud */}
                                <ellipse cx="200" cy="80" rx="60" ry="35" fill="#7eb3dc" opacity="0.2" className="weather-float" style={{ animationDelay: '2s' }} />
                                {/* Rain drops */}
                                {[
                                    [260, 190], [290, 200], [320, 185], [350, 195], [380, 190], [410, 200],
                                    [275, 240], [305, 235], [335, 245], [365, 230], [395, 240],
                                    [250, 290], [310, 280], [340, 295], [370, 285], [420, 290],
                                ].map(([x, y], i) => (
                                    <line key={i} x1={x} y1={y} x2={x - 4} y2={y + 18} stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" opacity="0.6"
                                        className={`rain-drop${i % 3 === 1 ? '-2' : i % 3 === 2 ? '-3' : ''}`} />
                                ))}
                                {/* Puddle ripples */}
                                <ellipse cx="320" cy="400" rx="60" ry="8" fill="none" stroke="#93c5fd" strokeWidth="1" opacity="0.2" className="weather-pulse" />
                                <ellipse cx="320" cy="400" rx="40" ry="5" fill="none" stroke="#93c5fd" strokeWidth="1" opacity="0.3" className="weather-pulse" style={{ animationDelay: '0.7s' }} />
                            </svg>
                        )}

                        {weatherTag === 'cloudy' && (
                            <svg className="absolute -right-10 -top-5 w-[550px] h-[400px] opacity-30" viewBox="0 0 550 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                                {/* Large fluffy cloud */}
                                <ellipse cx="350" cy="140" rx="120" ry="70" fill="white" opacity="0.3" className="weather-float" />
                                <ellipse cx="290" cy="130" rx="90" ry="60" fill="white" opacity="0.25" className="weather-float" style={{ animationDelay: '0.8s' }} />
                                <ellipse cx="420" cy="150" rx="80" ry="50" fill="white" opacity="0.2" className="weather-float" style={{ animationDelay: '1.2s' }} />
                                {/* Mid cloud */}
                                <ellipse cx="180" cy="90" rx="70" ry="40" fill="white" opacity="0.15" className="weather-float" style={{ animationDelay: '2s' }} />
                                <ellipse cx="220" cy="85" rx="50" ry="30" fill="white" opacity="0.12" className="weather-float" style={{ animationDelay: '2.5s' }} />
                                {/* Small distant clouds */}
                                <ellipse cx="480" cy="80" rx="40" ry="22" fill="white" opacity="0.1" className="weather-float" style={{ animationDelay: '3s' }} />
                                <ellipse cx="120" cy="200" rx="55" ry="28" fill="white" opacity="0.08" className="weather-float" style={{ animationDelay: '1.5s' }} />
                                {/* Wispy streaks */}
                                <path d="M100 250 Q200 240 300 255 Q400 270 500 250" stroke="white" strokeWidth="1" opacity="0.1" fill="none" />
                                <path d="M50 300 Q150 290 250 305 Q350 320 450 300" stroke="white" strokeWidth="0.8" opacity="0.07" fill="none" />
                            </svg>
                        )}

                        {weatherTag === 'cool' && (
                            <svg className="absolute -right-10 -top-5 w-[500px] h-[450px] opacity-30" viewBox="0 0 500 450" fill="none" xmlns="http://www.w3.org/2000/svg">
                                {/* Stylized leaves */}
                                <g className="weather-float" style={{ animationDelay: '0s' }}>
                                    <path d="M350 80 Q370 100 360 130 Q340 110 350 80Z" fill="#86efac" opacity="0.5" />
                                    <line x1="350" y1="80" x2="355" y2="120" stroke="#86efac" strokeWidth="1" opacity="0.4" />
                                </g>
                                <g className="weather-float" style={{ animationDelay: '1.2s' }}>
                                    <path d="M420 150 Q445 165 440 200 Q415 180 420 150Z" fill="#6ee7b7" opacity="0.4" />
                                    <line x1="420" y1="150" x2="428" y2="185" stroke="#6ee7b7" strokeWidth="1" opacity="0.3" />
                                </g>
                                <g className="weather-float" style={{ animationDelay: '2.4s' }}>
                                    <path d="M280 120 Q300 140 290 170 Q270 150 280 120Z" fill="#a7f3d0" opacity="0.35" />
                                </g>
                                {/* Wind lines */}
                                <path d="M50 200 Q150 185 250 200 Q350 215 450 195" stroke="#a7f3d0" strokeWidth="1.5" strokeLinecap="round" opacity="0.2" fill="none" className="weather-float" style={{ animationDelay: '0.5s' }} />
                                <path d="M80 250 Q180 235 280 255 Q380 275 480 250" stroke="#a7f3d0" strokeWidth="1" strokeLinecap="round" opacity="0.15" fill="none" className="weather-float" style={{ animationDelay: '1.8s' }} />
                                <path d="M30 300 Q130 285 230 305 Q330 325 430 300" stroke="#a7f3d0" strokeWidth="1" strokeLinecap="round" opacity="0.1" fill="none" className="weather-float" style={{ animationDelay: '3s' }} />
                                {/* Floating particles */}
                                <circle cx="380" cy="280" r="3" fill="#a7f3d0" opacity="0.3" className="weather-float" />
                                <circle cx="300" cy="320" r="2" fill="#86efac" opacity="0.25" className="weather-float" style={{ animationDelay: '1s' }} />
                                <circle cx="440" cy="300" r="2.5" fill="#6ee7b7" opacity="0.2" className="weather-float" style={{ animationDelay: '2s' }} />
                            </svg>
                        )}
                    </div>

                    {/* Content */}
                    <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                            {/* Left: Weather info */}
                            <div className="max-w-lg">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-4xl weather-pulse">{wTheme.emoji}</span>
                                    <div>
                                        <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Weather in {city}</p>
                                        <p className="text-white text-3xl md:text-4xl font-extrabold leading-none">
                                            {temp}°C <span className="text-xl md:text-2xl font-bold capitalize">{condition}</span>
                                        </p>
                                    </div>
                                </div>

                                <p className="text-white/80 text-sm md:text-base leading-relaxed mt-2 max-w-md">
                                    {wTheme.text}
                                </p>

                                {/* Suggested category tags */}
                                {suggested.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {suggested.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => handleCuisineCircleClick(cat.id)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105"
                                                style={{ background: wTheme.tagBg, color: wTheme.tagText }}
                                            >
                                                <span>{cat.icon}</span>
                                                <span>{cat.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right: Weather-recommended dishes */}
                            {weatherItems.length > 0 && (
                                <div className="lg:max-w-[460px] w-full">
                                    <p className="text-white/60 text-[11px] font-bold uppercase tracking-widest mb-2">
                                        Recommended for this weather
                                    </p>
                                    <ScrollableRow gap="gap-3">
                                        {weatherItems.map(item => (
                                            <WeatherItemCard
                                                key={item.id}
                                                item={item}
                                                onAdd={addToCart}
                                            />
                                        ))}
                                    </ScrollableRow>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}


            {/* ═══════════════════════════════════════════════════════════
                 MAIN CONTENT AREA
                 ═══════════════════════════════════════════════════════════ */}
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex gap-6 items-start">

                    {/* ── Filter sidebar (desktop) ────────────────────── */}
                    <aside className="hidden lg:block w-[220px] shrink-0 sticky top-20">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-5 space-y-5">
                            <h2 className="text-lg font-extrabold text-gray-800">Filters</h2>

                            <div>
                                <h3 className="text-xs font-bold text-gray-800 mb-2.5">Sort by</h3>
                                <div className="space-y-2">
                                    {[['relevance', 'Relevance'], ['newest', 'Newest']].map(([val, label]) => (
                                        <label key={val} className="flex items-center gap-2.5 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="sort-by"
                                                value={val}
                                                checked={sortBy === val}
                                                onChange={() => setSortBy(val)}
                                                className="w-4 h-4 text-green-500 border-gray-300 focus:ring-green-500/30 cursor-pointer"
                                            />
                                            <span className="text-sm text-gray-800">{label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-green-500 mb-2.5">Offers</h3>
                                <label className="flex items-center gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={hasDealsFilter}
                                        onChange={e => setHasDealsFilter(e.target.checked)}
                                        className="w-4 h-4 rounded text-green-500 border-gray-300 focus:ring-green-500/30 cursor-pointer"
                                    />
                                    <span className="text-sm text-gray-800">Has Active Deals</span>
                                </label>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-green-500 mb-2.5">Cuisines</h3>
                                <div className="space-y-2">
                                    {categories.map(cat => (
                                        <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedCuisines.includes(cat.id)}
                                                onChange={() => toggleCuisine(cat.id)}
                                                className="w-4 h-4 rounded text-green-500 border-gray-300 focus:ring-green-500/30 cursor-pointer"
                                            />
                                            <span className="text-sm text-gray-800">{cat.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {(search || selectedCuisines.length > 0 || hasDealsFilter || sortBy !== 'relevance') && (
                                <button
                                    onClick={clearFilters}
                                    className="w-full text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors text-left"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    </aside>

                    {/* ── Main content ──────────────────────────────────── */}
                    <main className="flex-1 min-w-0 space-y-8">

                        {/* ── Cuisines ─────────────────────────────────── */}
                        <section>
                            <h2 className="text-2xl font-extrabold text-gray-800 mb-4">Cuisines</h2>
                            <ScrollableRow gap="gap-5">
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => handleCuisineCircleClick(cat.id)}
                                        className="shrink-0 flex flex-col items-center gap-2 group"
                                    >
                                        <div className={`w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-150 shadow-sm ${selectedCuisines.includes(cat.id) ? 'border-green-500 shadow-green-100' : 'border-transparent group-hover:border-green-500'}`}>
                                            <img
                                                src={getCuisineImage(cat.name)}
                                                alt={cat.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                loading="lazy"
                                            />
                                        </div>
                                        <span className={`text-xs font-semibold text-center leading-tight max-w-[80px] ${selectedCuisines.includes(cat.id) ? 'text-green-600' : 'text-gray-600'}`}>
                                            {cat.name}
                                        </span>
                                    </button>
                                ))}
                            </ScrollableRow>
                        </section>

                        {/* ── Your Daily Deals ────────────────────────── */}
                        {allDeals.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-extrabold text-gray-800 mb-4">Your Daily Deals</h2>
                                <ScrollableRow gap="gap-4">
                                    {allDeals.map(deal => (
                                        <VoucherCard key={deal.id} deal={deal} />
                                    ))}
                                </ScrollableRow>
                            </section>
                        )}

                        {/* ── Popular In Your Area ────────────────────── */}
                        {popular.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-extrabold text-gray-800 mb-4">Popular In Your Area</h2>
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

                        {/* ── All Restaurants ─────────────────────────── */}
                        <section ref={gridRef} className="pb-10">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-extrabold text-gray-800">All Restaurants</h2>
                                {filteredRestaurants.length !== restaurants.length && (
                                    <span className="text-sm text-gray-500">
                                        {filteredRestaurants.length} of {restaurants.length} shown
                                    </span>
                                )}
                            </div>

                            {/* Mobile filter row */}
                            <div className="lg:hidden flex items-center gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                                <button
                                    onClick={() => setHasDealsFilter(v => !v)}
                                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${hasDealsFilter ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                                >
                                    Has Deals
                                </button>
                                {['relevance', 'newest'].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => setSortBy(val)}
                                        className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${sortBy === val ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                                    >
                                        {val === 'relevance' ? 'Relevance' : 'Newest'}
                                    </button>
                                ))}
                                {(search || selectedCuisines.length > 0 || hasDealsFilter || sortBy !== 'relevance') && (
                                    <button
                                        onClick={clearFilters}
                                        className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 text-gray-400 hover:text-gray-600 bg-white transition-colors"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>

                            {filteredRestaurants.length === 0 ? (
                                <div className="text-center py-16">
                                    {restaurants.length === 0 ? (
                                        <>
                                            <span className="text-5xl mb-4 block">🍽️</span>
                                            <p className="text-gray-500 font-semibold">No restaurants available yet.</p>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-4xl mb-3 block">🔍</span>
                                            <p className="text-gray-500 font-semibold">No restaurants match your filters.</p>
                                            <button
                                                onClick={clearFilters}
                                                className="mt-3 text-sm font-semibold text-green-500 hover:underline"
                                            >
                                                Clear filters
                                            </button>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {filteredRestaurants.map(r => (
                                        <RestaurantCard
                                            key={r.id}
                                            restaurant={r}
                                            hasPromo={promoRestaurantIds.includes(r.id)}
                                            isFavorited={favorites.has(r.id)}
                                            onFavoriteToggle={toggleFavorite}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>

                    </main>
                </div>
            </div>

            {/* ── AI Chat Floating Widget ──────────────────────────── */}
            <AIChatWidget />
        </CustomerLayout>
    );
}