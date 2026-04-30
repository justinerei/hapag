import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * AddressAutocomplete – Reusable address search component for Hapag.
 *
 * Uses OpenStreetMap's Nominatim API (free, no API key) to search addresses
 * scoped to Laguna province, Philippines. Returns both the full display address
 * and the extracted municipality name (for restaurant filtering).
 *
 * ─── USAGE ────────────────────────────────────────────────────────────────────
 *
 *   <AddressAutocomplete
 *       value={address}
 *       onChange={(fullAddress, municipality) => {
 *           setAddress(fullAddress);
 *           setMunicipality(municipality);
 *       }}
 *       placeholder="Search your address in Laguna..."
 *       label="Delivery Address"
 *       className="mt-2"
 *   />
 *
 * ─── PROPS ────────────────────────────────────────────────────────────────────
 *
 *   value        (string)   – controlled input value (the full address text)
 *   onChange      (fn)       – called with (fullAddress, municipality) on selection
 *                              or manual typing. municipality may be null if
 *                              it can't be extracted from the Nominatim result.
 *   placeholder   (string)   – input placeholder text
 *   label         (string)   – optional label above the input
 *   hint          (string)   – optional hint text below the input
 *   className     (string)   – additional wrapper classes
 *   inputClassName(string)   – override input element classes entirely
 *   disabled      (boolean)  – disable the input
 *   autoFocus     (boolean)  – focus on mount
 *   error         (string)   – error message to display below input
 *
 * ─── HOW IT WORKS ─────────────────────────────────────────────────────────────
 *
 *   1. User types ≥ 3 characters → debounced (350ms) Nominatim search
 *   2. Results scoped to Laguna bounding box (viewbox + bounded=1)
 *   3. Suggestions appear in a dropdown below the input
 *   4. On selection → full display_name goes to input, municipality extracted
 *      from Nominatim's address breakdown (city / town / municipality field)
 *   5. User can also type freely — onChange fires with (typedText, null)
 *
 * ─── NOMINATIM NOTES ──────────────────────────────────────────────────────────
 *
 *   - Free, no API key, no signup
 *   - Rate limit: 1 request/second (our debounce handles this)
 *   - Usage policy: must include a User-Agent and respect the rate limit
 *   - We add `countrycodes=ph` and a Laguna bounding box for scoping
 */

// ── Laguna bounding box (approximate) ──────────────────────────────────────────
// Southwest: 14.00, 121.00  |  Northeast: 14.50, 121.70
const LAGUNA_VIEWBOX = '121.00,14.50,121.70,14.00'; // left,top,right,bottom

// Known Laguna municipalities — used to match/validate extracted municipality
const LAGUNA_MUNICIPALITIES = [
    'Alaminos', 'Bay', 'Biñan', 'Cabuyao', 'Calamba',
    'Calauan', 'Cavinti', 'Famy', 'Kalayaan', 'Liliw',
    'Los Baños', 'Luisiana', 'Lumban', 'Mabitac', 'Magdalena',
    'Majayjay', 'Nagcarlan', 'Paete', 'Pagsanjan', 'Pakil',
    'Pangil', 'Pila', 'Rizal', 'San Pablo', 'San Pedro',
    'Santa Cruz', 'Santa Maria', 'Santa Rosa', 'Siniloan', 'Victoria',
];

// ── Debounce helper ────────────────────────────────────────────────────────────

function useDebounce(callback, delay) {
    const timer = useRef(null);
    const stableCallback = useRef(callback);
    stableCallback.current = callback;

    const debounced = useCallback((...args) => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => stableCallback.current(...args), delay);
    }, [delay]);

    useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

    return debounced;
}

// ── Extract municipality from Nominatim address object ─────────────────────────

function extractMunicipality(address) {
    // Nominatim returns municipality info in various fields depending on the place type
    const candidates = [
        address?.city,
        address?.town,
        address?.municipality,
        address?.city_district,
        address?.village,
        address?.suburb,
    ].filter(Boolean);

    for (const candidate of candidates) {
        // Check if it matches a known Laguna municipality (case-insensitive)
        const match = LAGUNA_MUNICIPALITIES.find(
            m => m.toLowerCase() === candidate.toLowerCase()
                || candidate.toLowerCase().includes(m.toLowerCase())
        );
        if (match) return match;
    }

    // If "City of X" pattern, try extracting
    for (const candidate of candidates) {
        const cityMatch = candidate.match(/City of (\w[\w\s]*)/i);
        if (cityMatch) {
            const name = cityMatch[1].trim();
            const match = LAGUNA_MUNICIPALITIES.find(
                m => m.toLowerCase() === name.toLowerCase()
            );
            if (match) return match;
        }
    }

    // Return first candidate even if not in our list (could be a new municipality)
    return candidates[0] || null;
}

// ── Format a Nominatim result for display ──────────────────────────────────────

function formatSuggestion(result) {
    // Build a cleaner display than raw display_name
    const addr = result.address || {};
    const parts = [];

    // Street-level detail
    if (addr.house_number && addr.road) {
        parts.push(`${addr.house_number} ${addr.road}`);
    } else if (addr.road) {
        parts.push(addr.road);
    } else if (result.name && result.name !== addr.city && result.name !== addr.town) {
        parts.push(result.name);
    }

    // Barangay / neighborhood
    if (addr.suburb) parts.push(addr.suburb);
    if (addr.village && addr.village !== addr.suburb) parts.push(addr.village);

    // Municipality
    const muni = addr.city || addr.town || addr.municipality;
    if (muni) parts.push(muni);

    // Province
    if (addr.state || addr.county) parts.push(addr.state || addr.county);

    return {
        main:      parts.slice(0, 2).join(', ') || result.display_name.split(',')[0],
        secondary: parts.slice(2).join(', ') || '',
        full:      result.display_name,
    };
}

// ── Icons ──────────────────────────────────────────────────────────────────────

function SearchIcon({ className = 'h-4 w-4' }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
    );
}

function LocationPinIcon({ className = 'h-4 w-4' }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
    );
}

function SpinnerIcon({ className = 'h-4 w-4' }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    );
}

// ── Default input classes (matches Hapag design system) ────────────────────────

const DEFAULT_INPUT_CLS = [
    'w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 bg-white',
    'text-sm text-gray-800 placeholder:text-gray-400',
    'focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500',
    'transition-colors',
].join(' ');

// ── Component ──────────────────────────────────────────────────────────────────

export default function AddressAutocomplete({
    value = '',
    onChange,
    placeholder = 'Search address in Laguna...',
    label,
    hint,
    className = '',
    inputClassName,
    disabled = false,
    autoFocus = false,
    error,
}) {
    const [query, setQuery]             = useState(value);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading]         = useState(false);
    const [open, setOpen]               = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const wrapperRef = useRef(null);
    const inputRef   = useRef(null);

    // Sync external value changes
    useEffect(() => { setQuery(value); }, [value]);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClick(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // ── Nominatim search ───────────────────────────────────────────────────
    // We run two searches in parallel for better coverage:
    //   1. A "structured" search using street= and county=Laguna (better for house/street numbers)
    //   2. A freeform search with the raw query scoped to the Laguna bounding box
    // Then we merge and deduplicate results by place_id.

    const searchNominatim = useDebounce(async (q) => {
        if (!q || q.length < 3) {
            setSuggestions([]);
            setOpen(false);
            return;
        }

        setLoading(true);
        try {
            // Search 1: Structured — treats the input as a street/address within Laguna
            const structuredParams = new URLSearchParams({
                street:         q,
                county:         'Laguna',
                country:        'Philippines',
                format:         'json',
                addressdetails: '1',
                limit:          '5',
            });

            // Search 2: Freeform — raw query bounded to the Laguna area
            const freeformParams = new URLSearchParams({
                q:              q,
                format:         'json',
                addressdetails: '1',
                limit:          '5',
                countrycodes:   'ph',
                viewbox:        LAGUNA_VIEWBOX,
                bounded:        '1',
            });

            const headers = {
                'Accept-Language': 'en',
                'User-Agent':     'HapagFoodApp/1.0',
            };

            const [structuredRes, freeformRes] = await Promise.all([
                fetch(`https://nominatim.openstreetmap.org/search?${structuredParams}`, { headers })
                    .then(r => r.ok ? r.json() : [])
                    .catch(() => []),
                // Small delay on the second request to respect rate limit
                new Promise(resolve => setTimeout(resolve, 150))
                    .then(() => fetch(`https://nominatim.openstreetmap.org/search?${freeformParams}`, { headers }))
                    .then(r => r.ok ? r.json() : [])
                    .catch(() => []),
            ]);

            // Merge and deduplicate by place_id, structured results first (usually more precise)
            const seen = new Set();
            const merged = [];
            for (const result of [...structuredRes, ...freeformRes]) {
                if (!seen.has(result.place_id)) {
                    seen.add(result.place_id);
                    merged.push(result);
                }
            }

            // Cap at 6 results
            const final = merged.slice(0, 6);
            setSuggestions(final);
            setOpen(final.length > 0);
            setActiveIndex(-1);
        } catch (err) {
            console.error('Address search failed:', err);
            setSuggestions([]);
            setOpen(false);
        } finally {
            setLoading(false);
        }
    }, 400);

    // ── Handlers ───────────────────────────────────────────────────────────

    function handleInputChange(e) {
        const val = e.target.value;
        setQuery(val);
        onChange?.(val, null); // fire with null municipality during typing
        searchNominatim(val);
    }

    function handleSelect(result) {
        const municipality = extractMunicipality(result.address || {});
        const fullAddress  = result.display_name;

        setQuery(fullAddress);
        setSuggestions([]);
        setOpen(false);
        onChange?.(fullAddress, municipality);
    }

    function handleKeyDown(e) {
        if (!open || suggestions.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(i => (i < suggestions.length - 1 ? i + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(i => (i > 0 ? i - 1 : suggestions.length - 1));
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault();
            handleSelect(suggestions[activeIndex]);
        } else if (e.key === 'Escape') {
            setOpen(false);
        }
    }

    function handleFocus() {
        if (suggestions.length > 0) setOpen(true);
    }

    // ── Render ─────────────────────────────────────────────────────────────

    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            {/* Label */}
            {label && (
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {label}
                </label>
            )}

            {/* Input with search icon */}
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    {loading ? <SpinnerIcon className="h-4 w-4" /> : <SearchIcon className="h-4 w-4" />}
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    placeholder={placeholder}
                    disabled={disabled}
                    autoFocus={autoFocus}
                    autoComplete="off"
                    className={inputClassName || DEFAULT_INPUT_CLS}
                    role="combobox"
                    aria-expanded={open}
                    aria-autocomplete="list"
                    aria-controls="address-suggestions"
                />
                {/* Clear button */}
                {query && !disabled && (
                    <button
                        type="button"
                        onClick={() => {
                            setQuery('');
                            setSuggestions([]);
                            setOpen(false);
                            onChange?.('', null);
                            inputRef.current?.focus();
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                        aria-label="Clear address"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                )}
            </div>

            {/* Hint */}
            {hint && !error && (
                <p className="text-[11px] text-gray-400 mt-1.5 ml-0.5">{hint}</p>
            )}

            {/* Error */}
            {error && (
                <p className="text-xs font-semibold text-red-500 mt-1.5 ml-0.5">{error}</p>
            )}

            {/* Suggestions dropdown */}
            {open && suggestions.length > 0 && (
                <ul
                    id="address-suggestions"
                    role="listbox"
                    className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden z-50 max-h-64 overflow-y-auto"
                >
                    {suggestions.map((result, idx) => {
                        const display = formatSuggestion(result);
                        const isActive = idx === activeIndex;

                        return (
                            <li
                                key={result.place_id}
                                role="option"
                                aria-selected={isActive}
                                onMouseEnter={() => setActiveIndex(idx)}
                                onClick={() => handleSelect(result)}
                                className={`flex items-start gap-2.5 px-3.5 py-2.5 cursor-pointer transition-colors ${
                                    isActive
                                        ? 'bg-green-50'
                                        : 'hover:bg-gray-50'
                                }`}
                            >
                                <div className={`mt-0.5 shrink-0 ${isActive ? 'text-green-500' : 'text-gray-400'}`}>
                                    <LocationPinIcon className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className={`text-sm font-medium truncate ${isActive ? 'text-green-700' : 'text-gray-800'}`}>
                                        {display.main}
                                    </p>
                                    {display.secondary && (
                                        <p className="text-xs text-gray-400 truncate mt-0.5">
                                            {display.secondary}
                                        </p>
                                    )}
                                </div>
                            </li>
                        );
                    })}

                    {/* Nominatim attribution (required by usage policy) */}
                    <li className="px-3.5 py-1.5 border-t border-gray-100 bg-gray-50">
                        <p className="text-[9px] text-gray-400 text-right">
                            Powered by <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">OpenStreetMap</a>
                        </p>
                    </li>
                </ul>
            )}

            {/* No results message */}
            {open && suggestions.length === 0 && !loading && query.length >= 3 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl border border-gray-200 shadow-xl z-50 px-4 py-3">
                    <p className="text-sm text-gray-500 text-center">No addresses found in Laguna for "{query}"</p>
                    <p className="text-[11px] text-gray-400 text-center mt-1">Try a more specific search like a street or barangay name</p>
                </div>
            )}
        </div>
    );
}
