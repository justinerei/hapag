import { useState, useRef } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';

// ── Shared Constants & Styles ────────────────────────────────────────────────

const MUNICIPALITIES = [
    'Santa Cruz', 'Pagsanjan', 'Los Baños', 'Calamba',
    'San Pablo', 'Bay', 'Nagcarlan', 'Pila',
];

// Refined input style for a "pleasant" feel
const inputCls = [
    'w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50/30',
    'text-sm text-gray-800 placeholder:text-gray-400',
    'focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white',
    'transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-400',
].join(' ');

// ── Sub-Components ──────────────────────────────────────────────────────────

function Field({ label, error, children }) {
    return (
        <div className="space-y-2">
            <label className="block text-[13px] font-bold text-gray-600 ml-1 uppercase tracking-wider">{label}</label>
            {children}
            {error && <p className="text-xs text-red-500 font-medium mt-1 ml-1">{error}</p>}
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
            <div className="flex flex-col items-center sm:flex-row gap-6 bg-green-50/50 p-6 rounded-3xl border border-green-100/50">
                <div 
                    className="relative shrink-0 w-24 h-24 rounded-3xl cursor-pointer group overflow-hidden ring-4 ring-white shadow-lg shadow-green-900/5"
                    onClick={() => fileInputRef.current.click()}
                >
                    <div className="w-full h-full bg-green-500 flex items-center justify-center text-white text-3xl font-bold">
                        {preview ? (
                            <img src={preview} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                            <span>{user.name.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    <div className="absolute inset-0 bg-green-600/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                    </div>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-4">
                    <div>
                        <h3 className="text-lg font-black text-gray-800">Your Avatar</h3>
                        <p className="text-sm text-gray-500 font-medium">Click the image to upload a new profile photo.</p>
                    </div>
                    
                    <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                        {hasPendingUpload ? (
                            <>
                                <button onClick={handleSubmit} disabled={processing} className="px-6 py-2.5 bg-green-500 text-white text-xs font-black rounded-xl hover:bg-green-600 shadow-md shadow-green-500/20 transition-all active:scale-95">
                                    {processing ? 'UPLOADING...' : 'SAVE NEW PHOTO'}
                                </button>
                                <button onClick={handleCancelUpload} className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 text-xs font-black rounded-xl hover:bg-gray-50 transition-all">
                                    CANCEL
                                </button>
                            </>
                        ) : hasExistingAvatar && (
                            <button onClick={() => setShowConfirmModal(true)} className="px-6 py-2.5 border-2 border-red-100 text-red-500 text-xs font-black rounded-xl hover:bg-red-50 hover:border-red-200 transition-all">
                                REMOVE PHOTO
                            </button>
                        )}
                    </div>
                    {errors.avatar && <p className="text-xs text-red-500 font-bold">{errors.avatar}</p>}
                </div>
            </div>

            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="image/*" />

            {showConfirmModal && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm p-8 text-center border border-gray-100">
                        <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center mx-auto mb-6">
                            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </div>
                        <h2 className="text-xl font-black text-gray-900 mb-2">Remove Photo?</h2>
                        <p className="text-sm text-gray-500 leading-relaxed mb-8 font-medium">This will permanently delete your current photo and restore your default initial.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowConfirmModal(false)} className="flex-1 px-4 py-4 rounded-2xl border-2 border-gray-100 text-sm font-black text-gray-600 hover:bg-gray-50 transition-all">CANCEL</button>
                            <button onClick={handleConfirmRemove} disabled={removing} className="flex-1 px-4 py-4 rounded-2xl bg-red-500 text-white text-sm font-black hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all active:scale-95">
                                {removing ? '...' : 'YES, REMOVE'}
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

            <div className="min-h-screen bg-[#FAFAFA] py-12">
                <div className="max-w-3xl mx-auto px-4">
                    
                    {/* Header */}
                    <div className="mb-10 text-center sm:text-left">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Account Settings</h1>
                        <p className="text-gray-500 mt-2 font-medium">Manage your identity, security, and preferences.</p>
                    </div>

                    <div className="space-y-8">
                        
                        {/* Section 1: Profile */}
                        <div className="bg-white rounded-[30px] shadow-sm border border-gray-100 p-8 sm:p-10 transition-all hover:shadow-md">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-2xl bg-green-100 flex items-center justify-center">
                                    <span className="text-lg">👤</span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900">Personal Information</h2>
                                    <p className="text-sm text-gray-400 font-medium">Keep your details up to date.</p>
                                </div>
                            </div>

                            <AvatarUpload user={user} />

                            <form onSubmit={(e) => { e.preventDefault(); profileForm.patch(route('profile.update'), { preserveScroll: true }); }} className="mt-10 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <Field label="Full Name" error={profileForm.errors.name}>
                                        <input type="text" value={profileForm.data.name} onChange={e => profileForm.setData('name', e.target.value)} className={inputCls} required />
                                    </Field>
                                    <Field label="Email Address" error={profileForm.errors.email}>
                                        <input type="email" value={profileForm.data.email} onChange={e => profileForm.setData('email', e.target.value)} className={inputCls} required />
                                    </Field>
                                </div>
                                <Field label="Municipality" error={profileForm.errors.municipality}>
                                    <select value={profileForm.data.municipality} onChange={e => profileForm.setData('municipality', e.target.value)} className={inputCls}>
                                        <option value="">Select your area</option>
                                        {MUNICIPALITIES.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </Field>
                                <div className="flex items-center gap-4 pt-4">
                                    <button type="submit" disabled={profileForm.processing} className="px-10 py-4 bg-green-600 text-white font-black rounded-2xl hover:bg-green-600 transition-all shadow-xl shadow-green-500/10 active:scale-95 disabled:opacity-50">
                                        SAVE CHANGES
                                    </button>
                                    {profileForm.recentlySuccessful && <span className="text-sm text-green-600 font-black flex items-center gap-1"><span className="text-base">✓</span> SAVED</span>}
                                </div>
                            </form>
                        </div>

                        {/* Section 2: Password - Kept in center flow as requested */}
                        <div className="bg-white rounded-[30px] shadow-sm border border-gray-100 p-8 sm:p-10 transition-all hover:shadow-md">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-2xl bg-green-100 flex items-center justify-center">
                                    <span className="text-lg">🔒</span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900">Security</h2>
                                    <p className="text-sm text-gray-400 font-medium">Update your password to stay protected.</p>
                                </div>
                            </div>

                            <form onSubmit={(e) => { e.preventDefault(); passwordForm.put(route('password.update'), { preserveScroll: true, onSuccess: () => passwordForm.reset() }); }} className="space-y-6">
                                <Field label="Current Password" error={passwordForm.errors.current_password}>
                                    <input type="password" value={passwordForm.data.current_password} onChange={e => passwordForm.setData('current_password', e.target.value)} className={inputCls} />
                                </Field>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <Field label="New Password" error={passwordForm.errors.password}>
                                        <input type="password" value={passwordForm.data.password} onChange={e => passwordForm.setData('password', e.target.value)} className={inputCls} />
                                    </Field>
                                    <Field label="Confirm New Password" error={passwordForm.errors.password_confirmation}>
                                        <input type="password" value={passwordForm.data.password_confirmation} onChange={e => passwordForm.setData('password_confirmation', e.target.value)} className={inputCls} />
                                    </Field>
                                </div>
                                <div className="pt-4">
                                    <button type="submit" disabled={passwordForm.processing} className="px-10 py-4 bg-green-600 text-white font-black rounded-2xl hover:bg-green-600 shadow-xl shadow-green-500/10 active:scale-95 transition-all disabled:opacity-50">
                                        UPDATE PASSWORD
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Section 3: Danger Zone */}
                        <div className="bg-red-50/30 rounded-[30px] border border-red-100 p-8 sm:p-10">
                            <h2 className="text-xl font-black text-red-600 mb-2">Deactivate Account</h2>
                            <p className="text-sm text-red-500/70 font-medium mb-8 leading-relaxed">
                                Once you delete your account, there is no going back. Please be certain.
                            </p>
                            <button onClick={() => setShowDeleteModal(true)} className="px-8 py-3 bg-white border-2 border-red-100 text-red-500 font-black rounded-2xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all active:scale-95">
                                DELETE MY ACCOUNT
                            </button>
                        </div>

                    </div>

                </div>
            </div>

            {/* Account Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md p-10 border border-gray-100">
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Are you sure?</h2>
                        <p className="text-gray-500 mb-8 font-medium">This action is permanent. Please enter your password to confirm.</p>
                        <form onSubmit={(e) => { e.preventDefault(); deleteForm.delete(route('profile.destroy'), { onFinish: () => deleteForm.reset() }); }} className="space-y-6">
                            <Field label="Verify Password" error={deleteForm.errors.password}>
                                <input type="password" value={deleteForm.data.password} onChange={e => deleteForm.setData('password', e.target.value)} className={inputCls} placeholder="Enter password" autoFocus />
                            </Field>
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button type="button" onClick={() => setShowDeleteModal(false)} className="flex-1 px-6 py-4 border-2 border-gray-100 text-gray-500 font-black rounded-2xl hover:bg-gray-50 transition-all">CANCEL</button>
                                <button type="submit" disabled={deleteForm.processing} className="flex-1 px-6 py-4 bg-red-500 text-white font-black rounded-2xl hover:bg-red-600 shadow-xl shadow-red-500/30 transition-all active:scale-95">
                                    {deleteForm.processing ? '...' : 'CONFIRM'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </CustomerLayout>
    );
}
