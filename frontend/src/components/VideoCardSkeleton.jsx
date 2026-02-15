const VideoCardSkeleton = ({ count = 8, horizontal = false }) => {
    const shimmerBg = '#272727';
    const shimmerHighlight = '#3f3f3f';

    if (horizontal) {
        return (
            <div className="space-y-3">
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="flex gap-4 p-2 animate-pulse">
                        <div className="w-40 sm:w-64 aspect-video rounded-xl shrink-0" style={{ backgroundColor: shimmerBg }} />
                        <div className="flex-1 py-1 space-y-2">
                            <div className="h-4 rounded w-3/4" style={{ backgroundColor: shimmerHighlight }} />
                            <div className="h-3 rounded w-1/2" style={{ backgroundColor: shimmerBg }} />
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: shimmerBg }} />
                                <div className="h-3 rounded w-24" style={{ backgroundColor: shimmerBg }} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-8">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="animate-pulse">
                    <div className="aspect-video rounded-xl mb-3" style={{ backgroundColor: shimmerBg }} />
                    <div className="flex gap-3">
                        <div className="w-9 h-9 rounded-full shrink-0" style={{ backgroundColor: shimmerHighlight }} />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 rounded w-full" style={{ backgroundColor: shimmerHighlight }} />
                            <div className="h-3 rounded w-3/4" style={{ backgroundColor: shimmerBg }} />
                            <div className="h-3 rounded w-1/2" style={{ backgroundColor: shimmerBg }} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default VideoCardSkeleton;
