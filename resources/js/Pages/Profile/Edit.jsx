import { useState, useRef } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';

// ── Shared Constants ─────────────────────────────────────────────────────────

const MUNICIPALITIES = [
    'Santa Cruz', 'Pagsanjan', 'Los Baños', 'Calamba',
    'San Pablo', 'Bay', 'Nagcarlan', 'Pila',
];

const inputCls = [
    'w-full px-4 py-3 rounded-xl border border-gray-200 bg-white',
    'text-sm text-gray-800 placeholder:text-gray-400',
    'focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500',
    'transition-all duration-150 disabled:bg-gray-50 disabled:text-gray-400',
].join(' ');

// ── Sub-Components ───────────────────────────────────────────────────────────

function SectionCard({ icon, title, subtitle, children }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Section header strip */}
            <div className="px-8 py-5 border-b border-gray-50 flex items-center gap-3">
                <span className="text-xl leading-none">{icon}</span>
                <div>
                    <h2 className="text-base font-bold text-gray-900 leading-tight">{title}</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
                </div>
            </div>
            <div className="px-8 py-7">{children}</div>
        </div>
    );
}

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
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
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

    function handleSubmit(e) {
        e.preventDefault();
        post(route('profile.avatar'), {
            forceFormData: true,
            onSuccess: () => reset(),
        });
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
                {/* Avatar */}
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

                {/* Info & actions */}
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

           {/* Remove confirm modal */}
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

// ── Main Page Component ──────────────────────────────────────────────────────

export default function ProfileEdit({ user, cartCount = 0 }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // ── Profile info form ────────────────────────────────────────────────────
    const profileForm = useForm({
        name: user.name,
        email: user.email,
        municipality: user.municipality ?? '',
    });

    function submitProfile(e) {
        e.preventDefault();
        profileForm.patch(route('profile.update'), { preserveScroll: true });
    }

    // ── Password form ────────────────────────────────────────────────────────
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    function submitPassword(e) {
        e.preventDefault();
        passwordForm.put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
        });
    }

    // ── Delete form ──────────────────────────────────────────────────────────
    const deleteForm = useForm({ password: '' });

    function submitDelete(e) {
        e.preventDefault();
        deleteForm.delete(route('profile.destroy'), {
            onFinish: () => deleteForm.reset(),
        });
    }

    return (
        <CustomerLayout cartCount={cartCount}>
            <Head title="My Account — Hapag" />

            <div className="min-h-screen bg-gray-50/70 py-12">
                <div className="max-w-2xl mx-auto px-4 space-y-4">

                    {/* Page title */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Account Settings</h1>
                        <p className="text-sm text-gray-400 mt-1">Manage your identity, security, and preferences.</p>
                    </div>

                    {/* ── Section 1: Profile ── */}
                    <SectionCard icon="👤" title="Personal Information" subtitle="Keep your details up to date.">
                        <AvatarUpload user={user} />

                        <div className="mt-7 pt-6 border-t border-gray-50">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    profileForm.patch(route('profile.update'), { preserveScroll: true });
                                }}
                                className="space-y-5"
                            >
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

                                <Field label="Municipality" error={profileForm.errors.municipality}>
                                    <select
                                        value={profileForm.data.municipality}
                                        onChange={e => profileForm.setData('municipality', e.target.value)}
                                        className={inputCls}
                                    >
                                        <option value="">Select your area</option>
                                        {MUNICIPALITIES.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
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

                    {/* ── Section 2: Security ── */}
                    <SectionCard icon="🔒" title="Security" subtitle="Update your password to stay protected.">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                passwordForm.put(route('password.update'), {
                                    preserveScroll: true,
                                    onSuccess: () => passwordForm.reset(),
                                });
                            }}
                            className="space-y-5"
                        >
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
                    </SectionCard>

                    {/* ── Section 3: Danger Zone ── */}
                    <div className="rounded-2xl border border-red-100 bg-white px-8 py-6">
                        <div className="flex items-start justify-between gap-6">
                            <div>
                                <h2 className="text-sm font-bold text-gray-900">Delete Account</h2>
                                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                                    Permanently remove your account and all associated data.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="shrink-0 px-5 py-2.5 border border-red-200 text-red-500 text-xs font-bold rounded-xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all active:scale-95"
                            >
                                Delete Account
                            </button>
                        </div>

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
