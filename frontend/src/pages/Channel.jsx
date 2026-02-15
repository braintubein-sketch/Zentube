import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { userAPI, videoAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import VideoCard from '../components/VideoCard';
import VideoCardSkeleton from '../components/VideoCardSkeleton';
import { formatViewsShort, timeAgo } from '../components/VideoCard';
import { HiOutlineBell, HiOutlineFlag, HiOutlineShare, HiOutlineGlobe, HiOutlineCheck, HiOutlineChevronDown } from 'react-icons/hi';
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
    const [videoSort, setVideoSort] = useState('latest');

    useEffect(() => {
        fetchChannel();
    }, [id]);

    const fetchChannel = async () => {
        try {
            setLoading(true);
            const { data } = await userAPI.getUserProfile(id);
            setChannel(data.user);

            const vData = await videoAPI.getVideos({ owner: id, limit: 30 });
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

    const sortedVideos = [...videos].sort((a, b) => {
        if (videoSort === 'popular') return (b.views || 0) - (a.views || 0);
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-40 md:h-52 rounded-none md:rounded-2xl mb-6" style={{ backgroundColor: '#272727' }} />
                <div className="flex items-center gap-5 mb-6 px-4 md:px-0">
                    <div className="w-20 h-20 md:w-28 md:h-28 rounded-full" style={{ backgroundColor: '#3f3f3f' }} />
                    <div className="space-y-2">
                        <div className="h-6 rounded w-48" style={{ backgroundColor: '#3f3f3f' }} />
                        <div className="h-4 rounded w-32" style={{ backgroundColor: '#3f3f3f' }} />
                    </div>
                </div>
            </div>
        );
    }

    if (!channel) return null;
    const isOwner = user?._id === id;

    return (
        <div>
            {/* Banner — full-width YouTube style */}
            <div className="relative h-[100px] sm:h-[150px] md:h-[200px] lg:h-[230px] overflow-hidden -mx-4 md:-mx-6 -mt-4 md:-mt-6 mb-4">
                {channel.banner ? (
                    <img src={channel.banner} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full" style={{ backgroundColor: '#272727' }} />
                )}
            </div>

            {/* Channel Info — YouTube exact layout */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 mb-3 px-2 md:px-0">
                <img
                    src={channel.avatar || `https://ui-avatars.com/api/?name=${channel.name}&background=282828&color=aaa&size=200`}
                    alt={channel.name}
                    className="w-[72px] h-[72px] md:w-[128px] md:h-[128px] rounded-full object-cover"
                    style={{ backgroundColor: '#282828' }}
                />
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#f1f1f1' }}>
                        {channel.channelName || channel.name}
                    </h1>
                    <div className="flex items-center gap-1.5 text-sm flex-wrap mt-1" style={{ color: '#aaaaaa' }}>
                        <span>@{channel.name?.toLowerCase().replace(/\s+/g, '')}</span>
                        <span>•</span>
                        <span>{formatViewsShort(channel.subscriberCount || 0)} subscribers</span>
                        <span>•</span>
                        <span>{videos.length} videos</span>
                    </div>
                    {channel.bio && (
                        <p className="text-sm mt-1.5 line-clamp-1" style={{ color: '#aaaaaa' }}>
                            {channel.bio} <span className="font-medium cursor-pointer" style={{ color: '#f1f1f1' }}>...more</span>
                        </p>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 mt-3">
                        {!isOwner && (
                            <button
                                onClick={handleSubscribe}
                                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors"
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
                        {isOwner && (
                            <Link to="/dashboard" className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                                style={{ backgroundColor: '#272727', color: '#f1f1f1', border: '1px solid #3f3f3f' }}>
                                Customise channel
                            </Link>
                        )}
                        <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
                            className="p-2 rounded-full transition-colors hover:bg-[#272727]">
                            <HiOutlineShare className="w-5 h-5" style={{ color: '#f1f1f1' }} />
                        </button>
                        {!isOwner && (
                            <button className="p-2 rounded-full transition-colors hover:bg-[#272727]">
                                <HiOutlineFlag className="w-5 h-5" style={{ color: '#f1f1f1' }} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs — YouTube exact style */}
            <div className="flex gap-0 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0" style={{ borderBottom: '1px solid #3f3f3f' }}>
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className="relative px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors"
                        style={{ color: activeTab === tab ? '#f1f1f1' : '#aaaaaa' }}
                    >
                        {tab}
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ backgroundColor: '#f1f1f1' }} />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {(activeTab === 'Home' || activeTab === 'Videos') && (
                    <>
                        {/* Sort controls */}
                        {activeTab === 'Videos' && videos.length > 0 && (
                            <div className="flex items-center gap-2 mb-4">
                                {['latest', 'popular'].map(sort => (
                                    <button
                                        key={sort}
                                        onClick={() => setVideoSort(sort)}
                                        className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize"
                                        style={videoSort === sort
                                            ? { backgroundColor: '#f1f1f1', color: '#0f0f0f' }
                                            : { backgroundColor: '#272727', color: '#f1f1f1' }
                                        }
                                    >
                                        {sort}
                                    </button>
                                ))}
                            </div>
                        )}

                        {sortedVideos.filter(v => !v.isShort || activeTab !== 'Videos').length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6">
                                {sortedVideos
                                    .filter(v => activeTab === 'Videos' ? !v.isShort : true)
                                    .map(video => <VideoCard key={video._id} video={video} />)
                                }
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <p style={{ color: '#717171' }}>This channel hasn't uploaded any videos yet</p>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'Shorts' && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                        {videos.filter(v => v.isShort).length > 0 ? (
                            videos.filter(v => v.isShort).map(video => (
                                <Link key={video._id} to={`/watch/${video._id}`} className="group">
                                    <div className="aspect-[9/16] rounded-xl overflow-hidden relative" style={{ backgroundColor: '#272727' }}>
                                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        <div className="absolute bottom-0 left-0 right-0 p-2" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                                            <p className="text-xs font-medium line-clamp-2" style={{ color: '#fff' }}>{video.title}</p>
                                            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{formatViewsShort(video.views)} views</p>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-16">
                                <p style={{ color: '#717171' }}>No Shorts from this channel</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'Community' && (
                    <div className="max-w-2xl">
                        <div className="text-center py-16">
                            <HiOutlineGlobe className="w-12 h-12 mx-auto mb-3" style={{ color: '#717171' }} />
                            <h3 className="font-semibold text-lg mb-1" style={{ color: '#f1f1f1' }}>Community posts</h3>
                            <p className="text-sm" style={{ color: '#717171' }}>This channel hasn't posted yet</p>
                        </div>
                    </div>
                )}

                {activeTab === 'About' && (
                    <div className="max-w-2xl space-y-6">
                        <div>
                            <h3 className="font-semibold mb-2" style={{ color: '#f1f1f1' }}>Description</h3>
                            <p className="text-sm whitespace-pre-wrap" style={{ color: '#aaaaaa' }}>
                                {channel.bio || 'No description available.'}
                            </p>
                        </div>
                        <div style={{ borderTop: '1px solid #3f3f3f', paddingTop: '1.5rem' }}>
                            <h3 className="font-semibold mb-3" style={{ color: '#f1f1f1' }}>Stats</h3>
                            <div className="space-y-2 text-sm" style={{ color: '#aaaaaa' }}>
                                <p>Joined {timeAgo(channel.createdAt)}</p>
                                <p>{formatViewsShort(channel.subscriberCount || 0)} subscribers</p>
                                <p>{videos.length} videos</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Playlists' && (
                    <div className="text-center py-16">
                        <p style={{ color: '#717171' }}>No playlists from this channel</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Channel;
