import { forwardRef } from 'react';

const TextInput = forwardRef(function TextInput({ className = '', disabled = false, ...props }, ref) {
    return (
        <input
            ref={ref}
            disabled={disabled}
            className={`w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800
                placeholder:text-gray-500 shadow-sm transition-colors
                focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none
                disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            {...props}
        />
    );
});

export default TextInput;
