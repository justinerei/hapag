import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';

// ── Constants ──────────────────────────────────────────────────────────────────

const MUNICIPALITIES = [
    'Santa Cruz', 'Pagsanjan', 'Los Baños', 'Calamba',
    'San Pablo', 'Bay', 'Nagcarlan', 'Pila',
];

// ── Shared input style ─────────────────────────────────────────────────────────

const inputCls = [
    'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white',
    'text-sm text-gray-800 placeholder:text-gray-400',
    'focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500',
    'transition-colors disabled:bg-gray-50 disabled:text-gray-400',
].join(' ');

// ── Field wrapper ──────────────────────────────────────────────────────────────

function Field({ label, error, children }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
            {children}
            {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
        </div>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ProfileEdit({ user, cartCount = 0 }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // ── Profile info form ────────────────────────────────────────────────────
    const profileForm = useForm({
        name:         user.name,
        email:        user.email,
        municipality: user.municipality ?? '',
    });

    function submitProfile(e) {
        e.preventDefault();
        profileForm.patch(route('profile.update'), { preserveScroll: true });
    }

    // ── Password form ────────────────────────────────────────────────────────
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

            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* ── Header ────────────────────────────────────────────────── */}
                <div className="mb-8">
                    <h1 className="text-2xl font-extrabold text-gray-800">My Account</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Manage your profile and account settings.</p>
                </div>

                <div className="max-w-2xl space-y-6">

                    {/* ── Section 1: Profile Information ────────────────────── */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                        <h2 className="text-base font-extrabold text-gray-800 mb-0.5">Profile Information</h2>
                        <p className="text-sm text-gray-500 mb-5">Update your name, email address, and municipality.</p>

                        <form onSubmit={submitProfile} className="space-y-4">
                            <Field label="Name" error={profileForm.errors.name}>
                                <input
                                    type="text"
                                    value={profileForm.data.name}
                                    onChange={e => profileForm.setData('name', e.target.value)}
                                    className={inputCls}
                                    autoComplete="name"
                                    required
                                />
                            </Field>

                            <Field label="Email" error={profileForm.errors.email}>
                                <input
                                    type="email"
                                    value={profileForm.data.email}
                                    onChange={e => profileForm.setData('email', e.target.value)}
                                    className={inputCls}
                                    autoComplete="email"
                                    required
                                />
                            </Field>

                            <Field label="Municipality" error={profileForm.errors.municipality}>
                                <select
                                    value={profileForm.data.municipality}
                                    onChange={e => profileForm.setData('municipality', e.target.value)}
                                    className={inputCls}
                                >
                                    <option value="">— Select municipality —</option>
                                    {MUNICIPALITIES.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </Field>

                            <div className="flex items-center gap-4 pt-1">
                                <button
                                    type="submit"
                                    disabled={profileForm.processing}
                                    className="px-5 py-2.5 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-colors disabled:opacity-50"
                                >
                                    Save Changes
                                </button>
                                {profileForm.recentlySuccessful && (
                                    <span className="text-sm text-green-500 font-semibold">Saved.</span>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* ── Section 2: Update Password ─────────────────────────── */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                        <h2 className="text-base font-extrabold text-gray-800 mb-0.5">Update Password</h2>
                        <p className="text-sm text-gray-500 mb-5">Use a long, random password to keep your account secure.</p>

                        <form onSubmit={submitPassword} className="space-y-4">
                            <Field label="Current Password" error={passwordForm.errors.current_password}>
                                <input
                                    type="password"
                                    value={passwordForm.data.current_password}
                                    onChange={e => passwordForm.setData('current_password', e.target.value)}
                                    className={inputCls}
                                    autoComplete="current-password"
                                />
                            </Field>

                            <Field label="New Password" error={passwordForm.errors.password}>
                                <input
                                    type="password"
                                    value={passwordForm.data.password}
                                    onChange={e => passwordForm.setData('password', e.target.value)}
                                    className={inputCls}
                                    autoComplete="new-password"
                                />
                            </Field>

                            <Field label="Confirm New Password" error={passwordForm.errors.password_confirmation}>
                                <input
                                    type="password"
                                    value={passwordForm.data.password_confirmation}
                                    onChange={e => passwordForm.setData('password_confirmation', e.target.value)}
                                    className={inputCls}
                                    autoComplete="new-password"
                                />
                            </Field>

                            <div className="flex items-center gap-4 pt-1">
                                <button
                                    type="submit"
                                    disabled={passwordForm.processing}
                                    className="px-5 py-2.5 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-colors disabled:opacity-50"
                                >
                                    Update Password
                                </button>
                                {passwordForm.recentlySuccessful && (
                                    <span className="text-sm text-green-500 font-semibold">Updated.</span>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* ── Section 3: Delete Account ──────────────────────────── */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                        <h2 className="text-base font-extrabold text-gray-800 mb-0.5">Delete Account</h2>
                        <p className="text-sm text-gray-500 mb-5">
                            Once your account is deleted, all of your data will be permanently removed and cannot be recovered.
                        </p>
                        <button
                            type="button"
                            onClick={() => setShowDeleteModal(true)}
                            className="px-5 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors"
                        >
                            Delete Account
                        </button>
                    </div>

                </div>
            </div>

            {/* ── Delete Confirmation Modal ────────────────────────────────────── */}
            {showDeleteModal && (
                <div
                    className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={e => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}
                >
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-lg font-extrabold text-gray-800 mb-1">Delete your account?</h2>
                        <p className="text-sm text-gray-500 mb-5">
                            This is permanent. All orders, favorites, and account data will be deleted. Enter your password to confirm.
                        </p>

                        <form onSubmit={submitDelete} className="space-y-4">
                            <Field label="Password" error={deleteForm.errors.password}>
                                <input
                                    type="password"
                                    value={deleteForm.data.password}
                                    onChange={e => deleteForm.setData('password', e.target.value)}
                                    className={inputCls}
                                    placeholder="Enter your password"
                                    autoFocus
                                />
                            </Field>

                            <div className="flex justify-end gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => { setShowDeleteModal(false); deleteForm.reset(); }}
                                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={deleteForm.processing}
                                    className="px-5 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                                >
                                    Yes, Delete My Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </CustomerLayout>
    );
}
