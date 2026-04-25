import { useEffect } from 'react';

const maxWidthClasses = {
    sm:  'max-w-sm',
    md:  'max-w-md',
    lg:  'max-w-lg',
    xl:  'max-w-xl',
    '2xl': 'max-w-2xl',
};

export default function Modal({ show = false, onClose, children, maxWidth = '2xl' }) {
    useEffect(() => {
        document.body.style.overflow = show ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [show]);

    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && onClose?.();
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4 py-6 sm:px-0">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-gray-800/75 transition-opacity"
                onClick={onClose}
            />
            {/* Panel */}
            <div className={`relative w-full ${maxWidthClasses[maxWidth]} bg-white rounded-lg shadow-xl overflow-hidden`}>
                {children}
            </div>
        </div>
    );
}
