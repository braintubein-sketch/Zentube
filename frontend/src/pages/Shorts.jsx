import { useState, useEffect, useRef, useCallback } from 'react';
import { videoAPI } from '../api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatViews, formatViewsShort, timeAgo } from '../components/VideoCard';
import {
    HiOutlineThumbUp, HiOutlineChatAlt, HiOutlineShare,
    HiOutlineVolumeUp, HiOutlineVolumeOff, HiThumbUp
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const Shorts = () => {
    const [shorts, setShorts] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [muted, setMuted] = useState(false);
    const containerRef = useRef(null);
    const videoRefs = useRef([]);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        fetchShorts();
    }, []);

    const fetchShorts = async () => {
        try {
            const { data } = await videoAPI.getShorts({ limit: 20 });
            setShorts(data.videos);
        } catch {
            toast.error('Failed to load shorts');
        } finally {
            setLoading(false);
        }
    };

    const handleScroll = useCallback(() => {
        if (!containerRef.current) return;
        const scrollTop = containerRef.current.scrollTop;
        const height = containerRef.current.clientHeight;
        const newIndex = Math.round(scrollTop / height);

        if (newIndex !== currentIndex && newIndex < shorts.length) {
            setCurrentIndex(newIndex);
            videoRefs.current.forEach((ref, i) => {
                if (ref) {
                    if (i === newIndex) ref.play().catch(() => { });
                    else ref.pause();
                }
            });
        }
    }, [currentIndex, shorts.length]);

    const handleLike = async (shortId) => {
        if (!isAuthenticated) return toast.error('Please sign in');
        try { await videoAPI.likeVideo(shortId); } catch { }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <div className="w-12 h-12 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
            </div>
        );
    }

    if (shorts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
                <span className="text-6xl mb-4">🎬</span>
                <h2 className="text-2xl font-bold mb-2">No Shorts yet</h2>
                <p className="text-z-text-muted">Be the first to upload a Short!</p>
            </div>
        );
    }

    return (
        <div className="flex justify-center">
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="h-[calc(100vh-4rem)] overflow-y-scroll snap-y snap-mandatory w-full max-w-[420px] no-scrollbar"
            >
                {shorts.map((short, index) => (
                    <div key={short._id} className="h-[calc(100vh-4rem)] snap-start snap-always relative flex items-center justify-center py-2">
                        <div className="relative w-full h-full max-h-[90vh] bg-black rounded-2xl overflow-hidden group">
                            <video
                                ref={(el) => { videoRefs.current[index] = el; }}
                                src={short.videoUrl}
                                loop muted={muted} playsInline
                                autoPlay={index === 0}
                                className="w-full h-full object-cover"
                                onClick={() => {
                                    const vid = videoRefs.current[index];
                                    if (vid) vid.paused ? vid.play() : vid.pause();
                                }}
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                            {/* Right actions */}
                            <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5">
                                <button onClick={() => handleLike(short._id)} className="flex flex-col items-center gap-1">
                                    <div className="w-12 h-12 rounded-full bg-z-surface/80 backdrop-blur-sm flex items-center justify-center
                    hover:bg-z-surface transition-colors active:scale-90">
                                        <HiOutlineThumbUp className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-medium">{formatViewsShort(short.likes?.length || 0)}</span>
                                </button>

                                <button className="flex flex-col items-center gap-1">
                                    <div className="w-12 h-12 rounded-full bg-z-surface/80 backdrop-blur-sm flex items-center justify-center
                    hover:bg-z-surface transition-colors active:scale-90">
                                        <HiOutlineChatAlt className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-medium">{formatViewsShort(short.commentCount || 0)}</span>
                                </button>

                                <button
                                    onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
                                    className="flex flex-col items-center gap-1"
                                >
                                    <div className="w-12 h-12 rounded-full bg-z-surface/80 backdrop-blur-sm flex items-center justify-center
                    hover:bg-z-surface transition-colors active:scale-90">
                                        <HiOutlineShare className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-medium">Share</span>
                                </button>

                                <button onClick={() => setMuted(!muted)}>
                                    <div className="w-12 h-12 rounded-full bg-z-surface/80 backdrop-blur-sm flex items-center justify-center
                    hover:bg-z-surface transition-colors active:scale-90">
                                        {muted ? <HiOutlineVolumeOff className="w-6 h-6" /> : <HiOutlineVolumeUp className="w-6 h-6" />}
                                    </div>
                                </button>

                                {/* Creator avatar */}
                                <Link to={`/channel/${short.owner?._id}`} className="mt-2">
                                    <img
                                        src={short.owner?.avatar || `https://ui-avatars.com/api/?name=${short.owner?.name}&background=9147ff&color=fff`}
                                        alt={short.owner?.name}
                                        className="w-10 h-10 rounded-full border-2 border-white object-cover"
                                    />
                                </Link>
                            </div>

                            {/* Bottom info */}
                            <div className="absolute bottom-4 left-4 right-20">
                                <div className="flex items-center gap-2 mb-2">
                                    <Link to={`/channel/${short.owner?._id}`} className="text-sm font-bold hover:underline">
                                        @{short.owner?.channelName || short.owner?.name}
                                    </Link>
                                    <button className="text-xs font-semibold px-3 py-1 rounded-full border border-white/50
                    hover:bg-white/10 transition-colors">
                                        Subscribe
                                    </button>
                                </div>
                                <p className="text-sm line-clamp-2">{short.title}</p>
                                <p className="text-xs text-white/60 mt-1">{formatViews(short.views)} • {timeAgo(short.createdAt)}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Shorts;
