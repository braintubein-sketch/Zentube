const VideoCardSkeleton = ({ count = 8, horizontal = false }) => {
    if (horizontal) {
        return (
            <div className="space-y-3">
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="flex gap-4 p-2 animate-pulse">
                        <div className="w-40 sm:w-64 aspect-video rounded-xl skeleton-shimmer shrink-0" />
                        <div className="flex-1 py-1 space-y-2">
                            <div className="h-4 skeleton rounded w-3/4" />
                            <div className="h-3 skeleton rounded w-1/2" />
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full skeleton" />
                                <div className="h-3 skeleton rounded w-24" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="animate-pulse">
                    <div className="aspect-video rounded-xl skeleton-shimmer mb-3" />
                    <div className="flex gap-3">
                        <div className="w-9 h-9 rounded-full skeleton shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 skeleton rounded w-full" />
                            <div className="h-3 skeleton rounded w-3/4" />
                            <div className="h-3 skeleton rounded w-1/2" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default VideoCardSkeleton;
