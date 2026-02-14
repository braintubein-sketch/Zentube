import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { videoAPI, userAPI } from '../api';
import { commentAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import VideoCard from '../components/VideoCard';
import { formatViews, formatViewsShort, timeAgo, formatDuration } from '../components/VideoCard';
import toast from 'react-hot-toast';
import {
    HiOutlineThumbUp, HiOutlineThumbDown, HiOutlineShare, HiOutlineBookmark,
    HiOutlineFlag, HiOutlineDownload, HiOutlineClock,
    HiOutlineDotsHorizontal, HiOutlineArrowsExpand, HiOutlineX,
    HiThumbUp, HiThumbDown
} from 'react-icons/hi';

const Watch = () => {
    const { id } = useParams();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recommended, setRecommended] = useState([]);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [showCommentActions, setShowCommentActions] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [theaterMode, setTheaterMode] = useState(false);
    const [showMore, setShowMore] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [commentSort, setCommentSort] = useState('top');

    useEffect(() => {
        if (id) {
            fetchVideo();
            fetchEngagement();
            window.scrollTo(0, 0);
        }
    }, [id]);

    const fetchVideo = async () => {
        try {
            setLoading(true);
            const { data } = await videoAPI.getVideo(id);
            setVideo(data.video);
            setLikeCount(data.video.likes?.length || 0);
            setLiked(data.video.likes?.includes(user?._id));
            setDisliked(data.video.dislikes?.includes(user?._id));

            // Track watch history + views
            if (isAuthenticated) {
                userAPI.addToWatchHistory(id).catch(() => { });
            }

            // Fetch recommended & comments
            videoAPI.getRecommended(id).then(res => setRecommended(res.data.videos)).catch(() => { });
            commentAPI.getComments(id).then(res => setComments(res.data.comments)).catch(() => { });
        } catch {
            toast.error('Video not found');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const fetchEngagement = async () => {
        // Check subscription status
        if (isAuthenticated && video?.owner?._id) {
            // Would need an API endpoint; using local state for now
        }
    };

    const handleLike = async () => {
        if (!isAuthenticated) return toast.error('Please sign in to like');
        try {
            const { data } = await videoAPI.likeVideo(id);
            setLiked(data.liked);
            setDisliked(false);
            setLikeCount(data.likeCount);
        } catch { }
    };

    const handleDislike = async () => {
        if (!isAuthenticated) return toast.error('Please sign in');
        try {
            const { data } = await videoAPI.dislikeVideo(id);
            setDisliked(data.disliked);
            if (data.disliked) setLiked(false);
            setLikeCount(data.likeCount);
        } catch { }
    };

    const handleSubscribe = async () => {
        if (!isAuthenticated) return toast.error('Please sign in');
        try {
            const { data } = await userAPI.subscribe(video.owner._id);
            setIsSubscribed(data.isSubscribed);
            toast.success(data.isSubscribed ? 'Subscribed!' : 'Unsubscribed');
        } catch { }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        if (!isAuthenticated) return toast.error('Please sign in');
        try {
            const { data } = await commentAPI.addComment(id, { text: commentText });
            setComments(prev => [data.comment, ...prev]);
            setCommentText('');
            setShowCommentActions(false);
            toast.success('Comment added');
        } catch { }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
        setShowShareModal(false);
    };

    const handleWatchLater = async () => {
        if (!isAuthenticated) return toast.error('Please sign in');
        try {
            await userAPI.toggleWatchLater(id);
            toast.success('Saved to Watch later');
        } catch { }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="aspect-video bg-z-surface rounded-xl mb-4" />
                    <div className="h-6 bg-z-surface rounded w-3/4 mb-3" />
                    <div className="h-4 bg-z-surface rounded w-1/2" />
                </div>
            </div>
        );
    }

    if (!video) return null;
    const owner = video.owner || {};

    return (
        <div className={`${theaterMode ? '' : 'max-w-[1800px] mx-auto p-6'}`}>
            <div className={`flex ${theaterMode ? 'flex-col' : 'flex-col xl:flex-row'} gap-6`}>

                {/* === Main Column === */}
                <div className={`${theaterMode ? 'w-full' : 'flex-1 min-w-0'}`}>

                    {/* Video Player */}
                    <div className={`relative bg-black ${theaterMode ? 'w-full aspect-video max-h-[80vh]' : 'rounded-xl overflow-hidden aspect-video'}`}>
                        <video
                            ref={videoRef}
                            src={video.videoUrl}
                            controls
                            autoPlay
                            className="w-full h-full"
                            poster={video.thumbnail}
                        />
                        {/* Theater toggle */}
                        <button
                            onClick={() => setTheaterMode(!theaterMode)}
                            className="absolute top-3 right-3 p-2 bg-black/60 rounded-lg hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                            title={theaterMode ? 'Exit theater' : 'Theater mode'}
                        >
                            <HiOutlineArrowsExpand className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    {/* Video Info */}
                    <div className={`${theaterMode ? 'px-6 max-w-[1200px] mx-auto' : ''} mt-3`}>
                        {/* Title */}
                        <h1 className="text-xl font-bold text-z-text leading-snug">{video.title}</h1>

                        {/* Actions Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                            {/* Channel info + Subscribe */}
                            <div className="flex items-center gap-3">
                                <Link to={`/channel/${owner._id}`}>
                                    <img
                                        src={owner.avatar || `https://ui-avatars.com/api/?name=${owner.name}&background=9147ff&color=fff&size=80`}
                                        alt={owner.name}
                                        className="avatar avatar-lg hover:ring-2 hover:ring-brand/30 transition-all"
                                    />
                                </Link>
                                <div>
                                    <Link to={`/channel/${owner._id}`} className="font-semibold text-sm hover:text-z-text transition-colors">
                                        {owner.channelName || owner.name}
                                    </Link>
                                    <p className="text-xs text-z-text-muted">{formatViewsShort(owner.subscriberCount || 0)} subscribers</p>
                                </div>
                                {user?._id !== owner._id && (
                                    <button
                                        onClick={handleSubscribe}
                                        className={`ml-2 ${isSubscribed ? 'btn-subscribed' : 'btn-subscribe'}`}
                                    >
                                        {isSubscribed ? 'Subscribed' : 'Subscribe'}
                                    </button>
                                )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2 flex-wrap">
                                {/* Like/Dislike pill */}
                                <div className="flex items-center bg-z-surface rounded-full overflow-hidden">
                                    <button
                                        onClick={handleLike}
                                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors
                      ${liked ? 'text-z-text' : 'text-z-text-secondary hover:text-z-text'}
                      hover:bg-z-surface-hover`}
                                    >
                                        {liked ? <HiThumbUp className="w-5 h-5" /> : <HiOutlineThumbUp className="w-5 h-5" />}
                                        <span>{formatViewsShort(likeCount)}</span>
                                    </button>
                                    <div className="w-px h-6 bg-z-border" />
                                    <button
                                        onClick={handleDislike}
                                        className={`px-3 py-2 transition-colors
                      ${disliked ? 'text-z-text' : 'text-z-text-secondary hover:text-z-text'}
                      hover:bg-z-surface-hover`}
                                    >
                                        {disliked ? <HiThumbDown className="w-5 h-5" /> : <HiOutlineThumbDown className="w-5 h-5" />}
                                    </button>
                                </div>

                                {/* Share */}
                                <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-z-surface rounded-full text-sm font-medium
                  text-z-text-secondary hover:text-z-text hover:bg-z-surface-hover transition-colors">
                                    <HiOutlineShare className="w-5 h-5" />
                                    Share
                                </button>

                                {/* Save */}
                                <button onClick={handleWatchLater} className="flex items-center gap-2 px-4 py-2 bg-z-surface rounded-full text-sm font-medium
                  text-z-text-secondary hover:text-z-text hover:bg-z-surface-hover transition-colors">
                                    <HiOutlineBookmark className="w-5 h-5" />
                                    Save
                                </button>

                                {/* More menu */}
                                <button className="p-2 bg-z-surface rounded-full text-z-text-secondary hover:text-z-text hover:bg-z-surface-hover transition-colors">
                                    <HiOutlineDotsHorizontal className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mt-4 bg-z-surface rounded-xl p-3 cursor-pointer hover:bg-z-surface-hover transition-colors"
                            onClick={() => setShowMore(!showMore)}>
                            <div className="flex items-center gap-2 text-sm font-medium text-z-text mb-1">
                                <span>{formatViews(video.views)}</span>
                                <span>{timeAgo(video.createdAt)}</span>
                                {video.tags?.length > 0 && video.tags.slice(0, 3).map(tag => (
                                    <span key={tag} className="text-brand-light font-medium">#{tag}</span>
                                ))}
                            </div>
                            <p className={`text-sm text-z-text-secondary whitespace-pre-wrap ${showMore ? '' : 'line-clamp-2'}`}>
                                {video.description || 'No description available.'}
                            </p>
                            {!showMore && video.description?.length > 100 && (
                                <button className="text-sm font-medium text-z-text mt-1">Show more</button>
                            )}
                            {showMore && (
                                <button className="text-sm font-medium text-z-text mt-2">Show less</button>
                            )}
                        </div>

                        {/* Comments Section */}
                        <div className="mt-6">
                            <div className="flex items-center gap-6 mb-6">
                                <h3 className="text-base font-bold">{comments.length} Comments</h3>
                                <button
                                    onClick={() => setCommentSort(commentSort === 'top' ? 'newest' : 'top')}
                                    className="flex items-center gap-2 text-sm text-z-text-secondary hover:text-z-text transition-colors"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" />
                                    </svg>
                                    Sort by
                                </button>
                            </div>

                            {/* Comment Input */}
                            {isAuthenticated ? (
                                <form onSubmit={handleComment} className="flex gap-3 mb-6">
                                    <img
                                        src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=9147ff&color=fff`}
                                        alt="" className="avatar avatar-md shrink-0"
                                    />
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={commentText}
                                            onChange={(e) => { setCommentText(e.target.value); setShowCommentActions(true); }}
                                            onFocus={() => setShowCommentActions(true)}
                                            placeholder="Add a comment..."
                                            className="w-full bg-transparent border-b border-z-border focus:border-z-text
                        py-1.5 text-sm outline-none placeholder:text-z-text-muted transition-colors"
                                        />
                                        {showCommentActions && (
                                            <div className="flex items-center justify-between mt-2 animate-slide-up">
                                                <div className="flex items-center gap-2">
                                                    {/* Emoji placeholder */}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button type="button" onClick={() => { setShowCommentActions(false); setCommentText(''); }}
                                                        className="btn-ghost text-sm">Cancel</button>
                                                    <button type="submit" disabled={!commentText.trim()}
                                                        className="btn-primary text-sm py-1.5 px-4 disabled:opacity-40">Comment</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </form>
                            ) : (
                                <div className="text-center py-4 bg-z-surface rounded-xl mb-6">
                                    <p className="text-sm text-z-text-muted">
                                        <Link to="/auth" className="text-brand hover:text-brand-light font-medium">Sign in</Link> to comment
                                    </p>
                                </div>
                            )}

                            {/* Comment List */}
                            <div className="space-y-4">
                                {comments.map(comment => (
                                    <div key={comment._id} className="flex gap-3 group">
                                        <Link to={`/channel/${comment.user?._id}`}>
                                            <img
                                                src={comment.user?.avatar || `https://ui-avatars.com/api/?name=${comment.user?.name}&background=9147ff&color=fff`}
                                                alt="" className="avatar avatar-md shrink-0 mt-0.5"
                                            />
                                        </Link>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Link to={`/channel/${comment.user?._id}`}
                                                    className="text-[13px] font-semibold hover:text-z-text transition-colors">
                                                    @{comment.user?.name?.toLowerCase().replace(/\s+/g, '')}
                                                </Link>
                                                <span className="text-xs text-z-text-muted">{timeAgo(comment.createdAt)}</span>
                                            </div>
                                            <p className="text-sm text-z-text mt-0.5">{comment.text}</p>
                                            <div className="flex items-center gap-4 mt-1.5">
                                                <button className="flex items-center gap-1 text-z-text-muted hover:text-z-text transition-colors">
                                                    <HiOutlineThumbUp className="w-4 h-4" />
                                                    <span className="text-xs">{comment.likes?.length || ''}</span>
                                                </button>
                                                <button className="text-z-text-muted hover:text-z-text transition-colors">
                                                    <HiOutlineThumbDown className="w-4 h-4" />
                                                </button>
                                                <button className="text-xs font-semibold text-z-text-secondary hover:text-z-text transition-colors">
                                                    Reply
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* === Right Sidebar: Recommended === */}
                <div className={`${theaterMode ? 'max-w-[1200px] mx-auto px-6' : 'xl:w-[400px] shrink-0'}`}>
                    <div className={`${theaterMode ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}`}>
                        {recommended.map(rec => (
                            <VideoCard key={rec._id} video={rec} horizontal={!theaterMode} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Watch;
