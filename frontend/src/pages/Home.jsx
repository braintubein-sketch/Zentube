import { useState, useEffect, useRef, useCallback } from 'react';
import { videoAPI } from '../api';
import VideoCard from '../components/VideoCard';
import VideoCardSkeleton from '../components/VideoCardSkeleton';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';

const CATEGORIES = [
    'All', 'Music', 'Gaming', 'Education', 'Tech', 'Entertainment',
    'Movies', 'Vlogs', 'Sports', 'News', 'Live', 'Recently uploaded',
    'Watched', 'New to you'
];

const Home = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const chipsRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);
    const observer = useRef(null);

    useEffect(() => {
        setPage(1);
        setVideos([]);
        fetchVideos(1, true);
    }, [activeCategory]);

    const fetchVideos = async (pageNum = 1, reset = false) => {
        try {
            if (reset) setLoading(true);
            else setLoadingMore(true);

            const params = { page: pageNum, limit: 16 };
            if (activeCategory !== 'All') params.category = activeCategory;

            const { data } = await videoAPI.getVideos(params);
            setVideos(prev => reset ? data.videos : [...prev, ...data.videos]);
            setHasMore(pageNum < data.pages);
        } catch {
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Infinite scroll
    const lastVideoRef = useCallback(node => {
        if (loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                const nextPage = page + 1;
                setPage(nextPage);
                fetchVideos(nextPage);
            }
        });
        if (node) observer.current.observe(node);
    }, [loadingMore, hasMore, page, activeCategory]);

    // Chip scroll handling
    const handleChipScroll = () => {
        if (!chipsRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = chipsRef.current;
        setShowLeftArrow(scrollLeft > 10);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    };

    const scrollChips = (direction) => {
        if (!chipsRef.current) return;
        chipsRef.current.scrollBy({ left: direction * 200, behavior: 'smooth' });
    };

    useEffect(() => {
        const el = chipsRef.current;
        if (el) {
            el.addEventListener('scroll', handleChipScroll);
            handleChipScroll();
            return () => el.removeEventListener('scroll', handleChipScroll);
        }
    }, []);

    return (
        <div>
            {/* Category Chips Bar (YouTube style) */}
            <div className="sticky top-14 z-20 bg-z-bg/95 backdrop-blur-md pb-3 pt-1 -mx-6 px-6 border-b border-z-border/30">
                <div className="relative">
                    {/* Left Arrow */}
                    {showLeftArrow && (
                        <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center">
                            <div className="bg-gradient-to-r from-z-bg via-z-bg/95 to-transparent pr-6 pl-1">
                                <button onClick={() => scrollChips(-1)} className="btn-icon-sm bg-z-bg">
                                    <HiOutlineChevronLeft className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Chips */}
                    <div ref={chipsRef} className="flex gap-3 overflow-x-auto no-scrollbar px-1 py-1">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`chip ${activeCategory === cat ? 'chip-active' : ''} shrink-0`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Right Arrow */}
                    {showRightArrow && (
                        <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center">
                            <div className="bg-gradient-to-l from-z-bg via-z-bg/95 to-transparent pl-6 pr-1">
                                <button onClick={() => scrollChips(1)} className="btn-icon-sm bg-z-bg">
                                    <HiOutlineChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Video Grid */}
            <div className="mt-6">
                {loading ? (
                    <VideoCardSkeleton count={12} />
                ) : videos.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                            {videos.map((video, index) => (
                                <div
                                    key={video._id}
                                    ref={index === videos.length - 1 ? lastVideoRef : null}
                                >
                                    <VideoCard video={video} />
                                </div>
                            ))}
                        </div>

                        {/* Loading more indicator */}
                        {loadingMore && (
                            <div className="flex justify-center py-8">
                                <div className="flex items-center gap-3 text-z-text-muted text-sm">
                                    <div className="w-6 h-6 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
                                    Loading more...
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-z-surface flex items-center justify-center">
                            <span className="text-5xl">🎬</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No videos found</h3>
                        <p className="text-z-text-muted text-sm mb-6">
                            {activeCategory !== 'All'
                                ? `No ${activeCategory} videos yet. Try a different category.`
                                : 'Be the first to upload a video!'}
                        </p>
                        {activeCategory !== 'All' && (
                            <button onClick={() => setActiveCategory('All')} className="btn-primary">
                                Browse All Videos
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
