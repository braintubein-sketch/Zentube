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
    HiThumbUp, HiThumbDown, HiOutlineChevronDown, HiOutlineBell
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
    const [commentSort, setCommentSort] = useState('top');

    useEffect(() => {
        if (id) {
            fetchVideo();
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

            if (isAuthenticated) {
                userAPI.addToWatchHistory(id).catch(() => { });
            }

            videoAPI.getRecommended(id).then(res => setRecommended(res.data.videos)).catch(() => { });
            commentAPI.getComments(id).then(res => setComments(res.data.comments)).catch(() => { });
        } catch {
            toast.error('Video not found');
            navigate('/');
        } finally {
            setLoading(false);
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
            <div className="p-4 md:p-6">
                <div className="animate-pulse">
                    <div className="aspect-video rounded-xl mb-4" style={{ backgroundColor: '#272727' }} />
                    <div className="h-6 rounded w-3/4 mb-3" style={{ backgroundColor: '#272727' }} />
                    <div className="h-4 rounded w-1/2" style={{ backgroundColor: '#272727' }} />
                </div>
            </div>
        );
    }

    if (!video) return null;
    const owner = video.owner || {};

    return (
        <div className={`${theaterMode ? '' : 'max-w-[1800px] mx-auto p-2 sm:p-4 md:p-6'}`}>
            <div className={`flex ${theaterMode ? 'flex-col' : 'flex-col xl:flex-row'} gap-4 sm:gap-6`}>

                {/* === Main Column === */}
                <div className={`${theaterMode ? 'w-full' : 'flex-1 min-w-0'}`}>

                    {/* Video Player */}
                    <div className={`relative bg-black group ${theaterMode ? 'w-full aspect-video max-h-[80vh]' : 'rounded-xl overflow-hidden aspect-video'}`}>
                        <video
                            ref={videoRef}
                            src={video.videoUrl}
                            controls
                            autoPlay
                            className="w-full h-full"
                            poster={video.thumbnail}
                        />
                        <button
                            onClick={() => setTheaterMode(!theaterMode)}
                            className="absolute top-3 right-3 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                            title={theaterMode ? 'Exit theater' : 'Theater mode'}
                        >
                            <HiOutlineArrowsExpand className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    {/* Video Info */}
                    <div className={`${theaterMode ? 'px-3 sm:px-6 max-w-[1200px] mx-auto' : ''} mt-3`}>
                        {/* Title */}
                        <h1 className="text-lg sm:text-xl font-bold leading-snug" style={{ color: '#f1f1f1' }}>{video.title}</h1>

                        {/* Actions Bar */}
                        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-3 mt-3">
                            {/* Channel info + Subscribe */}
                            <div className="flex items-center gap-3">
                                <Link to={`/channel/${owner._id}`}>
                                    <img
                                        src={owner.avatar || `https://ui-avatars.com/api/?name=${owner.name}&background=282828&color=aaa&size=80`}
                                        alt={owner.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                        style={{ backgroundColor: '#282828' }}
                                    />
                                </Link>
                                <div className="mr-2">
                                    <Link to={`/channel/${owner._id}`} className="font-semibold text-sm transition-colors" style={{ color: '#f1f1f1' }}>
                                        {owner.channelName || owner.name}
                                    </Link>
                                    <p className="text-xs" style={{ color: '#aaaaaa' }}>
                                        {formatViewsShort(owner.subscriberCount || 0)} subscribers
                                    </p>
                                </div>
                                {user?._id !== owner._id && (
                                    <button
                                        onClick={handleSubscribe}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                                        style={isSubscribed
                                            ? { backgroundColor: '#272727', color: '#f1f1f1', border: '1px solid #3f3f3f' }
                                            : { backgroundColor: '#f1f1f1', color: '#0f0f0f' }
                                        }
                                    >
                                        {isSubscribed ? (
                                            <>
                                                <HiOutlineBell className="w-4 h-4" />
                                                Subscribed
                                                <HiOutlineChevronDown className="w-3 h-3" />
                                            </>
                                        ) : 'Subscribe'}
                                    </button>
                                )}
                            </div>

                            {/* Action buttons — YouTube exact pill style */}
                            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                                {/* Like/Dislike pill */}
                                <div className="flex items-center rounded-full overflow-hidden" style={{ backgroundColor: '#272727' }}>
                                    <button
                                        onClick={handleLike}
                                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors"
                                        style={{ color: liked ? '#f1f1f1' : '#f1f1f1' }}
                                    >
                                        {liked ? <HiThumbUp className="w-5 h-5" /> : <HiOutlineThumbUp className="w-5 h-5" />}
                                        <span>{formatViewsShort(likeCount)}</span>
                                    </button>
                                    <div className="w-px h-6" style={{ backgroundColor: '#3f3f3f' }} />
                                    <button
                                        onClick={handleDislike}
                                        className="px-3 py-2 transition-colors"
                                        style={{ color: '#f1f1f1' }}
                                    >
                                        {disliked ? <HiThumbDown className="w-5 h-5" /> : <HiOutlineThumbDown className="w-5 h-5" />}
                                    </button>
                                </div>

                                {/* Share */}
                                <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                                    style={{ backgroundColor: '#272727', color: '#f1f1f1' }}>
                                    <HiOutlineShare className="w-5 h-5" />
                                    Share
                                </button>

                                {/* Download */}
                                <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                                    style={{ backgroundColor: '#272727', color: '#f1f1f1' }}>
                                    <HiOutlineDownload className="w-5 h-5" />
                                    Download
                                </button>

                                {/* Save */}
                                <button onClick={handleWatchLater} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                                    style={{ backgroundColor: '#272727', color: '#f1f1f1' }}>
                                    <HiOutlineBookmark className="w-5 h-5" />
                                    Save
                                </button>

                                {/* More */}
                                <button className="p-2 rounded-full transition-colors" style={{ backgroundColor: '#272727', color: '#f1f1f1' }}>
                                    <HiOutlineDotsHorizontal className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Description — YouTube collapsible box */}
                        <div className="mt-4 rounded-xl p-3 cursor-pointer transition-colors"
                            style={{ backgroundColor: '#272727' }}
                            onClick={() => setShowMore(!showMore)}>
                            <div className="flex items-center gap-2 text-sm font-medium mb-1" style={{ color: '#f1f1f1' }}>
                                <span>{formatViews(video.views)}</span>
                                <span>{timeAgo(video.createdAt)}</span>
                                {video.tags?.length > 0 && video.tags.slice(0, 3).map(tag => (
                                    <span key={tag} className="font-medium" style={{ color: '#3ea6ff' }}>#{tag}</span>
                                ))}
                            </div>
                            <p className={`text-sm whitespace-pre-wrap ${showMore ? '' : 'line-clamp-3'}`} style={{ color: '#f1f1f1' }}>
                                {video.description || 'No description available.'}
                            </p>
                            {!showMore && video.description?.length > 150 && (
                                <button className="text-sm font-medium mt-2" style={{ color: '#f1f1f1' }}>Show more</button>
                            )}
                            {showMore && (
                                <button className="text-sm font-medium mt-2" style={{ color: '#f1f1f1' }}>Show less</button>
                            )}
                        </div>

                        {/* Comments Section */}
                        <div className="mt-6 mb-8">
                            <div className="flex items-center gap-6 mb-6">
                                <h3 className="text-base font-bold" style={{ color: '#f1f1f1' }}>{comments.length} Comments</h3>
                                <button
                                    onClick={() => setCommentSort(commentSort === 'top' ? 'newest' : 'top')}
                                    className="flex items-center gap-2 text-sm transition-colors"
                                    style={{ color: '#f1f1f1' }}
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
                                        src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=282828&color=aaa`}
                                        alt="" className="w-10 h-10 rounded-full object-cover shrink-0" style={{ backgroundColor: '#282828' }}
                                    />
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={commentText}
                                            onChange={(e) => { setCommentText(e.target.value); setShowCommentActions(true); }}
                                            onFocus={() => setShowCommentActions(true)}
                                            placeholder="Add a comment..."
                                            className="w-full bg-transparent py-1.5 text-sm outline-none transition-colors"
                                            style={{ color: '#f1f1f1', borderBottom: `1px solid ${showCommentActions ? '#f1f1f1' : '#3f3f3f'}` }}
                                        />
                                        {showCommentActions && (
                                            <div className="flex items-center justify-end gap-2 mt-2 animate-slide-up">
                                                <button type="button" onClick={() => { setShowCommentActions(false); setCommentText(''); }}
                                                    className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors" style={{ color: '#f1f1f1' }}>
                                                    Cancel
                                                </button>
                                                <button type="submit" disabled={!commentText.trim()}
                                                    className="px-4 py-1.5 rounded-full text-sm font-medium transition-opacity disabled:opacity-30"
                                                    style={{ backgroundColor: commentText.trim() ? '#3ea6ff' : '#272727', color: commentText.trim() ? '#0f0f0f' : '#717171' }}>
                                                    Comment
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </form>
                            ) : (
                                <div className="text-center py-4 rounded-xl mb-6" style={{ backgroundColor: '#272727' }}>
                                    <p className="text-sm" style={{ color: '#aaaaaa' }}>
                                        <Link to="/auth" className="font-medium" style={{ color: '#3ea6ff' }}>Sign in</Link> to comment
                                    </p>
                                </div>
                            )}

                            {/* Comment List */}
                            <div className="space-y-5">
                                {comments.map(comment => (
                                    <div key={comment._id} className="flex gap-3 group">
                                        <Link to={`/channel/${comment.user?._id}`}>
                                            <img
                                                src={comment.user?.avatar || `https://ui-avatars.com/api/?name=${comment.user?.name}&background=282828&color=aaa`}
                                                alt="" className="w-10 h-10 rounded-full object-cover shrink-0"
                                                style={{ backgroundColor: '#282828' }}
                                            />
                                        </Link>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Link to={`/channel/${comment.user?._id}`}
                                                    className="text-[13px] font-semibold transition-colors" style={{ color: '#f1f1f1' }}>
                                                    @{comment.user?.name?.toLowerCase().replace(/\s+/g, '')}
                                                </Link>
                                                <span className="text-xs" style={{ color: '#aaaaaa' }}>{timeAgo(comment.createdAt)}</span>
                                            </div>
                                            <p className="text-sm mt-0.5" style={{ color: '#f1f1f1' }}>{comment.text}</p>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <button className="flex items-center gap-1 p-1 rounded-full transition-colors hover:bg-[#272727]">
                                                    <HiOutlineThumbUp className="w-4 h-4" style={{ color: '#f1f1f1' }} />
                                                    {comment.likes?.length > 0 && (
                                                        <span className="text-xs" style={{ color: '#aaaaaa' }}>{comment.likes.length}</span>
                                                    )}
                                                </button>
                                                <button className="p-1 rounded-full transition-colors hover:bg-[#272727]">
                                                    <HiOutlineThumbDown className="w-4 h-4" style={{ color: '#f1f1f1' }} />
                                                </button>
                                                <button className="text-xs font-semibold px-3 py-1.5 rounded-full transition-colors hover:bg-[#272727]"
                                                    style={{ color: '#f1f1f1' }}>
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
                <div className={`${theaterMode ? 'max-w-[1200px] mx-auto px-3 sm:px-6' : 'xl:w-[400px] shrink-0'}`}>
                    <div className={`${theaterMode ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-2'}`}>
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
