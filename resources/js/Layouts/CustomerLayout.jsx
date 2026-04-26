import { useState, useRef, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';

export default function CustomerLayout({ children, cartCount = 0 }) {
    const { auth } = usePage().props;
    const user = auth?.user ?? null;

    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const profileRef = useRef(null);

    useEffect(() => {
        function onClickOutside(e) {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
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

    /* ====================================================================
       GUEST NAVBAR — floating pill, matches Guest.jsx
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
                                <Link
                                    key={label}
                                    href={href}
                                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${isActive(new URL(href).pathname) ? 'text-green-600 font-bold' : 'text-gray-500 hover:text-gray-800'}`}
                                >
                                    {label}
                                </Link>
                            ))}
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
                            {guestLinks.map(({ label, href }) => (
                                <Link key={label} href={href} className={`block px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${isActive(new URL(href).pathname) ? 'bg-gray-100 text-gray-800 font-bold' : 'text-gray-500 hover:bg-gray-50'}`} onClick={() => setMobileOpen(false)}>{label}</Link>
                            ))}
                            <div className="border-t border-gray-200 pt-2 mt-2 flex gap-2">
                                <Link href={route('login')} className="flex-1 text-center px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors" onClick={() => setMobileOpen(false)}>Sign In</Link>
                                <Link href={route('register')} className="flex-1 text-center px-4 py-2 rounded-xl text-sm font-bold bg-green-500 text-white hover:bg-green-600 transition-colors" onClick={() => setMobileOpen(false)}>Sign Up</Link>
                            </div>
                        </div>
                    )}
                </div>
                <main className="flex-1">{children}</main>
            </div>
        );
    }

    /* ====================================================================
       AUTHENTICATED NAVBAR — original solid white bar
    ==================================================================== */
    const authLinks = [
        { label: 'Home', href: route('home') },
        { label: 'Restaurants', href: route('restaurants.index') },
        { label: 'My Orders', href: route('orders.index') },
        { label: 'Favorites', href: route('favorites') },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm h-16 flex items-center">
                <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 flex items-center gap-6">
                    <Link href={route('home')} className="shrink-0 text-xl font-extrabold tracking-tight text-gray-800 hover:text-green-500 transition-colors">
                        🍽️ Hapag
                    </Link>
                    <div className="hidden md:flex items-center gap-1 flex-1">
                        {authLinks.map(({ label, href }) => (
                            <Link
                                key={label}
                                href={href}
                                className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${isActive(new URL(href).pathname) ? 'text-green-500 bg-green-100' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
                            >
                                {label}
                            </Link>
                        ))}
                    </div>
                    <div className="flex items-center gap-1 ml-auto">
                        <Link href={route('cart.index')} className="relative p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors" title="Cart">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 5H19m-9 0a1 1 0 100 2 1 1 0 000-2zm7 0a1 1 0 100 2 1 1 0 000-2z" />
                            </svg>
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 leading-none">
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </Link>
                        <div className="relative" ref={profileRef}>
                            <button onClick={() => setProfileOpen((v) => !v)} className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-gray-100 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold shrink-0">{initial}</div>
                                <span className="hidden sm:block text-sm font-semibold text-gray-800 max-w-[90px] truncate">{firstName}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-500 shrink-0 transition-transform ${profileOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {profileOpen && (
                                <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 w-48 z-50">
                                    <div className="px-4 py-2 border-b border-gray-200 mb-1">
                                        <p className="text-xs font-bold text-gray-800 truncate">{user.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>
                                    <Link href={route('profile.edit')} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-100 transition-colors" onClick={() => setProfileOpen(false)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        My Account
                                    </Link>
                                    <Link href={route('orders.index')} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-100 transition-colors" onClick={() => setProfileOpen(false)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                        My Orders
                                    </Link>
                                    <div className="border-t border-gray-200 mt-1 pt-1">
                                        <button onClick={logout} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                            Log Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button onClick={() => setMobileOpen((v) => !v)} className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors">
                            {mobileOpen ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                            )}
                        </button>
                    </div>
                </div>
                {mobileOpen && (
                    <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-md md:hidden z-40">
                        <div className="px-4 py-3 space-y-1">
                            {authLinks.map(({ label, href }) => (
                                <Link key={label} href={href} className={`block px-3 py-2.5 rounded-md text-sm font-semibold transition-colors ${isActive(new URL(href).pathname) ? 'text-green-500 bg-green-100' : 'text-gray-800 hover:bg-gray-100'}`} onClick={() => setMobileOpen(false)}>{label}</Link>
                            ))}
                        </div>
                    </div>
                )}
            </nav>
            <main className="flex-1">{children}</main>
        </div>
    );
}