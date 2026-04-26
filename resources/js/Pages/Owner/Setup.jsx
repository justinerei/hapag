import { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import InputError from '@/Components/InputError';

const MUNICIPALITIES = [
    'Santa Cruz', 'Pagsanjan', 'Los Baños', 'Calamba',
    'San Pablo', 'Bay', 'Nagcarlan', 'Pila',
];

const inputCls = [
    'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white',
    'text-sm text-gray-800 placeholder:text-gray-400',
    'focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500',
    'transition-colors',
].join(' ');

function CloseIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    );
}

function CheckCircleIcon({ className = 'h-16 w-16' }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}

function Backdrop({ children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" />
            <div className="relative z-10 w-full">{children}</div>
        </div>
    );
}

function AccountSuccessModal({ onContinue }) {
    return (
        <Backdrop>
            <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden text-center p-10">
                <div className="flex justify-center mb-5">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircleIcon className="h-12 w-12 text-green-500" />
                    </div>
                </div>
                <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Account Created!</h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                    Your personal account is ready. Let's set up your restaurant next — it only takes a minute.
                </p>
                <button
                    type="button"
                    onClick={onContinue}
                    className="w-full py-3 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-colors"
                >
                    Set Up My Restaurant
                </button>
            </div>
        </Backdrop>
    );
}

function RestaurantFormModal({ categories }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        category_id: '',
        municipality: '',
        image_url: '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('owner.setup.store'));
    }

    function handleClose() {
        router.post(route('logout'));
    }

    return (
        <Backdrop>
            <div className="max-w-3xl mx-auto bg-gray-50 rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="relative">
                    <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-green-500/10" />
                    <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-green-500/5" />
                </div>

                <div className="flex justify-end p-4 pb-0 relative z-10">
                    <button type="button" onClick={handleClose} className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 transition-colors" title="Log out and exit">
                        <CloseIcon />
                    </button>
                </div>

                <div className="text-center px-8 pb-2">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 leading-tight">
                        Register your <span className="text-green-500">restaurant</span>
                    </h2>
                    <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">
                        Tell us about your restaurant. Once submitted, our team will review and approve your listing.
                    </p>
                </div>

                <form onSubmit={submit} className="p-8 pt-6 max-h-[65vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Restaurant Name</label>
                            <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className={inputCls + ' bg-white'} placeholder="e.g. Burn's Kitchen" />
                            <InputError message={errors.name} className="mt-1" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Category</label>
                            <select value={data.category_id} onChange={(e) => setData('category_id', e.target.value)} className={inputCls + ' bg-white'}>
                                <option value="">— Select —</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <InputError message={errors.category_id} className="mt-1" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Description</label>
                            <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} className={inputCls + ' bg-white resize-none'} rows={4} placeholder='e.g. "Filipino comfort food made with generations of love and tradition."' />
                            <InputError message={errors.description} className="mt-1" />
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Municipality</label>
                                <select value={data.municipality} onChange={(e) => setData('municipality', e.target.value)} className={inputCls + ' bg-white'}>
                                    <option value="">— Select —</option>
                                    {MUNICIPALITIES.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                                <InputError message={errors.municipality} className="mt-1" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Image URL</label>
                                <input type="url" value={data.image_url} onChange={(e) => setData('image_url', e.target.value)} className={inputCls + ' bg-white'} placeholder="https://example.com/your-image.jpg" />
                                <InputError message={errors.image_url} className="mt-1" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <button type="submit" disabled={processing} className="w-full py-3.5 rounded-xl bg-gray-800 text-white text-sm font-bold hover:bg-gray-900 transition-colors disabled:opacity-50">
                            {processing ? 'Submitting…' : 'Submit for Review'}
                        </button>
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-4">
                        Note: Your restaurant will appear on Hapag once approved by our admin team. You'll be redirected to your dashboard after submission.
                    </p>
                </form>
            </div>
        </Backdrop>
    );
}

export default function OwnerSetup({ categories = [] }) {
    const [showSuccess, setShowSuccess] = useState(true);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    return (
        <>
            <Head title="Register Your Restaurant — Hapag" />
            <div className="min-h-screen bg-gray-50" />

            {showSuccess ? (
                <AccountSuccessModal onContinue={() => setShowSuccess(false)} />
            ) : (
                <RestaurantFormModal categories={categories} />
            )}
        </>
    );
}