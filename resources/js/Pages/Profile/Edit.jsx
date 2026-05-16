import { useState, useRef } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomerLayout from '@/Layouts/CustomerLayout';
import AddressAutocomplete from '@/Components/AddressAutocomplete';

// ── Shared Constants ─────────────────────────────────────────────────────────

const inputCls = [
    'w-full px-4 py-3 rounded-xl border border-gray-200 bg-white',
    'text-sm text-gray-800 placeholder:text-gray-400',
    'focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500',
    'transition-all duration-150 disabled:bg-gray-50 disabled:text-gray-400',
].join(' ');

const TAB_MOTION = {
    initial:    { opacity: 0, x: 10 },
    animate:    { opacity: 1, x: 0 },
    exit:       { opacity: 0, x: -10 },
    transition: { duration: 0.15 },
};

// ── Icons ────────────────────────────────────────────────────────────────────

function UserIcon({ className = 'h-4 w-4' }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
    );
}

function LockIcon({ className = 'h-4 w-4' }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
        </svg>
    );
}

function AlertIcon({ className = 'h-4 w-4' }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        </svg>
    );
}

function GoogleIcon({ className = 'h-4 w-4' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
    );
}

// ── Sub-Components ───────────────────────────────────────────────────────────

function Field({ label, error, children }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">{label}</label>
            {children}
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        </div>
    );
}

function SaveButton({ disabled, label = 'Save Changes', processing, successLabel = 'Saved', recentlySuccessful }) {
    return (
        <div className="flex items-center gap-4">
            <button
                type="submit"
                disabled={disabled || processing}
                className="inline-flex items-center gap-2 px-7 py-3 bg-green-600 text-white text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-green-700 active:scale-[0.98] transition-all shadow-sm shadow-green-600/20 disabled:opacity-50"
            >
                {processing ? (
                    <>
                        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        Saving…
                    </>
                ) : label}
            </button>
            {recentlySuccessful && (
                <span className="text-xs font-bold text-green-600 flex items-center gap-1.5">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    {successLabel}
                </span>
            )}
        </div>
    );
}

function AvatarUpload({ user: userProp }) {
    const { auth } = usePage().props;
    const user = auth?.user ?? userProp;

    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(user.avatar_url ?? null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({ avatar: null });
    const { delete: destroy, processing: removing } = useForm();

    function handleFileChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        setPreview(URL.createObjectURL(file));
        setData('avatar', file);
    }

    function handleCancelUpload() {
        setPreview(user.avatar_url ?? null);
        setData('avatar', null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    function handleConfirmRemove() {
        destroy(route('profile.avatar.remove'), {
            onSuccess: () => {
                setPreview(null);
                setShowConfirmModal(false);
            },
        });
    }

    const hasPendingUpload = data.avatar !== null;
    const hasExistingAvatar = !!user.avatar_url && !hasPendingUpload;

    return (
        <>
            <div className="flex items-center gap-5">
                <div
                    className="relative shrink-0 w-16 h-16 rounded-2xl cursor-pointer group overflow-hidden ring-2 ring-gray-100"
                    onClick={() => fileInputRef.current.click()}
                >
                    <div className="w-full h-full bg-green-500 flex items-center justify-center text-white text-2xl font-bold">
                        {preview
                            ? <img src={preview} alt="Profile" className="h-full w-full object-cover" />
                            : <span>{user.name.charAt(0).toUpperCase()}</span>
                        }
                    </div>
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5 mb-3">Click avatar to change photo</p>
                    <div className="flex flex-wrap gap-2">
                        {hasPendingUpload ? (
                            <>
                                <button
                                    onClick={(e) => { e.preventDefault(); post(route('profile.avatar'), { forceFormData: true, onSuccess: () => reset() }); }}
                                    disabled={processing}
                                    className="px-4 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-all active:scale-95"
                                >
                                    {processing ? 'Uploading…' : 'Save Photo'}
                                </button>
                                <button
                                    onClick={handleCancelUpload}
                                    className="px-4 py-1.5 border border-gray-200 text-gray-500 text-xs font-bold rounded-lg hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : hasExistingAvatar && (
                            <button
                                onClick={() => setShowConfirmModal(true)}
                                className="px-4 py-1.5 border border-red-100 text-red-400 text-xs font-bold rounded-lg hover:bg-red-50 hover:border-red-200 transition-all"
                            >
                                Remove Photo
                            </button>
                        )}
                    </div>
                    {errors.avatar && <p className="text-xs text-red-500 font-medium mt-1">{errors.avatar}</p>}
                </div>
            </div>

            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="image/*" />

            {showConfirmModal && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-gray-900/30 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 border border-gray-100">
                        <div className="flex flex-col items-center text-center mb-7">
                            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mb-5">
                                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                            </div>
                            <h2 className="text-base font-bold text-gray-900 mb-1">Remove profile photo?</h2>
                            <p className="text-sm text-gray-400 leading-relaxed">Your avatar will revert to your name initial.</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmRemove}
                                disabled={removing}
                                className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 shadow-sm shadow-red-500/20 transition-all active:scale-95"
                            >
                                {removing ? '…' : 'Remove'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// ── Sidebar Tab Nav ──────────────────────────────────────────────────────────

const TABS = [
    { id: 'profile',  label: 'Profile',     Icon: UserIcon  },
    { id: 'security', label: 'Security',    Icon: LockIcon  },
    { id: 'danger',   label: 'Danger Zone', Icon: AlertIcon },
];

function SidebarNav({ activeTab, setActiveTab, user }) {
    return (
        <aside className="w-full md:w-56 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                {/* Mobile: horizontal scrollable tab row */}
                <div className="flex md:hidden overflow-x-auto scrollbar-hide">
                    {TABS.map(({ id, label, Icon }) => {
                        const active = activeTab === id;
                        return (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 shrink-0 transition-all ${
                                    active
                                        ? 'border-green-500 text-green-700 bg-green-50'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <Icon className="h-3.5 w-3.5 shrink-0" />
                                {label}
                            </button>
                        );
                    })}
                </div>

                {/* Desktop: vertical tab list */}
                <div className="hidden md:flex md:flex-col p-2 gap-0.5 pt-2">
                    {TABS.map(({ id, label, Icon }) => {
                        const active = activeTab === id;
                        return (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left w-full ${
                                    active
                                        ? 'bg-green-50 text-green-700'
                                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                }`}
                            >
                                {active && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-green-500 rounded-full" />
                                )}
                                <Icon className="h-4 w-4 shrink-0" />
                                <span>{label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* User summary card — desktop only */}
                <div className="hidden md:block border-t border-gray-100 p-4 mt-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-green-500 flex items-center justify-center text-white text-sm font-bold ring-2 ring-gray-100">
                            {user.avatar_url
                                ? <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                                : <span>{user.name.charAt(0).toUpperCase()}</span>
                            }
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-gray-800 truncate">{user.name}</p>
                            <p className="text-[10px] text-gray-400 truncate mt-0.5">{user.email}</p>
                            {user.google_id && (
                                <span className="inline-flex items-center gap-1 mt-1.5 px-1.5 py-0.5 bg-green-50 text-green-700 text-[9px] font-bold rounded-md border border-green-100">
                                    <GoogleIcon className="h-2.5 w-2.5" />
                                    Google Account
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}

// ── Section Card Shell ───────────────────────────────────────────────────────

function SectionCard({ icon, title, subtitle, accentColor = 'green', children }) {
    const iconBg   = accentColor === 'red'  ? 'bg-red-100'   : 'bg-green-50';
    const iconText = accentColor === 'red'  ? 'text-red-500' : 'text-green-600';
    const headerBg = accentColor === 'red'  ? 'bg-red-50/40' : '';
    const border   = accentColor === 'red'  ? 'border-red-100' : 'border-gray-100';
    const divider  = accentColor === 'red'  ? 'border-red-50'  : 'border-gray-50';

    return (
        <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${border}`}>
            <div className={`px-8 py-5 border-b flex items-center gap-3 ${headerBg} ${divider}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
                    <span className={iconText}>{icon}</span>
                </div>
                <div>
                    <h2 className="text-base font-bold text-gray-900 leading-tight">{title}</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
                </div>
            </div>
            <div className="px-8 py-7">{children}</div>
        </div>
    );
}

// ── Main Page Component ──────────────────────────────────────────────────────

export default function ProfileEdit({ user, cartCount = 0 }) {
    const [activeTab, setActiveTab]             = useState('profile');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [googleSyncing, setGoogleSyncing]     = useState(false);
    const [googleSyncError, setGoogleSyncError] = useState('');

    // ── Profile form ─────────────────────────────────────────────────────────
    const profileForm = useForm({
        name:         user.name,
        email:        user.email,
        municipality: user.municipality ?? '',
        address:      user.address ?? '',   // ← syncs full address with navbar
    });

    function submitProfile(e) {
        e.preventDefault();
        profileForm.patch(route('profile.update'), { preserveScroll: true });
    }

    // ── Password form ─────────────────────────────────────────────────────────
    const passwordForm = useForm({
        current_password:      '',
        password:              '',
        password_confirmation: '',
    });

    function submitPassword(e) {
        e.preventDefault();
        passwordForm.put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
        });
    }

    // ── Delete form ───────────────────────────────────────────────────────────
    const deleteForm = useForm({ password: '' });

    // ── Google photo sync ─────────────────────────────────────────────────────
    async function handleGoogleSync() {
        setGoogleSyncing(true);
        setGoogleSyncError('');
        try {
            const token = document.head.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
            const res = await fetch('/profile/avatar/google-sync', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': token,
                    'Content-Type': 'application/json',
                    'Accept':       'application/json',
                },
            });
            if (res.ok) {
                router.reload();
            } else {
                const body = await res.json().catch(() => ({}));
                setGoogleSyncError(body.error || 'Sync failed. Please try again.');
            }
        } catch {
            setGoogleSyncError('Network error. Please try again.');
        } finally {
            setGoogleSyncing(false);
        }
    }

    const isGoogleOnly   = !!user.google_id && !user.password;
    const showGoogleSync = !!user.google_id && !user.avatar_url;

    return (
        <CustomerLayout cartCount={cartCount}>
            <Head title="Account Settings — Hapag" />

            <div className="min-h-screen bg-gray-50/70 py-12">
                <div className="max-w-4xl mx-auto px-4">

                    {/* Page heading */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Account Settings</h1>
                        <p className="text-sm text-gray-400 mt-1">Manage your identity, security, and preferences.</p>
                    </div>

                    {/* Two-column layout */}
                    <div className="flex flex-col md:flex-row gap-6 items-start">

                        <SidebarNav activeTab={activeTab} setActiveTab={setActiveTab} user={user} />

                        {/* Right content panel */}
                        <main className="flex-1 min-w-0">
                            <AnimatePresence mode="wait">

                                {/* ── Tab: Profile ── */}
                                {activeTab === 'profile' && (
                                    <motion.div key="profile" {...TAB_MOTION}>
                                        <SectionCard
                                            icon={<UserIcon className="h-4 w-4" />}
                                            title="Personal Information"
                                            subtitle="Keep your details up to date."
                                        >
                                            {/* Google sync banner */}
                                            {showGoogleSync && (
                                                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100 mb-6">
                                                    <GoogleIcon className="h-5 w-5 shrink-0 mt-0.5" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-blue-800">Signed in with Google</p>
                                                        <p className="text-xs text-blue-600 mt-0.5">Your profile photo is managed by Google.</p>
                                                        <div className="mt-3 flex items-center gap-3 flex-wrap">
                                                            <button
                                                                type="button"
                                                                onClick={handleGoogleSync}
                                                                disabled={googleSyncing}
                                                                className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-60"
                                                            >
                                                                {googleSyncing ? (
                                                                    <>
                                                                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                                                        </svg>
                                                                        Syncing…
                                                                    </>
                                                                ) : 'Sync photo from Google'}
                                                            </button>
                                                            {googleSyncError && (
                                                                <p className="text-xs text-red-500 font-medium">{googleSyncError}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Avatar upload */}
                                            <AvatarUpload user={user} />

                                            {/* Profile info form */}
                                            <div className="mt-7 pt-6 border-t border-gray-50">
                                                <form onSubmit={submitProfile} className="space-y-5">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                        <Field label="Full Name" error={profileForm.errors.name}>
                                                            <input
                                                                type="text"
                                                                value={profileForm.data.name}
                                                                onChange={e => profileForm.setData('name', e.target.value)}
                                                                className={inputCls}
                                                                placeholder="Juan dela Cruz"
                                                                required
                                                            />
                                                        </Field>
                                                        <Field label="Email Address" error={profileForm.errors.email}>
                                                            <input
                                                                type="email"
                                                                value={profileForm.data.email}
                                                                onChange={e => profileForm.setData('email', e.target.value)}
                                                                className={inputCls}
                                                                placeholder="juan@example.com"
                                                                required
                                                            />
                                                        </Field>
                                                    </div>

                                                    {/* ── FIXED: now saves both address (full) and municipality ── */}
                                                    {/* Previously only municipality was saved, losing the full address */}
                                                    {/* This keeps navbar location pill in sync with profile page */}
                                                    <Field label="Your Location" error={profileForm.errors.municipality}>
                                                        <AddressAutocomplete
                                                            value={profileForm.data.address || profileForm.data.municipality || ''}
                                                            onChange={(fullAddress, municipality) => {
                                                                profileForm.setData('address', fullAddress);
                                                                profileForm.setData('municipality', municipality ?? '');
                                                            }}
                                                            placeholder="Search your barangay or street..."
                                                        />
                                                    </Field>

                                                    <div className="pt-2">
                                                        <SaveButton
                                                            label="Save Changes"
                                                            processing={profileForm.processing}
                                                            recentlySuccessful={profileForm.recentlySuccessful}
                                                            successLabel="Changes saved"
                                                        />
                                                    </div>
                                                </form>
                                            </div>
                                        </SectionCard>
                                    </motion.div>
                                )}

                                {/* ── Tab: Security ── */}
                                {activeTab === 'security' && (
                                    <motion.div key="security" {...TAB_MOTION}>
                                        <SectionCard
                                            icon={<LockIcon className="h-4 w-4" />}
                                            title="Security"
                                            subtitle="Update your password to stay protected."
                                        >
                                            {isGoogleOnly ? (
                                                <div className="flex items-start gap-5 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                                                    <GoogleIcon className="h-8 w-8 shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-bold text-blue-800">Password not required</p>
                                                        <p className="text-sm text-blue-700 mt-1.5 leading-relaxed">
                                                            You're signed in with Google. You don't need a password to access Hapag.
                                                        </p>
                                                        <p className="text-xs text-blue-500 mt-2">
                                                            To add a password, sign out and use 'Forgot Password' with your email.
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <form onSubmit={submitPassword} className="space-y-5">
                                                    <Field label="Current Password" error={passwordForm.errors.current_password}>
                                                        <input
                                                            type="password"
                                                            value={passwordForm.data.current_password}
                                                            onChange={e => passwordForm.setData('current_password', e.target.value)}
                                                            className={inputCls}
                                                            placeholder="••••••••"
                                                        />
                                                    </Field>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                        <Field label="New Password" error={passwordForm.errors.password}>
                                                            <input
                                                                type="password"
                                                                value={passwordForm.data.password}
                                                                onChange={e => passwordForm.setData('password', e.target.value)}
                                                                className={inputCls}
                                                                placeholder="••••••••"
                                                            />
                                                        </Field>
                                                        <Field label="Confirm New Password" error={passwordForm.errors.password_confirmation}>
                                                            <input
                                                                type="password"
                                                                value={passwordForm.data.password_confirmation}
                                                                onChange={e => passwordForm.setData('password_confirmation', e.target.value)}
                                                                className={inputCls}
                                                                placeholder="••••••••"
                                                            />
                                                        </Field>
                                                    </div>

                                                    <div className="pt-2">
                                                        <SaveButton
                                                            label="Update Password"
                                                            processing={passwordForm.processing}
                                                            recentlySuccessful={passwordForm.recentlySuccessful}
                                                            successLabel="Password updated"
                                                        />
                                                    </div>
                                                </form>
                                            )}
                                        </SectionCard>
                                    </motion.div>
                                )}

                                {/* ── Tab: Danger Zone ── */}
                                {activeTab === 'danger' && (
                                    <motion.div key="danger" {...TAB_MOTION}>
                                        <SectionCard
                                            icon={<AlertIcon className="h-4 w-4" />}
                                            title="Danger Zone"
                                            subtitle="Actions here are permanent and cannot be undone."
                                            accentColor="red"
                                        >
                                            <div className="flex items-start justify-between gap-6">
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">Delete Account</p>
                                                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed max-w-sm">
                                                        Once you delete your account, all your data — orders, favorites, and profile — will be permanently removed with no way to recover it.
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => setShowDeleteModal(true)}
                                                    className="shrink-0 px-5 py-2.5 border border-red-200 text-red-500 text-xs font-bold rounded-xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all active:scale-95"
                                                >
                                                    Delete Account
                                                </button>
                                            </div>
                                        </SectionCard>
                                    </motion.div>
                                )}

                            </AnimatePresence>
                        </main>
                    </div>
                </div>
            </div>

            {/* ── Delete Account Modal ── */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-gray-900/30 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 border border-gray-100">
                        <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mb-5">
                            <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                            </svg>
                        </div>
                        <h2 className="text-base font-bold text-gray-900 mb-1">Delete your account?</h2>
                        <p className="text-sm text-gray-400 leading-relaxed mb-7">
                            This action is permanent and cannot be undone. Enter your password to confirm.
                        </p>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                deleteForm.delete(route('profile.destroy'), { onFinish: () => deleteForm.reset() });
                            }}
                            className="space-y-5"
                        >
                            <Field label="Confirm Password" error={deleteForm.errors.password}>
                                <input
                                    type="password"
                                    value={deleteForm.data.password}
                                    onChange={e => deleteForm.setData('password', e.target.value)}
                                    className={inputCls}
                                    placeholder="Enter your password"
                                    autoFocus
                                />
                            </Field>
                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={deleteForm.processing}
                                    className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 shadow-sm shadow-red-500/20 transition-all active:scale-95"
                                >
                                    {deleteForm.processing ? '…' : 'Delete Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </CustomerLayout>
    );
}