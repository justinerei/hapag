import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';

// ── Data ──────────────────────────────────────────────────────────────────────

const BRANDS = [
    {
        name: 'Lutong Bahay ni Aling Rosa',
        font: "'Libre Baskerville', serif",
        slug: 'lutong-bahay',
        image: '/images/restaurants/lutong-bahay.png',
        tagline: 'Home-cooked Filipino classics',
    },
    {
        name: 'GRILL MASTERS PH',
        font: "'Oswald', sans-serif",
        slug: 'grill-masters',
        image: '/images/restaurants/grill-masters.png',
        tagline: 'BBQ & Ihaw-Ihaw favorites',
    },
    {
        name: "Kape't Tinapay",
        font: "'Playfair Display', serif",
        slug: 'kape-tinapay',
        image: '/images/restaurants/kape-tinapay.png',
        tagline: 'Your morning café',
        italic: true,
    },
    {
        name: "Mama Nena's Carinderia",
        font: "'Quicksand', sans-serif",
        slug: 'mama-nenas',
        image: '/images/restaurants/mama-nenas.png',
        tagline: 'Carinderia comfort food',
    },
    {
        name: 'Bida Burger',
        font: "'Poppins', sans-serif",
        slug: 'bida-burger',
        image: '/images/restaurants/bida-burger.png',
        tagline: 'Fast food done right',
    },
    {
        name: 'La Preciosa Bakery',
        font: "'Cormorant Garamond', serif",
        slug: 'la-preciosa',
        image: '/images/restaurants/la-preciosa.png',
        tagline: 'Fresh-baked daily',
    },
];

const MUNICIPALITIES = [
    'Santa Cruz', 'Pagsanjan', 'Los Baños', 'Calamba',
    'San Pablo', 'Sta. Rosa', 'Cabuyao', 'Biñan',
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function GuestHome() {
    const [announcementVisible, setAnnouncementVisible] = useState(true);
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        function onScroll() { setScrolled(window.scrollY > 80); }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <>
            <Head title="Good food, right to your table — Hapag" />

            {/* Google Fonts for brand typography */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link
                href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Oswald:wght@500;700&family=Playfair+Display:ital,wght@1,400;1,700&family=Quicksand:wght@500;700&family=Poppins:wght@600;700&family=Cormorant+Garamond:wght@500;700&display=swap"
                rel="stylesheet"
            />

            <style>{`
                @keyframes marquee {
                    0%   { transform: translateX(0); }
                    100% { transform: translateX(-33.333%); }
                }
                .animate-marquee {
                    animation: marquee 35s linear infinite;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>

            <div className="min-h-screen flex flex-col bg-gray-50 font-sans antialiased text-gray-800">

                {/* ── Announcement Bar ─────────────────────────────────────── */}
                {announcementVisible && (
                    <div className="bg-gray-800 text-white text-center text-sm py-2.5 px-4 relative z-[60]">
                        <span>
                            Order ahead,{' '}
                            <Link href={route('restaurants.index')} className="text-green-400 hover:underline font-semibold">
                                skip the wait
                            </Link>
                            {' '}— pick up your food fresh from local Laguna restaurants.
                        </span>
                        <button
                            onClick={() => setAnnouncementVisible(false)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* ── Navbar — sticky, lives at page root so it never clips ── */}
                <div className="sticky top-0 z-50 px-4 pt-4 pb-1">
                    <nav className={`max-w-6xl mx-auto transition-all duration-300 px-6 h-16 flex items-center justify-between${scrolled ? ' bg-white rounded-2xl shadow-md' : ''}`}>
                        <Link href={route('home')} className="shrink-0">
                            <span className="text-2xl font-bold tracking-tight text-green-600">Hapag</span>
                        </Link>
                        <div className={`hidden md:flex items-center gap-1 transition-opacity duration-300 ${scrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                            <Link href={route('home')} className="px-4 py-2 rounded-full text-sm font-bold text-gray-800">Home</Link>
                            <Link href={route('restaurants.index')} className="px-4 py-2 rounded-full text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">Restaurants</Link>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href={route('login')} className="hidden sm:block px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">Sign In</Link>
                            <Link href={route('register')} className="px-5 py-2.5 rounded-full text-sm font-bold bg-green-500 text-white hover:bg-green-600 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">Sign Up</Link>
                            <button onClick={() => setMobileOpen((v) => !v)} className="md:hidden ml-1 p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </nav>
                    {mobileOpen && (
                        <div className="max-w-6xl mx-auto mt-1 bg-white rounded-2xl shadow-md px-4 py-3 space-y-1">
                            <Link href={route('home')} className="block px-4 py-2 rounded-xl text-sm font-bold bg-gray-100 text-gray-800" onClick={() => setMobileOpen(false)}>Home</Link>
                            <Link href={route('restaurants.index')} className="block px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors" onClick={() => setMobileOpen(false)}>Restaurants</Link>
                            <div className="border-t border-gray-200 pt-2 mt-2 flex gap-2">
                                <Link href={route('login')} className="flex-1 text-center px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors" onClick={() => setMobileOpen(false)}>Sign In</Link>
                                <Link href={route('register')} className="flex-1 text-center px-4 py-2 rounded-xl text-sm font-bold bg-green-500 text-white hover:bg-green-600 transition-colors" onClick={() => setMobileOpen(false)}>Sign Up</Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Hero — texture fills the ENTIRE hero area edge-to-edge ── */}
                <section
                    className="relative"
                    style={{
                        backgroundImage: "url('/images/texturev2.png')",
                        backgroundRepeat: 'repeat',
                        backgroundSize: '1400px',
                    }}
                >
                    {/* Opacity layer — controls texture visibility at 60% */}
                    <div className="absolute inset-0 bg-gray-50/40 pointer-events-none" />

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 md:pt-20 md:pb-24">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            {/* Left: Text */}
                            <div>
                                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-800 leading-[1.05] tracking-tight mb-6">
                                    Good food,<br />right to your<br />table.
                                </h1>
                                <p className="text-gray-500 text-lg md:text-xl leading-relaxed mb-8 max-w-md">
                                    Discover the best local restaurants in Laguna. Order ahead, pick up fresh. No delivery fees, no hassle.
                                </p>
                                <form action={route('restaurants.index')} method="GET" className="relative max-w-md">
                                    <input
                                        type="text"
                                        name="search"
                                        placeholder="Search a keyword... (e.g. Sinigang)"
                                        className="w-full pl-5 pr-14 py-4 rounded-2xl bg-white border border-gray-200 text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 shadow-sm"
                                    />
                                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-800 hover:bg-gray-700 text-white p-2.5 rounded-xl transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </button>
                                </form>
                            </div>
                            {/* Right: Image collage */}
                            <div className="relative hidden md:block">
                                <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                                    <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80" alt="Filipino food spread" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                </div>
                                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg px-5 py-3 border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🍜</span>
                                        <div>
                                            <p className="text-xs text-gray-500">Popular in Laguna</p>
                                            <p className="text-sm font-bold text-gray-800">Sinigang na Baboy</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Page Content ─────────────────────────────────────────── */}
                <main className="flex-1">

                    {/* Brand Marquee */}
                    <section className="bg-white border-y border-gray-200 py-5 overflow-hidden">
                        <div className="flex animate-marquee whitespace-nowrap items-center">
                            {Array.from({ length: 3 }).flatMap((_, rep) =>
                                BRANDS.flatMap((brand) => [
                                    <Link
                                        key={`b-${rep}-${brand.slug}`}
                                        href={route('restaurants.index')}
                                        className="inline-block shrink-0 px-5 py-2 transition-all duration-200 text-gray-800 hover:text-green-600 hover:scale-105"
                                        style={{
                                            fontFamily: brand.font,
                                            fontStyle: brand.italic ? 'italic' : 'normal',
                                            fontSize: '1.15rem',
                                            fontWeight: 700,
                                            letterSpacing: brand.font.includes('Oswald') ? '0.08em' : '0',
                                            textTransform: brand.font.includes('Oswald') ? 'uppercase' : 'none',
                                        }}
                                    >
                                        {brand.name}
                                    </Link>,
                                    <span key={`s-${rep}-${brand.slug}`} className="text-gray-300 text-lg shrink-0 mx-4 select-none">✦</span>,
                                ])
                            )}
                        </div>
                    </section>

                    {/* Why You'll Love Hapag */}
                    <section className="py-20 bg-gray-50">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-14">
                                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800">
                                    Why You'll Love <span className="text-green-600">Hapag</span>
                                </h2>
                                <p className="text-gray-500 mt-3 text-base">Built for Laguna locals who love good food without the hassle.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    {
                                        title: 'Easy to Order',
                                        desc: 'Browse menus from local Laguna restaurants, add to your cart, and check out in minutes — all from your phone or laptop.',
                                        icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />,
                                    },
                                    {
                                        title: 'Pickup or Delivery',
                                        desc: 'Pick up your order fresh from the restaurant, or choose Cash on Delivery and have it brought straight to your door — your call.',
                                        icon: (
                                            <>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                            </>
                                        ),
                                    },
                                    {
                                        title: 'Deals & Vouchers',
                                        desc: 'Save with voucher codes from your favorite restaurants or site-wide promos. New deals drop regularly — check back often.',
                                        icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />,
                                    },
                                ].map(({ title, desc, icon }) => (
                                    <div key={title} className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                                        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                {icon}
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Meet the Restaurants */}
                    <section className="py-20 bg-white relative overflow-hidden">
                        <div className="absolute -right-20 top-10 w-72 h-72 bg-green-500/5 rounded-full blur-3xl" />
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800">Meet the Restaurants</h2>
                                <p className="text-gray-500 mt-3 text-base">Six homegrown brands, 30 branches — all across Laguna.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {BRANDS.map((brand) => (
                                    <Link
                                        key={brand.slug}
                                        href={route('restaurants.index')}
                                        className="group relative rounded-2xl overflow-hidden aspect-[3/2] bg-gray-100 shadow-sm hover:shadow-lg transition-all duration-300"
                                    >
                                        <img src={brand.image} alt={brand.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-all duration-300" />
                                        <div className="absolute bottom-0 left-0 right-0 p-5">
                                            <h3
                                                className="text-white text-xl leading-tight mb-1 drop-shadow-md"
                                                style={{
                                                    fontFamily: brand.font,
                                                    fontStyle: brand.italic ? 'italic' : 'normal',
                                                    fontWeight: 700,
                                                    letterSpacing: brand.font.includes('Oswald') ? '0.06em' : '0',
                                                    textTransform: brand.font.includes('Oswald') ? 'uppercase' : 'none',
                                                }}
                                            >
                                                {brand.name}
                                            </h3>
                                            <p className="text-white/70 text-sm">{brand.tagline}</p>
                                        </div>
                                        <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            <div className="mt-10 text-center">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Now serving in</p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {MUNICIPALITIES.map((city) => (
                                        <span key={city} className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">{city}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* How It Works */}
                    <section className="py-20 bg-gray-50">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800">Your food in 3 easy steps</h2>
                                <p className="text-gray-500 mt-3 text-base max-w-lg mx-auto">No complicated process. Just pick, order, and enjoy real Laguna flavors.</p>
                            </div>
                            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                                <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 border-t-2 border-dashed border-gray-200" />
                                {[
                                    { step: 1, title: 'Pick a Restaurant', desc: 'Browse local favorites across Laguna — from carinderia classics to neighborhood cafés.', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
                                    { step: 2, title: 'Build Your Order', desc: 'Explore the menu, add dishes to your cart, and apply a voucher if you have one.', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /> },
                                    { step: 3, title: 'Pick Up & Enjoy', desc: 'Grab your food fresh from the restaurant — or get it delivered right to your door.', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /> },
                                ].map(({ step, title, desc, icon }) => (
                                    <div key={step} className="text-center relative">
                                        <div className="relative inline-block mb-6">
                                            <span className="absolute -top-2 -right-2 w-7 h-7 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md z-10">{step}</span>
                                            <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-gray-100 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>{icon}</svg>
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* CTA Banner */}
                    <section className="py-16 bg-white">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="relative bg-gray-800 rounded-3xl overflow-hidden px-8 py-14 md:px-16 md:py-16">
                                <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full border-[3px] border-white/10" />
                                <div className="absolute -right-5 -top-5 w-36 h-36 rounded-full border-[3px] border-white/10" />
                                <div className="relative max-w-lg">
                                    <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4">Get exclusive deals<br />by signing up!</h2>
                                    <p className="text-white/70 text-base leading-relaxed mb-8">Create your free account to unlock voucher codes, order from local Laguna restaurants, and pick up your food hassle-free.</p>
                                    <Link href={route('register')} className="inline-block px-8 py-3.5 bg-green-500 text-white text-sm font-bold rounded-full hover:bg-green-600 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">Get Started</Link>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* ── Footer ───────────────────────────────────────────────── */}
                <footer className="bg-gray-800 text-white relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center pointer-events-none select-none overflow-hidden h-32">
                        <span className="text-[10rem] font-extrabold tracking-tighter text-white/[0.04] leading-none -mb-6">hapag</span>
                    </div>
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">
                            <div>
                                <h3 className="text-2xl font-bold text-green-400 mb-3">Hapag</h3>
                                <p className="text-sm text-gray-400 leading-relaxed mb-3">Good food, right to your table.<br />Serving Laguna province, Philippines.</p>
                                <span className="inline-block text-xs text-gray-600 bg-white/5 px-3 py-1 rounded-full border border-white/10">Pickup &amp; Delivery · Cash Payment</span>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Explore</h4>
                                <ul className="space-y-2.5 text-sm">
                                    <li><Link href={route('home')} className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                                    <li><Link href={route('restaurants.index')} className="text-gray-400 hover:text-white transition-colors">Browse Restaurants</Link></li>
                                    <li><Link href={route('login')} className="text-gray-400 hover:text-white transition-colors">Sign In</Link></li>
                                    <li><Link href={route('register')} className="text-gray-400 hover:text-white transition-colors">Create Account</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Restaurants</h4>
                                <ul className="space-y-2.5 text-sm">
                                    {BRANDS.map((brand) => (
                                        <li key={brand.slug}>
                                            <Link href={route('restaurants.index')} className="text-gray-400 hover:text-white transition-colors">{brand.name}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
                            <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} Hapag. For educational use only.</p>
                            <p className="text-xs text-gray-600">LSPU · ITEL 203 · Web Systems and Technologies</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}