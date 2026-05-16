function ShimmerStyles() {
    return (
        <style>{`
            @keyframes sk-shimmer {
                0%   { background-position: 200% center; }
                100% { background-position: -200% center; }
            }
            .sk {
                background: linear-gradient(
                    90deg,
                    #e5e7eb 0%,
                    #f3f4f6 40%,
                    #eaecee 60%,
                    #e5e7eb 100%
                );
                background-size: 400% 100%;
                animation: sk-shimmer 1.6s ease-in-out infinite;
            }
        `}</style>
    );
}

export { ShimmerStyles };

export function Skeleton({ className = '', style }) {
    return <div className={`sk ${className}`} style={style} />;
}

export function SkeletonCard() {
    return (
        <div>
            <div className="sk w-full aspect-[16/10] rounded-2xl" />
            <div className="mt-3 space-y-2">
                <div className="sk h-4 w-3/4 rounded-md" />
                <div className="sk h-3 w-1/2 rounded-md" />
                <div className="sk h-3 w-1/4 rounded-md" />
            </div>
        </div>
    );
}
