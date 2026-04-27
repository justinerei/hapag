import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import SignUpModal from '@/Components/SignUpModal';
import SignInModal from '@/Components/SignInModal';

const MUNICIPALITIES = [
    'Santa Cruz', 'Pagsanjan', 'Los Baños', 'Calamba',
    'San Pablo', 'Bay', 'Nagcarlan', 'Pila',
];

export default function CustomerLayout({ children, cartCount = 0, onSearch }) {
    const { auth } = usePage().props;
    const user = auth?.user ?? null;

    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [signUpOpen, setSignUpOpen] = useState(false);
    const [signInOpen, setSignInOpen] = useState(false);

    // Location selector
    const [locationOpen, setLocationOpen] = useState(false);
    const [updatingLocation, setUpdatingLocation] = useState(false);
    const locationRef = useRef(null);

    // Search
    const [searchValue, setSearchValue] = useState('');
    const searchRef = useRef(null);

    const profileRef = useRef(null);

    // Close dropdowns on outside click
    useEffect(() => {
        function onClickOutside(e) {
            if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
            if (locationRef.current && !locationRef.current.contains(e.target)) setLocationOpen(false);
        }
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    useEffect(() => {
        if (user) return;
        function onScroll() { setScrolled(window.scrollY > 20); }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, [user]);

    const logout = () => router.post(route('logout'));
    const firstName = user ? user.name.split(' ')[0] : null;
    const initial = user ? user.name.charAt(0).toUpperCase() : '?';
    const currentUrl = usePage().url;
    const isActive = (path) => currentUrl === path || currentUrl.startsWith(path + '/');

    // Update municipality via AJAX
    const csrf = () => document.querySelector('meta[name="csrf-token"]')?.content ?? '';

    async function changeMunicipality(m) {
        setUpdatingLocation(true);
        try {
            await fetch(route('profile.municipality'), {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
                body: JSON.stringify({ municipality: m }),
            });
            setLocationOpen(false);
            router.reload({ only: ['restaurants', 'popular', 'weather', 'weatherTag', 'suggested', 'weatherItems'] });
        } catch { /* ignore */ }
        setUpdatingLocation(false);
    }

    // Search handler — calls parent callback if available, otherwise navigate
    const handleSearchChange = useCallback((val) => {
        setSearchValue(val);
        if (onSearch) {
            onSearch(val);
        }
    }, [onSearch]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (!onSearch && searchValue.trim()) {
            router.visit(route('restaurants.index') + '?q=' + encodeURIComponent(searchValue.trim()));
        }
    };

    /* ====================================================================
       GUEST NAVBAR — floating pill
    ==================================================================== */
    if (!user) {
        const guestLinks = [
            { label: 'Home', href: route('home') },
            { label: 'Restaurants', href: route('restaurants.index') },
        ];

        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <div className="sticky top-0 z-50 px-4 pt-4 pb-1">
                    <nav className={`max-w-6xl mx-auto transition-all duration-300 px-6 h-16 flex items-center justify-between rounded-2xl ${scrolled ? 'bg-white shadow-md' : 'bg-white/80 backdrop-blur-sm'}`}>
                        <Link href={route('home')} className="shrink-0">
                            <span className="text-2xl font-bold tracking-tight text-green-600">Hapag</span>
                        </Link>
                        <div className="hidden md:flex items-center gap-1">
                            {guestLinks.map(({ label, href }) => (
                                <Link key={label} href={href}
                                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${isActive(new URL(href).pathname) ? 'text-green-600 font-bold' : 'text-gray-500 hover:text-gray-800'}`}>
                                    {label}
                                </Link>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setSignInOpen(true)} className="hidden sm:block px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">Sign In</button>
                            <button onClick={() => setSignUpOpen(true)} className="px-5 py-2.5 rounded-full text-sm font-bold bg-green-500 text-white hover:bg-green-600 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">Sign Up</button>
                            <button onClick={() => setMobileOpen((v) => !v)} className="md:hidden ml-1 p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </nav>
                    {mobileOpen && (
                        <div className="max-w-6xl mx-auto mt-1 bg-white rounded-2xl shadow-md px-4 py-3 space-y-1">
                            {guestLinks.map(({ label, href }) => (
                                <Link key={label} href={href} className={`block px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${isActive(new URL(href).pathname) ? 'bg-gray-100 text-gray-800 font-bold' : 'text-gray-500 hover:bg-gray-50'}`} onClick={() => setMobileOpen(false)}>{label}</Link>
                            ))}
                            <div className="border-t border-gray-200 pt-2 mt-2 flex gap-2">
                                <button onClick={() => { setMobileOpen(false); setSignInOpen(true); }} className="flex-1 text-center px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors">Sign In</button>
                                <button onClick={() => { setMobileOpen(false); setSignUpOpen(true); }} className="flex-1 text-center px-4 py-2 rounded-xl text-sm font-bold bg-green-500 text-white hover:bg-green-600 transition-colors">Sign Up</button>
                            </div>
                        </div>
                    )}
                </div>
                <main className="flex-1">{children}</main>
                <SignUpModal show={signUpOpen} onClose={() => setSignUpOpen(false)} onSwitchToSignIn={() => setSignInOpen(true)} />
                <SignInModal show={signInOpen} onClose={() => setSignInOpen(false)} onSwitchToSignUp={() => setSignUpOpen(true)} />
            </div>
        );
    }

    /* ====================================================================
       AUTHENTICATED NAVBAR — minimal, icon-driven
    ==================================================================== */
    const municipality = user.municipality ?? 'Laguna';

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 h-14">
                <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 h-full flex items-center gap-3 sm:gap-4">

                    {/* Logo */}
                    <Link href={route('home')} className="shrink-0 text-xl font-extrabold tracking-tight text-green-600 hover:text-green-700 transition-colors">
                        Hapag
                    </Link>

                    {/* Location pill — clickable dropdown */}
                    <div className="relative hidden sm:block shrink-0" ref={locationRef}>
                        <button
                            onClick={() => setLocationOpen(v => !v)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-gray-50 transition-colors text-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            <span className="font-semibold text-gray-800">{municipality}</span>
                            <span className="text-gray-300">·</span>
                            <span className="text-gray-400">Now</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${locationOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </button>

                        {locationOpen && (
                            <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 w-52 z-50">
                                <p className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Location</p>
                                {MUNICIPALITIES.map(m => (
                                    <button
                                        key={m}
                                        onClick={() => changeMunicipality(m)}
                                        disabled={updatingLocation}
                                        className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between ${
                                            m === municipality
                                                ? 'text-green-600 font-bold bg-green-50'
                                                : 'text-gray-700 hover:bg-gray-50 font-medium'
                                        } ${updatingLocation ? 'opacity-50' : ''}`}
                                    >
                                        <span>{m}</span>
                                        {m === municipality && (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                                            </svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Search bar — functional input */}
                    <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg mx-auto hidden md:block">
                        <div className="relative">
                            <svg xmlns="http://www.w3.org/2000/svg"
                                 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
                                 fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                            <input
                                ref={searchRef}
                                type="text"
                                value={searchValue}
                                onChange={e => handleSearchChange(e.target.value)}
                                placeholder="Search for restaurants, cuisines, or dishes..."
                                className="w-full pl-9 pr-4 py-2 rounded-full bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
                            />
                            {searchValue && (
                                <button
                                    type="button"
                                    onClick={() => handleSearchChange('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                </button>
                            )}
                        </div>
                    </form>

                    {/* Right: icon buttons + profile */}
                    <div className="flex items-center gap-0.5 ml-auto">

                        {/* Mobile search toggle */}
                        <button
                            onClick={() => setMobileOpen(v => !v)}
                            className="md:hidden p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                            title="Search"
                        >
                            {mobileOpen ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                </svg>
                            )}
                        </button>

                        {/* Favorites */}
                        <Link
                            href={route('favorites')}
                            className={`p-2 rounded-full transition-colors ${isActive('/favorites') ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                            title="Favorites"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isActive('/favorites') ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                            </svg>
                        </Link>

                        {/* Cart */}
                        <Link
                            href={route('cart.index')}
                            className={`relative p-2 rounded-full transition-colors ${isActive('/cart') ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                            title="Cart"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 5H19m-9 0a1 1 0 100 2 1 1 0 000-2zm7 0a1 1 0 100 2 1 1 0 000-2z"/>
                            </svg>
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 leading-none">
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Profile dropdown */}
                        <div className="relative ml-1" ref={profileRef}>
                            <button
                                onClick={() => setProfileOpen((v) => !v)}
                                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full hover:bg-gray-50 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                                    {initial}
                                </div>
                                <span className="hidden sm:block text-sm font-semibold text-gray-800 max-w-[80px] truncate">
                                    {firstName}
                                </span>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-3.5 w-3.5 text-gray-400 shrink-0 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {profileOpen && (
                                <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 w-52 z-50">
                                    <div className="px-4 py-2.5 border-b border-gray-100 mb-1">
                                        <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                    </div>

                                    <Link href={route('profile.edit')} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setProfileOpen(false)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                        </svg>
                                        My Account
                                    </Link>

                                    <Link href={route('orders.index')} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setProfileOpen(false)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                        </svg>
                                        My Orders
                                    </Link>

                                    <div className="border-t border-gray-100 mt-1 pt-1">
                                        <button onClick={logout} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                                            </svg>
                                            Log Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile search bar — slides down */}
                {mobileOpen && (
                    <div className="md:hidden bg-white border-b border-gray-100 px-4 py-2.5">
                        <form onSubmit={handleSearchSubmit} className="relative">
                            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                            <input
                                type="text"
                                value={searchValue}
                                onChange={e => handleSearchChange(e.target.value)}
                                placeholder="Search restaurants..."
                                className="w-full pl-9 pr-9 py-2.5 rounded-full bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
                                autoFocus
                            />
                            {searchValue && (
                                <button type="button" onClick={() => handleSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                </button>
                            )}
                        </form>
                    </div>
                )}
            </nav>

            <main className="flex-1">{children}</main>
        </div>
    );
}