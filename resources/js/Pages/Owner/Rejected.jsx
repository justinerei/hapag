import { useState, useEffect } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import '@/bootstrap';

const MUNICIPALITIES = [
    'Santa Cruz', 'Pagsanjan', 'Los Baños', 'Calamba',
    'San Pablo', 'Bay', 'Nagcarlan', 'Pila',
];

const inp = [
    'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white',
    'text-sm text-gray-800 placeholder:text-gray-400',
    'focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500',
    'transition-colors',
].join(' ');

export default function Rejected({ restaurant, categories }) {
    const { auth } = usePage().props;
    const [imagePreview, setImagePreview] = useState(restaurant.image_url ?? null);

    useEffect(() => {
        if (!auth?.user?.id) return;
        const channel = window.Echo.private(`App.Models.User.${auth.user.id}`);
        channel.notification((notification) => {
            if (notification.type === 'restaurant.status.updated') {
                router.visit(route('owner.dashboard'));
            }
        });
        return () => window.Echo.leave(`App.Models.User.${auth.user.id}`);
    }, [auth?.user?.id]);

    const { data, setData, post, processing, errors } = useForm({
        name:         restaurant.name ?? '',
        description:  restaurant.description ?? '',
        category_id:  restaurant.category_id ? String(restaurant.category_id) : '',
        municipality: restaurant.municipality ?? '',
        image:        null,
    });

    function handleImageChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        setData('image', file);
        setImagePreview(URL.createObjectURL(file));
    }

    function submit(e) {
        e.preventDefault();
        post(route('owner.reapply', restaurant.id));
    }

    return (
        <>
            <Head title="Application Rejected — Hapag" />

            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="w-full max-w-lg">

                    {/* Header card — rejection notice */}
                    <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 mb-5 text-center">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mx-auto mb-5">
                            <svg className="w-8 h-8 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>

                        <h1 className="text-xl font-extrabold text-gray-800 mb-1">Application Not Approved</h1>
                        <p className="text-sm font-medium text-gray-500 mb-4">
                            {restaurant.name}
                            {restaurant.municipality ? ` — ${restaurant.municipality}` : ''}
                        </p>

                        {restaurant.rejection_reason ? (
                            <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-left">
                                <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-1.5">Admin's Note</p>
                                <p className="text-sm text-red-700 leading-relaxed">{restaurant.rejection_reason}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">No specific reason was provided.</p>
                        )}
                    </div>

                    {/* Re-apply form */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                        <div className="mb-6">
                            <h2 className="text-base font-extrabold text-gray-800">Update & Resubmit</h2>
                            <p className="text-sm text-gray-500 mt-1">Fix the issues above and resubmit your application for review.</p>
                        </div>

                        <form onSubmit={submit} className="space-y-4">

                            {/* Name */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Restaurant name</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className={inp}
                                    placeholder="e.g. Lutong Bahay ni Aling Rosa"
                                />
                                <InputError message={errors.name} className="mt-1" />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description <span className="font-normal text-gray-400">(optional)</span></label>
                                <textarea
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    rows={3}
                                    className={inp + ' resize-none'}
                                    placeholder="Tell customers what makes your restaurant special…"
                                />
                                <InputError message={errors.description} className="mt-1" />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category</label>
                                <select
                                    value={data.category_id}
                                    onChange={e => setData('category_id', e.target.value)}
                                    className={inp}
                                >
                                    <option value="">Select a category…</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
                                    ))}
                                </select>
                                <InputError message={errors.category_id} className="mt-1" />
                            </div>

                            {/* Municipality */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Municipality</label>
                                <select
                                    value={data.municipality}
                                    onChange={e => setData('municipality', e.target.value)}
                                    className={inp}
                                >
                                    <option value="">Select a city…</option>
                                    {MUNICIPALITIES.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                                <InputError message={errors.municipality} className="mt-1" />
                            </div>

                            {/* Image */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Restaurant photo <span className="font-normal text-gray-400">(optional)</span></label>
                                {imagePreview && (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-36 object-cover rounded-xl border border-gray-200 mb-2"
                                    />
                                )}
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg,image/webp"
                                    onChange={handleImageChange}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition-colors"
                                />
                                <InputError message={errors.image} className="mt-1" />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3.5 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-colors disabled:opacity-50 shadow-sm mt-2"
                            >
                                {processing ? 'Submitting…' : 'Resubmit Application'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
