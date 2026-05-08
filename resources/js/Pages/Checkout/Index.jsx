import { useState, useMemo, useRef } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import AddressAutocomplete from '@/Components/AddressAutocomplete';

// ── Constants ──────────────────────────────────────────────────────────────────

const DELIVERY_FEE = 49;

// Generate time slots for scheduling (next 3 days, 30-min intervals within restaurant hours)
function generateTimeSlots() {
    const slots = [];
    const now = new Date();

    for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
        const date = new Date(now);
        date.setDate(date.getDate() + dayOffset);

        const dayLabel = dayOffset === 0 ? 'Today' : dayOffset === 1 ? 'Tomorrow' : date.toLocaleDateString('en-PH', { weekday: 'long', month: 'short', day: 'numeric' });

        const daySlots = [];
        // Generate slots from 10:00 AM to 9:00 PM
        for (let hour = 10; hour <= 20; hour++) {
            for (let min = 0; min < 60; min += 30) {
                const slotDate = new Date(date);
                slotDate.setHours(hour, min, 0, 0);

                // Skip past times for today
                if (dayOffset === 0 && slotDate <= new Date(now.getTime() + 30 * 60000)) continue;

                const timeStr = slotDate.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true });
                daySlots.push({
                    label: timeStr,
                    value: slotDate.toISOString(),
                });
            }
        }

        if (daySlots.length > 0) {
            slots.push({ day: dayLabel, date: date.toISOString().split('T')[0], slots: daySlots });
        }
    }

    return slots;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(price) {
    return '₱ ' + Number(price).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function csrf() {
    return document.querySelector('meta[name="csrf-token"]')?.content ?? '';
}

// ── Icons ──────────────────────────────────────────────────────────────────────

function LocationIcon({ className = 'h-5 w-5' }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
    );
}

function CheckIcon({ className = 'h-4 w-4' }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
    );
}

function ClockIcon({ className = 'h-4 w-4' }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
    );
}

function VoucherIcon({ className = 'h-4 w-4' }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
        </svg>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function CheckoutIndex({ cartItems, restaurant, cartCount, allVouchers = [], orderType: initialOrderType }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const orderType = initialOrderType || 'pickup';
    const [pickupMode, setPickupMode]           = useState('standard'); // 'standard' | 'scheduled'
    const [scheduledAt, setScheduledAt]         = useState('');
    const [selectedDay, setSelectedDay]         = useState(0);
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [pickupNote, setPickupNote]           = useState('');
    const [voucherCode, setVoucherCode]         = useState('');
    const [voucherStatus, setVoucherStatus]     = useState(null);
    const [checking, setChecking]               = useState(false);
    const [voucherOpen, setVoucherOpen]         = useState(false);
    const [submitting, setSubmitting]           = useState(false);
    const [toast, setToast]                     = useState(null);
    const toastTimer = useRef(null);

    const timeSlots = useMemo(() => generateTimeSlots(), []);

    function showToast(message, isError = false) {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast({ message, isError });
        toastTimer.current = setTimeout(() => setToast(null), 3500);
    }

    // ── Derived totals ─────────────────────────────────────────────────────

    const subtotal    = useMemo(() => cartItems.reduce((sum, i) => sum + Number(i.menu_item.price) * i.quantity, 0), [cartItems]);
    const discount    = voucherStatus?.valid ? Number(voucherStatus.discount) : 0;
    const deliveryFee = orderType === 'delivery' ? DELIVERY_FEE : 0;
    const total       = Math.max(0, subtotal - discount) + deliveryFee;

    // ── Voucher ────────────────────────────────────────────────────────────

    async function applyVoucher(code) {
        const codeToUse = code || voucherCode.trim();
        if (!codeToUse) return;
        setChecking(true);
        setVoucherStatus(null);
        try {
            const res = await fetch(route('vouchers.validate'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
                body: JSON.stringify({ code: codeToUse }),
            });
            const data = await res.json();
            setVoucherStatus(data);
            if (data.valid) setVoucherCode(data.code);
        } catch {
            setVoucherStatus({ valid: false, message: 'Could not validate voucher.' });
        } finally {
            setChecking(false);
        }
    }

    function removeVoucher() {
        setVoucherStatus(null);
        setVoucherCode('');
    }

    // ── Checkout ───────────────────────────────────────────────────────────

    function handleCheckout() {
        if (orderType === 'delivery' && !deliveryAddress.trim()) {
            showToast('Please enter your delivery address.', true);
            return;
        }
        if (pickupMode === 'scheduled' && orderType === 'pickup' && !scheduledAt) {
            showToast('Please select a scheduled pickup time.', true);
            return;
        }

        setSubmitting(true);
        router.post(
            route('cart.checkout'),
            {
                voucher_code:     voucherStatus?.valid ? voucherStatus.code : undefined,
                order_type:       orderType,
                delivery_address: orderType === 'delivery' ? deliveryAddress.trim() : undefined,
                pickup_note:      orderType === 'pickup' && pickupNote.trim() ? pickupNote.trim() : undefined,
                scheduled_at:     orderType === 'pickup' && pickupMode === 'scheduled' ? scheduledAt : undefined,
            },
            {
                onError: (errors) => {
                    const msg = errors.voucher || errors.cart || errors.scheduled_at || 'Checkout failed. Please try again.';
                    showToast(msg, true);
                    setSubmitting(false);
                },
                onFinish: () => setSubmitting(false),
            },
        );
    }

    // ── Render ─────────────────────────────────────────────────────────────

    return (
        <CustomerLayout cartCount={cartCount}>
            <Head title="Checkout — Hapag" />

            {/* Toast */}
            {toast && (
                <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-6 py-3 rounded-2xl shadow-lg text-sm font-bold text-white pointer-events-none ${toast.isError ? 'bg-red-500' : 'bg-green-500'}`}>
                    <span>{toast.message}</span>
                </div>
            )}

            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Back to restaurant */}
                <Link
                    href={route('restaurants.show', restaurant.id)}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-500 transition-colors mb-5"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                    </svg>
                    Back to {restaurant.name}
                </Link>

                <h1 className="text-2xl font-extrabold text-gray-800 mb-6">Review and place your order</h1>

                <div className="lg:grid lg:grid-cols-5 lg:gap-8 lg:items-start">

                    {/* ═══════════════════════════════════════════════════════
                        LEFT COLUMN: Order details
                    ═══════════════════════════════════════════════════════ */}
                    <div className="lg:col-span-3 space-y-5 mb-8 lg:mb-0">

                        {/* ── Order Type (read-only, chosen on cart page) ── */}
                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{orderType === 'pickup' ? '🏪' : '🛵'}</span>
                                    <span className="text-sm font-bold text-gray-800">
                                        {orderType === 'pickup' ? 'Pick-up order' : 'Delivery order'}
                                    </span>
                                </div>
                                <Link
                                    href={route('cart.index') + '?type=' + orderType}
                                    className="text-xs font-semibold text-green-600 hover:text-green-700 transition-colors"
                                >
                                    Change
                                </Link>
                            </div>

                            {/* ── PICKUP VIEW ────────────────────────────────── */}
                            {orderType === 'pickup' && (
                                <div className="p-5 space-y-5">
                                    {/* Pick-up location */}
                                    <div>
                                        <h2 className="text-lg font-extrabold text-gray-800 mb-3">Pick-up at</h2>
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 text-green-500">
                                                <LocationIcon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm">{restaurant.name}</p>
                                                <p className="text-gray-500 text-xs mt-0.5">
                                                    {restaurant.address}, {restaurant.municipality}, Calabarzon, Philippines
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100" />

                                    {/* Pick-up options */}
                                    <div>
                                        <h2 className="text-lg font-extrabold text-gray-800 mb-3">Pick-up options</h2>
                                        <div className="space-y-2">
                                            {/* Standard */}
                                            <label
                                                className={`flex items-center gap-3.5 p-4 rounded-xl border cursor-pointer transition-all duration-150 ${
                                                    pickupMode === 'standard'
                                                        ? 'border-green-500 bg-green-50/60'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                                    pickupMode === 'standard' ? 'border-green-500' : 'border-gray-300'
                                                }`}>
                                                    {pickupMode === 'standard' && (
                                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                                                    )}
                                                </div>
                                                <input
                                                    type="radio"
                                                    name="pickup_mode"
                                                    value="standard"
                                                    checked={pickupMode === 'standard'}
                                                    onChange={() => { setPickupMode('standard'); setScheduledAt(''); }}
                                                    className="sr-only"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-sm text-gray-800">Standard</span>
                                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                                        <ClockIcon className="h-3.5 w-3.5" />
                                                        15 mins
                                                    </span>
                                                </div>
                                            </label>

                                            {/* Scheduled */}
                                            <label
                                                className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all duration-150 ${
                                                    pickupMode === 'scheduled'
                                                        ? 'border-green-500 bg-green-50/60'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                                    pickupMode === 'scheduled' ? 'border-green-500' : 'border-gray-300'
                                                }`}>
                                                    {pickupMode === 'scheduled' && (
                                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                                                    )}
                                                </div>
                                                <input
                                                    type="radio"
                                                    name="pickup_mode"
                                                    value="scheduled"
                                                    checked={pickupMode === 'scheduled'}
                                                    onChange={() => setPickupMode('scheduled')}
                                                    className="sr-only"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-sm text-gray-800">Scheduled</span>
                                                        <span className="text-xs text-gray-500">Select date and time</span>
                                                    </div>

                                                    {/* Time slot picker — only shown when scheduled is selected */}
                                                    {pickupMode === 'scheduled' && (
                                                        <div className="mt-3 space-y-3" onClick={e => e.preventDefault()}>
                                                            {/* Day tabs */}
                                                            <div className="flex gap-1.5">
                                                                {timeSlots.map((dayGroup, idx) => (
                                                                    <button
                                                                        key={dayGroup.date}
                                                                        type="button"
                                                                        onClick={() => { setSelectedDay(idx); setScheduledAt(''); }}
                                                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                                                            selectedDay === idx
                                                                                ? 'bg-green-500 text-white'
                                                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                                        }`}
                                                                    >
                                                                        {dayGroup.day}
                                                                    </button>
                                                                ))}
                                                            </div>

                                                            {/* Time slots grid */}
                                                            {timeSlots[selectedDay] && (
                                                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-36 overflow-y-auto pr-1">
                                                                    {timeSlots[selectedDay].slots.map(slot => (
                                                                        <button
                                                                            key={slot.value}
                                                                            type="button"
                                                                            onClick={() => setScheduledAt(slot.value)}
                                                                            className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                                                                                scheduledAt === slot.value
                                                                                    ? 'bg-green-500 text-white shadow-sm'
                                                                                    : 'bg-gray-50 text-gray-700 hover:bg-green-50 hover:text-green-700 border border-gray-100'
                                                                            }`}
                                                                        >
                                                                            {slot.label}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100" />

                                    {/* Pickup note */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                            Pickup Note <span className="text-gray-400 font-normal">(optional)</span>
                                        </label>
                                        <textarea
                                            value={pickupNote}
                                            onChange={e => setPickupNote(e.target.value)}
                                            placeholder="Any special instructions for pickup?"
                                            rows={2}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors resize-none"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* ── DELIVERY VIEW ──────────────────────────────── */}
                            {orderType === 'delivery' && (
                                <div className="p-5 space-y-5">
                                    {/* Delivery address autocomplete */}
                                    <div>
                                        <h2 className="text-lg font-extrabold text-gray-800 mb-3">Delivery address</h2>
                                        <AddressAutocomplete
                                            value={deliveryAddress}
                                            onChange={(fullAddress, municipality) => {
                                                setDeliveryAddress(fullAddress);
                                                // municipality is extracted automatically for filtering
                                            }}
                                            placeholder="Search your street, barangay, or landmark..."
                                            hint="Start typing and pick from the suggestions"
                                            autoFocus
                                        />
                                    </div>

                                    <div className="border-t border-gray-100" />

                                    {/* Delivery info */}
                                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-blue-50 border border-blue-100">
                                        <span className="text-xl">🛵</span>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">Restaurant delivery</p>
                                            <p className="text-xs text-gray-500">Delivered by the restaurant's own staff · Flat fee of {fmt(DELIVERY_FEE)}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Personal Details (read-only) ────────────────── */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-5">
                            <h2 className="text-lg font-extrabold text-gray-800 mb-4">Personal Details</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Full Name</label>
                                    <div className="px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-800 font-medium">
                                        {user?.name || '—'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email</label>
                                    <div className="px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-800 font-medium truncate">
                                        {user?.email || '—'}
                                    </div>
                                </div>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-3 flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                You can update your info in
                                <Link href={route('profile.edit')} className="text-green-600 font-semibold hover:underline">Account Settings</Link>
                            </p>
                        </div>
                    </div>

                    {/* ═══════════════════════════════════════════════════════
                        RIGHT COLUMN: Order form / summary (sticky)
                    ═══════════════════════════════════════════════════════ */}
                    <div className="lg:col-span-2 lg:sticky lg:top-20 space-y-4">

                        {/* Order form card */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-5">
                            <h2 className="text-lg font-extrabold text-gray-800">Your order form</h2>
                            <p className="text-sm text-gray-500 mt-0.5 mb-4">{restaurant.name}</p>

                            {/* Items list */}
                            <div className="space-y-3 mb-4">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-xs text-gray-400 shrink-0 tabular-nums w-6">{item.quantity} x</span>
                                            <span className="text-sm text-gray-800 truncate">{item.menu_item.name}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-800 tabular-nums shrink-0">
                                            {fmt(Number(item.menu_item.price) * item.quantity)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-100 my-4" />

                            {/* Voucher section */}
                            {voucherStatus?.valid ? (
                                <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-200 mb-4">
                                    <div className="flex items-center gap-2">
                                        <VoucherIcon className="h-4 w-4 text-green-600" />
                                        <div>
                                            <p className="text-xs font-bold text-green-700">{voucherStatus.code}</p>
                                            <p className="text-[10px] text-green-600">You save {fmt(discount)}!</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={removeVoucher}
                                        className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div className="mb-4">
                                    <button
                                        type="button"
                                        onClick={() => setVoucherOpen(!voucherOpen)}
                                        className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-green-600 transition-colors w-full"
                                    >
                                        <VoucherIcon className="h-4 w-4" />
                                        <span>Apply a voucher</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-3.5 w-3.5 ml-auto text-gray-400 transition-transform duration-200 ${voucherOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                                        </svg>
                                    </button>

                                    {voucherOpen && (
                                        <div className="mt-3 space-y-3">
                                            {/* Manual code entry */}
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={voucherCode}
                                                    onChange={e => { setVoucherCode(e.target.value.toUpperCase()); setVoucherStatus(null); }}
                                                    placeholder="Enter code"
                                                    maxLength={50}
                                                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => applyVoucher()}
                                                    disabled={checking || !voucherCode.trim()}
                                                    className="px-4 py-2 rounded-xl bg-gray-800 text-white text-sm font-bold hover:bg-gray-700 disabled:opacity-50 transition-colors"
                                                >
                                                    {checking ? '…' : 'Apply'}
                                                </button>
                                            </div>

                                            {voucherStatus && !voucherStatus.valid && (
                                                <p className="text-xs font-semibold text-red-500 flex items-center gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                                    </svg>
                                                    {voucherStatus.message}
                                                </p>
                                            )}

                                            {/* Available vouchers — claimed first with emphasis */}
                                            {allVouchers.length > 0 && (
                                                <div className="pt-2 border-t border-gray-100">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Available vouchers</p>
                                                    <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5">
                                                        {allVouchers.map(v => {
                                                            const discLabel = v.type === 'percentage'
                                                                ? `${Number(v.value).toFixed(0)}% off`
                                                                : `₱${Number(v.value).toFixed(0)} off`;
                                                            const meetsMin = v.min_order_amount === null || subtotal >= Number(v.min_order_amount);

                                                            return (
                                                                <button
                                                                    key={v.id}
                                                                    type="button"
                                                                    disabled={!meetsMin}
                                                                    onClick={() => applyVoucher(v.code)}
                                                                    className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all ${
                                                                        v.is_claimed
                                                                            ? meetsMin
                                                                                ? 'border-green-200 bg-green-50/40 hover:border-green-400 hover:bg-green-50'
                                                                                : 'border-green-100 bg-green-50/20 opacity-50 cursor-not-allowed'
                                                                            : meetsMin
                                                                                ? 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                                                                                : 'border-gray-100 opacity-40 cursor-not-allowed'
                                                                    }`}
                                                                >
                                                                    {/* Icon badge */}
                                                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-extrabold ${
                                                                        v.is_claimed
                                                                            ? 'bg-green-500 text-white'
                                                                            : v.is_global
                                                                                ? 'bg-gray-100 text-gray-500'
                                                                                : 'bg-orange-100 text-orange-600'
                                                                    }`}>
                                                                        {v.type === 'percentage' ? '%' : '₱'}
                                                                    </div>

                                                                    {/* Label */}
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-1.5">
                                                                            <p className={`text-xs font-bold truncate ${v.is_claimed ? 'text-green-700' : 'text-gray-800'}`}>
                                                                                {v.code}
                                                                            </p>
                                                                            {v.is_claimed && (
                                                                                <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full bg-green-500 text-[8px] font-bold text-white uppercase tracking-wide">
                                                                                    Claimed
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-[10px] text-gray-400">
                                                                            {discLabel}
                                                                            {v.restaurant_name ? ` · ${v.restaurant_name}` : ' · All restaurants'}
                                                                            {v.min_order_amount && !meetsMin ? ` · Min. ₱${Number(v.min_order_amount).toFixed(0)}` : ''}
                                                                        </p>
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="border-t border-gray-100 my-4" />

                            {/* Totals */}
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-gray-800 tabular-nums">{fmt(subtotal)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Promo ({voucherStatus.code})</span>
                                        <span className="font-semibold tabular-nums">− {fmt(discount)}</span>
                                    </div>
                                )}
                                {orderType === 'delivery' && (
                                    <div className="flex justify-between text-gray-600">
                                        <span>Delivery Fee</span>
                                        <span className="font-semibold text-gray-800 tabular-nums">{fmt(DELIVERY_FEE)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between items-center">
                                <span className="font-extrabold text-gray-800 text-lg">Total</span>
                                <span className="font-extrabold text-xl text-gray-800 tabular-nums">{fmt(total)}</span>
                            </div>

                            {/* Place order button */}
                            <button
                                type="button"
                                onClick={handleCheckout}
                                disabled={submitting || (orderType === 'delivery' && !deliveryAddress.trim())}
                                className="w-full mt-4 py-3.5 rounded-2xl bg-green-500 text-white font-bold text-sm hover:bg-green-600 disabled:opacity-50 transition-colors"
                            >
                                {submitting
                                    ? 'Placing order…'
                                    : `Place ${orderType === 'pickup' ? 'pick-up' : 'delivery'} order`
                                }
                            </button>

                            <p className="text-[11px] text-gray-400 text-center mt-2.5">
                                {orderType === 'delivery'
                                    ? 'Pay cash upon delivery to your door.'
                                    : pickupMode === 'scheduled' && scheduledAt
                                        ? `Scheduled pickup at ${new Date(scheduledAt).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true })} — pay cash on arrival.`
                                        : 'Ready in ~15 minutes. Pay cash on pickup.'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}