import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import SignUpModal from '@/Components/SignUpModal';
import SignInModal from '@/Components/SignInModal';
import AddressAutocomplete from '@/Components/AddressAutocomplete';

const MUNICIPALITIES = [
    'Santa Cruz', 'Pagsanjan', 'Los Baños', 'Calamba',
    'San Pablo', 'Bay', 'Nagcarlan', 'Pila',
];

function csrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.content ?? '';
}

function fmt(price) {
    return '₱' + Number(price).toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// ── Live Search Dropdown ──────────────────────────────────────────────────────

function SearchBar({ initialValue = '', onSearchPage, onSearchSubmit }) {
    const [query, setQuery] = useState(initialValue);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState(false);
    const wrapperRef = useRef(null);
    const debounceRef = useRef(null);
    const inputRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        function onClickOutside(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setFocused(false);
            }
        }
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    // Debounced live search
    const doSearch = useCallback(async (q) => {
        if (q.length < 2) { setResults(null); return; }
        setLoading(true);
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
            if (res.ok) {
                const data = await res.json();
                setResults(data);
            }
        } catch { /* ignore */ }
        setLoading(false);
    }, []);

    function handleChange(val) {
        setQuery(val);
        // Also update parent search state if on homepage
        if (onSearchPage) onSearchPage(val);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => doSearch(val), 300);
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (query.trim().length < 2) return;
        setFocused(false);
        if (onSearchSubmit) {
            onSearchSubmit(query.trim());
        } else {
            router.visit(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    }

    function goToSearch() {
        setFocused(false);
        router.visit(`/search?q=${encodeURIComponent(query.trim())}`);
    }

    const showDropdown = focused && query.length >= 2 && results;
    const hasResults = results && (results.restaurants?.length > 0 || results.dishes?.length > 0);
    
    return (
        <div className="relative" ref={wrapperRef}>
            <form onSubmit={handleSubmit}>
                <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg"
                         className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
                         fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => handleChange(e.target.value)}
                        onFocus={() => setFocused(true)}
                        placeholder="Search for restaurants, cuisines, or dishes..."
                        className="w-full pl-9 pr-9 py-2 rounded-full bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => { handleChange(''); inputRef.current?.focus(); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    )}
                </div>
            </form>

            {/* Dropdown */}
            {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-[420px] overflow-y-auto">
                    {loading && (
                        <div className="px-4 py-3 text-xs text-gray-400 flex items-center gap-2">
                            <div className="flex gap-1">
                                <div className="w-1 h-1 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-1 h-1 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-1 h-1 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                            Searching…
                        </div>
                    )}

                    {!loading && !hasResults && (
                        <div className="px-4 py-6 text-center">
                            <span className="text-2xl block mb-1">🔍</span>
                            <p className="text-gray-500 text-xs font-semibold">No results for "{query}"</p>
                        </div>
                    )}

                    {!loading && hasResults && (
                        <>
                            {/* Restaurants */}
                            {results.restaurants?.length > 0 && (
                                <div>
                                    <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Restaurants</p>
                                    {results.restaurants.map(r => (
                                        <Link
                                            key={r.id}
                                            href={route('restaurants.show', r.id)}
                                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                                            onClick={() => setFocused(false)}
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                                {r.image_url ? (
                                                    <img src={r.image_url} alt={r.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-lg">{r.category?.icon ?? '🍽️'}</div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-gray-800 truncate">{r.name}</p>
                                                <p className="text-xs text-gray-400">{r.municipality}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Dishes */}
                            {results.dishes?.length > 0 && (
                                <div className={results.restaurants?.length > 0 ? 'border-t border-gray-100' : ''}>
                                    <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dishes</p>
                                    {results.dishes.map(d => (
                                        <Link
                                            key={d.id}
                                            href={route('restaurants.show', d.restaurant_id)}
                                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                                            onClick={() => setFocused(false)}
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                                {d.image_url ? (
                                                    <img src={d.image_url} alt={d.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-lg">🍽️</div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-800 truncate">{d.name}</p>
                                                <p className="text-xs text-gray-400 truncate">{d.restaurant?.name}</p>
                                            </div>
                                            <span className="text-xs font-bold text-green-600 shrink-0">{fmt(d.price)}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* See all link */}
                            <div className="border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={goToSearch}
                                    className="w-full px-4 py-3 text-xs font-bold text-green-600 hover:bg-green-50 transition-colors flex items-center justify-center gap-1"
                                >
                                    See all results for "{query}"
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                                    </svg>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}


// ── Main Layout ───────────────────────────────────────────────────────────────

export default function CustomerLayout({ children, cartCount = 0, onSearch, onSearchSubmit, initialSearch = '', hideSearch = false }) {
    const { auth } = usePage().props;
    const user = auth?.user ?? null;

    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [signUpOpen, setSignUpOpen] = useState(false);
    const [signInOpen, setSignInOpen] = useState(false);

    // Location selector
    const [locationOpen, setLocationOpen] = useState(false);
    const [updatingLocation, setUpdatingLocation] = useState(false);
    const profileRef = useRef(null);

    // Close dropdowns on outside click
    useEffect(() => {
        function onClickOutside(e) {
            if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
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

    async function changeMunicipality(m) {
        setUpdatingLocation(true);
        try {
            await fetch(route('profile.municipality'), {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken() },
                body: JSON.stringify({ municipality: m, address: null }),
            });
            setLocationOpen(false);
            router.reload();
        } catch { /* ignore */ }
        setUpdatingLocation(false);
    }

    /* ====================================================================
       GUEST NAVBAR
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
                            <button onClick={() => setMobileOpen(v => !v)} className="md:hidden ml-1 p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </nav>
                    {mobileOpen && (
                        <div className="max-w-6xl mx-auto mt-1 bg-white rounded-2xl shadow-md px-4 py-3 space-y-1">
                            {guestLinks.map(({ label, href }) => (
                                <Link key={label} href={href} className={`block px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${isActive(new URL(href).pathname) ? 'bg-gray-100 text-gray-800' : 'text-gray-500 hover:bg-gray-50'}`} onClick={() => setMobileOpen(false)}>{label}</Link>
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
       AUTHENTICATED NAVBAR
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

                    {/* Location pill — shows address or municipality */}
                    <div className="hidden sm:block shrink-0">
                        <button
                            onClick={() => setLocationOpen(true)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-gray-50 transition-colors text-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            <span className="font-semibold text-gray-800 max-w-[160px] truncate">
                                {user.address || municipality}
                            </span>
                            <span className="text-gray-300">·</span>
                            <span className="text-gray-400 shrink-0">Now</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </button>
                    </div>

                    {/* Address search overlay — positioned below navbar, Foodpanda-style */}
                    {locationOpen && (
                        <>
                            {/* Dim overlay — only covers content below navbar */}
                            <div
                                className="fixed inset-0 top-14 bg-black/40 z-[60]"
                                onClick={() => setLocationOpen(false)}
                            />

                            {/* Panel — anchored right below the navbar */}
                            <div className="fixed top-14 left-0 right-0 z-[70] flex justify-center">
                                <div className="w-full max-w-xl bg-white shadow-2xl border-t border-gray-100 rounded-b-2xl">
                                    {/* Header */}
                                    <div className="flex items-center justify-between px-5 pt-4 pb-2">
                                        <h2 className="text-sm font-extrabold text-gray-800">Enter your address</h2>
                                        <button
                                            onClick={() => setLocationOpen(false)}
                                            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Autocomplete input */}
                                    <div className="px-5 pb-3">
                                        <AddressAutocomplete
                                            value=""
                                            onChange={async (fullAddress, extractedMunicipality) => {
                                                // Only save when user actually selected a suggestion
                                                if (!fullAddress || !extractedMunicipality) return;
                                                setUpdatingLocation(true);
                                                try {
                                                    await fetch(route('profile.municipality'), {
                                                        method: 'PATCH',
                                                        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken() },
                                                        body: JSON.stringify({
                                                            municipality: extractedMunicipality,
                                                            address: fullAddress,
                                                        }),
                                                    });
                                                    setLocationOpen(false);
                                                    router.reload();
                                                } catch { /* ignore */ }
                                                setUpdatingLocation(false);
                                            }}
                                            placeholder="Search street, barangay, or landmark..."
                                            autoFocus
                                        />
                                    </div>

                                    {/* Quick municipality picks */}
                                    <div className="border-t border-gray-100 px-5 pt-3 pb-4">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Popular locations</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {MUNICIPALITIES.map(m => (
                                                <button
                                                    key={m}
                                                    onClick={() => changeMunicipality(m)}
                                                    disabled={updatingLocation}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                                        m === municipality
                                                            ? 'bg-green-500 text-white'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    } ${updatingLocation ? 'opacity-50' : ''}`}
                                                >
                                                    {m}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Desktop search with live dropdown */}
                    {!hideSearch && (
                        <div className="flex-1 max-w-lg mx-auto hidden md:block">
                            <SearchBar initialValue={initialSearch} onSearchPage={onSearch} onSearchSubmit={onSearchSubmit} />
                        </div>
                    )}

                    {/* Right: icon buttons + profile */}
                    <div className="flex items-center gap-0.5 ml-auto">

                        {/* Mobile search toggle */}
                        {!hideSearch && (
                            <button
                                onClick={() => setMobileSearchOpen(v => !v)}
                                className="md:hidden p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                                title="Search"
                            >
                                {mobileSearchOpen ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                    </svg>
                                )}
                            </button>
                        )}

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
                                onClick={() => setProfileOpen(v => !v)}
                                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full hover:bg-gray-50 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        initial
                                    )}
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
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                        My Account
                                    </Link>
                                    <Link href={route('orders.index')} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setProfileOpen(false)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                                        My Orders
                                    </Link>
                                    <div className="border-t border-gray-100 mt-1 pt-1">
                                        <button onClick={logout} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                                            Log Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile search bar — slides down */}
                {!hideSearch && mobileSearchOpen && (
                    <div className="md:hidden bg-white border-b border-gray-100 px-4 py-2.5">
                        <SearchBar initialValue={initialSearch} onSearchPage={onSearch} onSearchSubmit={onSearchSubmit} />
                    </div>
                )}
            </nav>

            <main className="flex-1">{children}</main>
        </div>
    );
}