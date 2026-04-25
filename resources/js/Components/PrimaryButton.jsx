export default function PrimaryButton({ children, className = '', disabled = false, ...props }) {
    return (
        <button
            type="submit"
            disabled={disabled}
            className={`inline-flex items-center justify-center px-4 py-2 rounded-md
                bg-green-500 hover:bg-green-600 active:bg-green-700
                text-sm font-semibold text-white
                focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                transition-colors duration-150
                disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
