import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { userAPI, videoAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import VideoCard from '../components/VideoCard';
import VideoCardSkeleton from '../components/VideoCardSkeleton';
import { formatViewsShort, timeAgo } from '../components/VideoCard';
import { HiOutlineBell, HiOutlineFlag, HiOutlineShare, HiOutlineGlobe } from 'react-icons/hi';
import toast from 'react-hot-toast';

const TABS = ['Home', 'Videos', 'Shorts', 'Playlists', 'Community', 'About'];

const Channel = () => {
    const { id } = useParams();
    const { user, isAuthenticated } = useAuth();
    const [channel, setChannel] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Videos');
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        fetchChannel();
    }, [id]);

    const fetchChannel = async () => {
        try {
            setLoading(true);
            const { data } = await userAPI.getUserProfile(id);
            setChannel(data.user);

            const vData = await videoAPI.getVideos({ owner: id, limit: 24 });
            setVideos(vData.data.videos);
        } catch {
            toast.error('Channel not found');
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async () => {
        if (!isAuthenticated) return toast.error('Please sign in');
        try {
            const { data } = await userAPI.subscribe(id);
            setIsSubscribed(data.isSubscribed);
            toast.success(data.isSubscribed ? 'Subscribed!' : 'Unsubscribed');
        } catch { }
    };

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-40 md:h-52 bg-z-surface rounded-2xl mb-6" />
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-full skeleton" />
                    <div className="space-y-2">
                        <div className="h-6 skeleton rounded w-48" />
                        <div className="h-4 skeleton rounded w-32" />
                    </div>
                </div>
            </div>
        );
    }

    if (!channel) return null;
    const isOwner = user?._id === id;

    return (
        <div>
            {/* Banner */}
            <div className="relative h-40 md:h-52 rounded-2xl overflow-hidden mb-6 -mx-6 -mt-6 md:mx-0 md:mt-0">
                {channel.banner ? (
                    <img src={channel.banner} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-brand/30 via-accent-blue/20 to-premium-end/20" />
                )}
            </div>

            {/* Channel Info */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-5 mb-6">
                <img
                    src={channel.avatar || `https://ui-avatars.com/api/?name=${channel.name}&background=9147ff&color=fff&size=200`}
                    alt={channel.name}
                    className="avatar w-20 h-20 md:w-28 md:h-28"
                />
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl md:text-3xl font-bold mb-1">{channel.channelName || channel.name}</h1>
                    <div className="flex items-center gap-2 text-sm text-z-text-muted flex-wrap">
                        <span>@{channel.name?.toLowerCase().replace(/\s+/g, '')}</span>
                        <span>•</span>
                        <span>{formatViewsShort(channel.subscriberCount || 0)} subscribers</span>
                        <span>•</span>
                        <span>{videos.length} videos</span>
                    </div>
                    {channel.bio && (
                        <p className="text-sm text-z-text-secondary mt-2 line-clamp-1">{channel.bio}</p>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                        {!isOwner && (
                            <button
                                onClick={handleSubscribe}
                                className={isSubscribed ? 'btn-subscribed' : 'btn-subscribe'}
                            >
                                {isSubscribed ? (
                                    <span className="flex items-center gap-2">
                                        <HiOutlineBell className="w-4 h-4" /> Subscribed
                                    </span>
                                ) : 'Subscribe'}
                            </button>
                        )}
                        {isOwner && (
                            <Link to="/dashboard" className="btn-secondary">Customise channel</Link>
                        )}
                        <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
                            className="btn-icon">
                            <HiOutlineShare className="w-5 h-5" />
                        </button>
                        {!isOwner && (
                            <button className="btn-icon"><HiOutlineFlag className="w-5 h-5" /></button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-z-border mb-6 overflow-x-auto no-scrollbar">
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`tab whitespace-nowrap ${activeTab === tab ? 'tab-active' : ''}`}
                    >
                        {tab}
                        {activeTab === tab && <div className="tab-indicator" />}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {(activeTab === 'Home' || activeTab === 'Videos') && (
                videos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                        {videos
                            .filter(v => activeTab === 'Shorts' ? v.isShort : !v.isShort || activeTab !== 'Shorts')
                            .map(video => <VideoCard key={video._id} video={video} />)
                        }
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-z-text-muted">This channel hasn't uploaded any videos yet</p>
                    </div>
                )
            )}

            {activeTab === 'Shorts' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {videos.filter(v => v.isShort).length > 0 ? (
                        videos.filter(v => v.isShort).map(video => (
                            <Link key={video._id} to={`/watch/${video._id}`} className="group">
                                <div className="aspect-[9/16] rounded-xl overflow-hidden bg-z-surface relative">
                                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                        <p className="text-xs font-medium line-clamp-2">{video.title}</p>
                                        <p className="text-[10px] text-white/60">{formatViewsShort(video.views)} views</p>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-16">
                            <p className="text-z-text-muted">No Shorts from this channel</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'Community' && (
                <div className="max-w-2xl">
                    <div className="text-center py-16">
                        <HiOutlineGlobe className="w-12 h-12 text-z-text-muted mx-auto mb-3" />
                        <h3 className="font-semibold text-lg mb-1">Community posts</h3>
                        <p className="text-sm text-z-text-muted">This channel hasn't posted yet</p>
                    </div>
                </div>
            )}

            {activeTab === 'About' && (
                <div className="max-w-2xl space-y-6">
                    <div>
                        <h3 className="font-semibold mb-2">Description</h3>
                        <p className="text-sm text-z-text-secondary whitespace-pre-wrap">
                            {channel.bio || 'No description available.'}
                        </p>
                    </div>
                    <div className="divider" />
                    <div>
                        <h3 className="font-semibold mb-2">Stats</h3>
                        <div className="space-y-2 text-sm text-z-text-secondary">
                            <p>Joined {timeAgo(channel.createdAt)}</p>
                            <p>{formatViewsShort(channel.subscriberCount || 0)} subscribers</p>
                            <p>{videos.length} videos</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'Playlists' && (
                <div className="text-center py-16">
                    <p className="text-z-text-muted">No playlists from this channel</p>
                </div>
            )}
        </div>
    );
};

export default Channel;
