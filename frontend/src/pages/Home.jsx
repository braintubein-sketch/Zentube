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
            {/* Category Chips Bar — YouTube exact style */}
            <div className="sticky top-14 z-20 pb-3 pt-1 -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6"
                style={{ backgroundColor: '#0f0f0f', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="relative">
                    {/* Left Arrow */}
                    {showLeftArrow && (
                        <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center">
                            <div className="pr-6 pl-1" style={{ background: 'linear-gradient(to right, #0f0f0f 70%, transparent)' }}>
                                <button onClick={() => scrollChips(-1)}
                                    className="w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:bg-[#272727]">
                                    <HiOutlineChevronLeft className="w-5 h-5" style={{ color: '#f1f1f1' }} />
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
                                className="shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                style={activeCategory === cat
                                    ? { backgroundColor: '#f1f1f1', color: '#0f0f0f' }
                                    : { backgroundColor: '#272727', color: '#f1f1f1' }
                                }
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Right Arrow */}
                    {showRightArrow && (
                        <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center">
                            <div className="pl-6 pr-1" style={{ background: 'linear-gradient(to left, #0f0f0f 70%, transparent)' }}>
                                <button onClick={() => scrollChips(1)}
                                    className="w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:bg-[#272727]">
                                    <HiOutlineChevronRight className="w-5 h-5" style={{ color: '#f1f1f1' }} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Video Grid */}
            <div className="mt-4 sm:mt-6">
                {loading ? (
                    <VideoCardSkeleton count={12} />
                ) : videos.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-8">
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
                                <div className="flex items-center gap-3 text-sm" style={{ color: '#aaaaaa' }}>
                                    <div className="w-6 h-6 border-2 border-transparent border-t-[#ff0000] rounded-full animate-spin" />
                                    Loading more...
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#272727' }}>
                            <span className="text-5xl">🎬</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-2" style={{ color: '#f1f1f1' }}>No videos found</h3>
                        <p className="text-sm mb-6" style={{ color: '#717171' }}>
                            {activeCategory !== 'All'
                                ? `No ${activeCategory} videos yet. Try a different category.`
                                : 'Be the first to upload a video!'}
                        </p>
                        {activeCategory !== 'All' && (
                            <button onClick={() => setActiveCategory('All')}
                                className="px-6 py-2.5 rounded-full text-sm font-semibold transition-opacity"
                                style={{ backgroundColor: '#3ea6ff', color: '#0f0f0f' }}>
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
