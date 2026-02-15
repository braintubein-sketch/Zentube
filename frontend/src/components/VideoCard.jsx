import { Link } from 'react-router-dom';
import { HiOutlineDotsVertical, HiOutlineClock, HiOutlineBookmark, HiOutlineFlag, HiOutlineShare, HiCheck } from 'react-icons/hi';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../api';
import toast from 'react-hot-toast';

export const formatViews = (num) => {
    if (!num) return '0 views';
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B views`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M views`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K views`;
    return `${num} views`;
};

export const formatViewsShort = (num) => {
    if (!num) return '0';
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return `${num}`;
};

export const timeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const seconds = Math.floor((now - past) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
    const years = Math.floor(days / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
};

export const formatDuration = (seconds) => {
    if (!seconds) return '';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
};

const VideoCard = ({ video, horizontal = false }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [savedWL, setSavedWL] = useState(false);
    const menuRef = useRef(null);
    const hoverTimer = useRef(null);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const handleClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            if (hoverTimer.current) clearTimeout(hoverTimer.current);
        };
    }, []);

    const handleMouseEnter = () => {
        hoverTimer.current = setTimeout(() => setIsHovered(true), 100);
    };
    const handleMouseLeave = () => {
        if (hoverTimer.current) clearTimeout(hoverTimer.current);
        setIsHovered(false);
        setShowMenu(false);
    };

    const handleWatchLater = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) return toast.error('Please sign in');
        try {
            await userAPI.toggleWatchLater(video._id);
            setSavedWL(true);
            toast.success('Saved to Watch later');
        } catch { }
        setShowMenu(false);
    };

    const owner = video.owner || {};

    // Horizontal card (search results, watch page recommendations)
    if (horizontal) {
        return (
            <div className="flex gap-2 group cursor-pointer rounded-xl transition-colors"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => { setIsHovered(false); setShowMenu(false); }}>
                <Link to={`/watch/${video._id}`} className="relative shrink-0 w-40 sm:w-44 aspect-video rounded-lg overflow-hidden" style={{ backgroundColor: '#272727' }}>
                    <img
                        src={video.thumbnail || `https://placehold.co/640x360/272727/717171?text=${encodeURIComponent(video.title?.slice(0, 1) || 'Z')}`}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                    {video.duration && (
                        <span className="absolute bottom-1 right-1 px-1 py-px text-[11px] font-medium rounded"
                            style={{ backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff' }}>
                            {formatDuration(video.duration)}
                        </span>
                    )}
                    {video.watchProgress && (
                        <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                            <div className="h-full" style={{ width: `${video.watchProgress}%`, backgroundColor: '#ff0000' }} />
                        </div>
                    )}
                </Link>

                <div className="flex-1 min-w-0 py-0.5">
                    <Link to={`/watch/${video._id}`}>
                        <h3 className="font-medium text-sm line-clamp-2 mb-1 leading-5" style={{ color: '#f1f1f1' }}>
                            {video.title}
                        </h3>
                    </Link>
                    <Link to={`/channel/${owner._id}`} className="text-xs block mb-0.5 transition-colors" style={{ color: '#aaaaaa' }}>
                        {owner.channelName || owner.name}
                    </Link>
                    <div className="flex items-center gap-1 text-xs" style={{ color: '#aaaaaa' }}>
                        <span>{formatViews(video.views)}</span>
                        <span>•</span>
                        <span>{timeAgo(video.createdAt)}</span>
                    </div>
                    {video.isShort && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] font-bold uppercase rounded" style={{ backgroundColor: 'rgba(255,0,0,0.15)', color: '#ff4e45' }}>SHORT</span>
                    )}
                </div>

                {/* Three dot */}
                <div ref={menuRef} className="relative shrink-0 self-start pt-1">
                    <button
                        onClick={(e) => { e.preventDefault(); setShowMenu(!showMenu); }}
                        className="p-1 rounded-full transition-opacity"
                        style={{ opacity: isHovered || showMenu ? 1 : 0 }}
                    >
                        <HiOutlineDotsVertical className="w-4 h-4" style={{ color: '#f1f1f1' }} />
                    </button>
                    {showMenu && (
                        <div className="dropdown-menu right-0 top-8 w-52 z-50">
                            <button onClick={handleWatchLater} className="dropdown-item w-full">
                                <HiOutlineClock className="w-4 h-4" /> Save to Watch later
                            </button>
                            <button className="dropdown-item w-full">
                                <HiOutlineBookmark className="w-4 h-4" /> Save to playlist
                            </button>
                            <button className="dropdown-item w-full">
                                <HiOutlineShare className="w-4 h-4" /> Share
                            </button>
                            <div className="dropdown-divider" />
                            <button className="dropdown-item w-full">
                                <HiOutlineFlag className="w-4 h-4" /> Report
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Default vertical card — exact YouTube style
    return (
        <div
            className="group animate-fade-in"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Thumbnail */}
            <Link to={`/watch/${video._id}`} className="relative block aspect-video rounded-xl overflow-hidden mb-3" style={{ backgroundColor: '#272727' }}>
                <img
                    src={video.thumbnail || `https://placehold.co/640x360/272727/717171?text=${encodeURIComponent(video.title?.slice(0, 2) || 'Z')}`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />

                {/* Duration badge — YouTube style: bottom-right, semi-transparent black */}
                {video.duration && (
                    <span className="absolute bottom-1 right-1 px-1 py-px text-xs font-medium rounded"
                        style={{ backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: '12px', lineHeight: '18px' }}>
                        {formatDuration(video.duration)}
                    </span>
                )}

                {/* Hover overlay — Watch Later + Add to Queue */}
                <div className="absolute top-1 right-1 flex flex-col gap-1 transition-opacity duration-150"
                    style={{ opacity: isHovered ? 1 : 0 }}>
                    <button
                        onClick={handleWatchLater}
                        className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors"
                        style={{ backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff' }}
                        title="Watch later"
                    >
                        {savedWL ? <HiCheck className="w-4 h-4" /> : <HiOutlineClock className="w-4 h-4" />}
                    </button>
                    <button
                        className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors"
                        style={{ backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff' }}
                        title="Add to queue"
                    >
                        <HiOutlineBookmark className="w-4 h-4" />
                    </button>
                </div>

                {/* Short badge */}
                {video.isShort && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded"
                        style={{ backgroundColor: 'rgba(204,0,0,0.9)', color: '#fff' }}>
                        Short
                    </span>
                )}

                {/* Live badge */}
                {video.isLive && (
                    <span className="tag-live absolute bottom-1 left-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        LIVE
                    </span>
                )}

                {/* Progress bar for continue watching */}
                {video.watchProgress && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                        <div className="h-full" style={{ width: `${video.watchProgress}%`, backgroundColor: '#ff0000' }} />
                    </div>
                )}
            </Link>

            {/* Video Info — YouTube exact layout */}
            <div className="flex gap-3">
                {/* Channel Avatar — 36px like YouTube */}
                <Link to={`/channel/${owner._id}`} className="shrink-0 mt-0.5">
                    <img
                        src={owner.avatar || `https://ui-avatars.com/api/?name=${owner.name}&background=282828&color=aaa&size=72`}
                        alt={owner.name}
                        className="w-9 h-9 rounded-full object-cover"
                        style={{ backgroundColor: '#282828' }}
                    />
                </Link>

                {/* Text Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                        <Link to={`/watch/${video._id}`}>
                            <h3 className="text-sm font-medium line-clamp-2 leading-5" style={{ color: '#f1f1f1' }}>
                                {video.title}
                            </h3>
                        </Link>

                        {/* Three-dot menu */}
                        <div ref={menuRef} className="relative shrink-0">
                            <button
                                onClick={(e) => { e.preventDefault(); setShowMenu(!showMenu); }}
                                className="p-1 rounded-full transition-opacity"
                                style={{ opacity: isHovered || showMenu ? 1 : 0 }}
                            >
                                <HiOutlineDotsVertical className="w-4 h-4" style={{ color: '#f1f1f1' }} />
                            </button>

                            {showMenu && (
                                <div className="dropdown-menu right-0 top-8 w-52 z-50">
                                    <button onClick={handleWatchLater} className="dropdown-item w-full">
                                        <HiOutlineClock className="w-4 h-4" /> Save to Watch later
                                    </button>
                                    <button className="dropdown-item w-full">
                                        <HiOutlineBookmark className="w-4 h-4" /> Save to playlist
                                    </button>
                                    <button className="dropdown-item w-full">
                                        <HiOutlineShare className="w-4 h-4" /> Share
                                    </button>
                                    <div className="dropdown-divider" />
                                    <button className="dropdown-item w-full">
                                        <HiOutlineFlag className="w-4 h-4" /> Report
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Channel name — YouTube uses #aaa for secondary text */}
                    <Link to={`/channel/${owner._id}`} className="text-xs block mt-0.5 leading-4 transition-colors"
                        style={{ color: '#aaaaaa' }}>
                        {owner.channelName || owner.name}
                    </Link>

                    {/* Views • Time ago */}
                    <div className="flex items-center gap-1 text-xs" style={{ color: '#aaaaaa' }}>
                        <span>{formatViews(video.views)}</span>
                        <span>•</span>
                        <span>{timeAgo(video.createdAt)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoCard;
