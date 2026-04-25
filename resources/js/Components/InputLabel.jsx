export default function InputLabel({ value, htmlFor, className = '', children }) {
    return (
        <label
            htmlFor={htmlFor}
            className={`block text-sm font-medium text-gray-800 ${className}`}
        >
            {value ?? children}
        </label>
    );
}
