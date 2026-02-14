import { Link } from 'react-router-dom';
import { HiOutlineDotsVertical, HiOutlineClock, HiOutlineBookmark, HiOutlineFlag, HiOutlineShare } from 'react-icons/hi';
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
    const menuRef = useRef(null);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const handleClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleWatchLater = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) return toast.error('Please sign in');
        try {
            await userAPI.toggleWatchLater(video._id);
            toast.success('Saved to Watch later');
        } catch { }
        setShowMenu(false);
    };

    const owner = video.owner || {};

    // Horizontal card (for search, history, etc.)
    if (horizontal) {
        return (
            <div className="flex gap-4 p-2 rounded-xl hover:bg-z-surface transition-colors group">
                <Link to={`/watch/${video._id}`} className="relative shrink-0 w-40 sm:w-64 aspect-video rounded-xl overflow-hidden bg-z-surface">
                    <img
                        src={video.thumbnail || `https://placehold.co/640x360/1a1a1a/9147ff?text=${encodeURIComponent(video.title?.slice(0, 1) || 'Z')}`}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                    />
                    {video.duration && (
                        <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 text-xs font-medium bg-black/80 text-white rounded">
                            {formatDuration(video.duration)}
                        </span>
                    )}
                    {/* Progress bar for watch history */}
                    {video.watchProgress && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-z-text-muted/30">
                            <div className="h-full bg-accent-rose" style={{ width: `${video.watchProgress}%` }} />
                        </div>
                    )}
                </Link>

                <div className="flex-1 min-w-0 py-1">
                    <Link to={`/watch/${video._id}`}>
                        <h3 className="font-medium text-sm text-z-text line-clamp-2 mb-1 group-hover:text-brand-light transition-colors">
                            {video.title}
                        </h3>
                    </Link>
                    <div className="flex items-center gap-1 text-xs text-z-text-muted mb-1">
                        <span>{formatViews(video.views)}</span>
                        <span>•</span>
                        <span>{timeAgo(video.createdAt)}</span>
                    </div>
                    <Link to={`/channel/${owner._id}`} className="flex items-center gap-2 mb-1.5">
                        <img src={owner.avatar || `https://ui-avatars.com/api/?name=${owner.name}&background=9147ff&color=fff&size=48`}
                            alt={owner.name} className="avatar avatar-xs" />
                        <span className="text-xs text-z-text-muted hover:text-z-text transition-colors">{owner.channelName || owner.name}</span>
                    </Link>
                    <p className="text-xs text-z-text-muted line-clamp-1 hidden sm:block">{video.description}</p>
                    {video.isShort && <span className="tag-new text-[10px] mt-1">SHORT</span>}
                </div>
            </div>
        );
    }

    // Default vertical card (YouTube grid style)
    return (
        <div
            className="group animate-fade-in"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => { setIsHovered(false); setShowMenu(false); }}
        >
            {/* Thumbnail */}
            <Link to={`/watch/${video._id}`} className="relative block aspect-video rounded-xl overflow-hidden bg-z-surface mb-3">
                <img
                    src={video.thumbnail || `https://placehold.co/640x360/1a1a1a/9147ff?text=${encodeURIComponent(video.title?.slice(0, 2) || 'Z')}`}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    loading="lazy"
                />

                {/* Duration badge */}
                {video.duration && (
                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 text-xs font-medium bg-black/80 text-white rounded">
                        {formatDuration(video.duration)}
                    </span>
                )}

                {/* Hover overlay actions */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/30 to-transparent transition-opacity duration-200
          ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                        <button
                            onClick={handleWatchLater}
                            className="p-2 bg-black/70 rounded-lg hover:bg-black/90 transition-colors"
                            title="Watch later"
                        >
                            <HiOutlineClock className="w-4 h-4 text-white" />
                        </button>
                        <button
                            className="p-2 bg-black/70 rounded-lg hover:bg-black/90 transition-colors"
                            title="Add to queue"
                        >
                            <HiOutlineBookmark className="w-4 h-4 text-white" />
                        </button>
                    </div>
                </div>

                {/* Short badge */}
                {video.isShort && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider
            bg-accent-rose/90 text-white rounded-md">
                        Short
                    </span>
                )}

                {/* Live badge */}
                {video.isLive && (
                    <span className="tag-live absolute bottom-2 left-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        LIVE
                    </span>
                )}

                {/* Progress bar for continue watching */}
                {video.watchProgress && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-z-text-muted/30">
                        <div className="h-full bg-accent-rose" style={{ width: `${video.watchProgress}%` }} />
                    </div>
                )}
            </Link>

            {/* Video Info */}
            <div className="flex gap-3">
                {/* Channel Avatar */}
                <Link to={`/channel/${owner._id}`} className="shrink-0 mt-0.5">
                    <img
                        src={owner.avatar || `https://ui-avatars.com/api/?name=${owner.name}&background=9147ff&color=fff&size=72`}
                        alt={owner.name}
                        className="avatar w-9 h-9 hover:ring-2 hover:ring-brand/30 transition-all"
                    />
                </Link>

                {/* Text Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                        <Link to={`/watch/${video._id}`}>
                            <h3 className="text-sm font-medium text-z-text line-clamp-2 leading-snug">
                                {video.title}
                            </h3>
                        </Link>

                        {/* Three-dot menu */}
                        <div ref={menuRef} className="relative shrink-0">
                            <button
                                onClick={(e) => { e.preventDefault(); setShowMenu(!showMenu); }}
                                className={`p-1 rounded-full hover:bg-z-surface-hover transition-all
                  ${isHovered || showMenu ? 'opacity-100' : 'opacity-0'}`}
                            >
                                <HiOutlineDotsVertical className="w-4 h-4 text-z-text-secondary" />
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

                    <Link to={`/channel/${owner._id}`} className="text-xs text-z-text-muted hover:text-z-text transition-colors block mt-0.5">
                        {owner.channelName || owner.name}
                    </Link>
                    <div className="flex items-center gap-1 text-xs text-z-text-muted">
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
