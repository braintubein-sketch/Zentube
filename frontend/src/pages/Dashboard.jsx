import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { videoAPI, authAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { formatViews, formatViewsShort, timeAgo } from '../components/VideoCard';
import toast from 'react-hot-toast';
import {
    HiOutlineChartBar, HiOutlineEye, HiOutlineThumbUp, HiOutlineUserGroup,
    HiOutlineVideoCamera, HiOutlinePencil, HiOutlineTrash, HiOutlineGlobe,
    HiOutlineLockClosed, HiOutlineTrendingUp, HiOutlineClock, HiOutlinePlay,
    HiOutlineUpload, HiOutlineChat, HiOutlinePhotograph, HiOutlineSearch
} from 'react-icons/hi';

const Dashboard = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('content');
    const [searchQuery, setSearchQuery] = useState('');
    const [channelForm, setChannelForm] = useState({
        channelName: '',
        bio: '',
    });
    const [savingChannel, setSavingChannel] = useState(false);
    const [stats, setStats] = useState({
        totalViews: 0,
        totalSubscribers: 0,
        totalLikes: 0,
        totalVideos: 0,
        totalComments: 0,
        estimatedRevenue: 0,
    });

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        if (user) {
            setChannelForm({
                channelName: user.channelName || user.name || '',
                bio: user.bio || '',
            });
        }
    }, [user]);

    const fetchData = async () => {
        try {
            const { data } = await videoAPI.getVideos({ owner: user?._id, limit: 100 });
            setVideos(data.videos);
            const totalViews = data.videos.reduce((sum, v) => sum + (v.views || 0), 0);
            const totalLikes = data.videos.reduce((sum, v) => sum + (v.likes?.length || 0), 0);
            const totalComments = data.videos.reduce((sum, v) => sum + (v.commentCount || 0), 0);
            setStats({
                totalVideos: data.total || data.videos.length,
                totalViews,
                totalLikes,
                totalSubscribers: user?.subscriberCount || 0,
                totalComments,
                estimatedRevenue: (totalViews * 0.003).toFixed(2), // Estimated CPM
            });
        } catch { } finally { setLoading(false); }
    };

    const handleDelete = async (videoId) => {
        if (!window.confirm('Delete this video permanently? This action cannot be undone.')) return;
        try {
            await videoAPI.deleteVideo(videoId);
            setVideos(prev => prev.filter(v => v._id !== videoId));
            toast.success('Video deleted');
        } catch { toast.error('Failed to delete'); }
    };

    const handleSaveChannel = async () => {
        try {
            setSavingChannel(true);
            const formData = new FormData();
            formData.append('channelName', channelForm.channelName);
            formData.append('bio', channelForm.bio);
            const avatarInput = document.getElementById('dash-avatar');
            if (avatarInput?.files[0]) formData.append('avatar', avatarInput.files[0]);
            const bannerInput = document.getElementById('dash-banner');
            if (bannerInput?.files[0]) formData.append('banner', bannerInput.files[0]);
            const { data } = await authAPI.updateProfile(formData);
            updateUser(data.user);
            toast.success('Channel updated!');
        } catch {
            toast.error('Failed to save');
        } finally {
            setSavingChannel(false);
        }
    };

    const filteredVideos = videos.filter(v =>
        !searchQuery || v.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const statCards = [
        { label: 'Total Views', value: formatViewsShort(stats.totalViews), icon: HiOutlineEye, change: '+12%' },
        { label: 'Subscribers', value: formatViewsShort(stats.totalSubscribers), icon: HiOutlineUserGroup, change: '+5%' },
        { label: 'Total Likes', value: formatViewsShort(stats.totalLikes), icon: HiOutlineThumbUp, change: '+8%' },
        { label: 'Videos', value: stats.totalVideos, icon: HiOutlineVideoCamera, change: '' },
    ];

    const tabs = [
        { id: 'content', label: 'Content', icon: HiOutlineVideoCamera },
        { id: 'analytics', label: 'Analytics', icon: HiOutlineChartBar },
        { id: 'comments', label: 'Comments', icon: HiOutlineChat },
        { id: 'customization', label: 'Customization', icon: HiOutlinePhotograph },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-[3px] border-transparent border-t-[#ff0000] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#f1f1f1' }}>Channel dashboard</h1>
                    <p className="text-sm mt-0.5" style={{ color: '#aaaaaa' }}>
                        {user?.channelName || user?.name} • Welcome back
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link to={`/channel/${user?._id}`} className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                        style={{ backgroundColor: '#272727', color: '#f1f1f1', border: '1px solid #3f3f3f' }}>
                        View channel
                    </Link>
                    <Link to="/upload" className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-opacity"
                        style={{ backgroundColor: '#ff0000', color: '#fff' }}>
                        <HiOutlineUpload className="w-4 h-4" /> Upload
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {statCards.map(stat => (
                    <div key={stat.label} className="rounded-xl p-4 transition-colors"
                        style={{ backgroundColor: '#212121', border: '1px solid #3f3f3f' }}>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#717171' }}>{stat.label}</span>
                            <stat.icon className="w-4 h-4" style={{ color: '#aaaaaa' }} />
                        </div>
                        <p className="text-2xl font-bold" style={{ color: '#f1f1f1' }}>{stat.value}</p>
                        {stat.change && (
                            <p className="text-xs flex items-center gap-1 mt-1" style={{ color: '#2ba640' }}>
                                <HiOutlineTrendingUp className="w-3 h-3" /> {stat.change} vs last 28 days
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 overflow-x-auto no-scrollbar" style={{ borderBottom: '1px solid #3f3f3f' }}>
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className="relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors"
                        style={{ color: activeTab === tab.id ? '#f1f1f1' : '#aaaaaa' }}>
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ backgroundColor: '#f1f1f1' }} />
                        )}
                    </button>
                ))}
            </div>

            {/* Content Tab */}
            {activeTab === 'content' && (
                <div>
                    {/* Search & filter bar */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="relative flex-1 max-w-md">
                            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#717171' }} />
                            <input
                                type="text"
                                placeholder="Search your videos"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg text-sm outline-none transition-all"
                                style={{ backgroundColor: '#121212', color: '#f1f1f1', border: '1px solid #303030' }}
                                onFocus={(e) => e.target.style.borderColor = '#1c62b9'}
                                onBlur={(e) => e.target.style.borderColor = '#303030'}
                            />
                        </div>
                        <span className="text-xs" style={{ color: '#717171' }}>
                            {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {filteredVideos.length > 0 ? (
                        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#212121', border: '1px solid #3f3f3f' }}>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left" style={{ borderBottom: '1px solid #3f3f3f' }}>
                                        <th className="px-4 py-3 font-medium" style={{ color: '#717171' }}>Video</th>
                                        <th className="px-4 py-3 font-medium hidden md:table-cell" style={{ color: '#717171' }}>Visibility</th>
                                        <th className="px-4 py-3 font-medium hidden sm:table-cell" style={{ color: '#717171' }}>Date</th>
                                        <th className="px-4 py-3 font-medium text-right" style={{ color: '#717171' }}>Views</th>
                                        <th className="px-4 py-3 font-medium text-right hidden md:table-cell" style={{ color: '#717171' }}>Comments</th>
                                        <th className="px-4 py-3 font-medium text-right hidden lg:table-cell" style={{ color: '#717171' }}>Likes</th>
                                        <th className="px-4 py-3 font-medium text-center" style={{ color: '#717171' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredVideos.map(video => (
                                        <tr key={video._id} className="transition-colors hover:bg-[#272727]" style={{ borderBottom: '1px solid rgba(63,63,63,0.5)' }}>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <Link to={`/watch/${video._id}`} className="relative w-28 aspect-video rounded-lg overflow-hidden shrink-0" style={{ backgroundColor: '#272727' }}>
                                                        <img src={video.thumbnail || `https://placehold.co/240x135/272727/717171?text=Z`}
                                                            alt="" className="w-full h-full object-cover" />
                                                        {video.duration && (
                                                            <span className="absolute bottom-0.5 right-0.5 px-1 py-px text-[10px] rounded"
                                                                style={{ backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff' }}>
                                                                {Math.floor(video.duration / 60)}:{String(Math.floor(video.duration % 60)).padStart(2, '0')}
                                                            </span>
                                                        )}
                                                    </Link>
                                                    <div className="min-w-0">
                                                        <Link to={`/watch/${video._id}`} className="font-medium text-sm line-clamp-2 transition-colors" style={{ color: '#f1f1f1' }}>
                                                            {video.title}
                                                        </Link>
                                                        <p className="text-xs line-clamp-1 mt-0.5" style={{ color: '#717171' }}>{video.description}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell">
                                                <div className="flex items-center gap-1 text-xs" style={{ color: '#aaaaaa' }}>
                                                    {video.isPublished !== false ? (
                                                        <><HiOutlineGlobe className="w-3.5 h-3.5" /> Public</>
                                                    ) : (
                                                        <><HiOutlineLockClosed className="w-3.5 h-3.5" /> Private</>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 hidden sm:table-cell">
                                                <span className="text-xs" style={{ color: '#aaaaaa' }}>{timeAgo(video.createdAt)}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="font-medium text-sm" style={{ color: '#f1f1f1' }}>{formatViewsShort(video.views)}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right hidden md:table-cell">
                                                <span className="text-sm" style={{ color: '#aaaaaa' }}>{video.commentCount || 0}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right hidden lg:table-cell">
                                                <span className="text-sm" style={{ color: '#aaaaaa' }}>{video.likes?.length || 0}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button onClick={() => navigate(`/edit/${video._id}`)} className="p-2 rounded-full transition-colors hover:bg-[#3f3f3f]" title="Edit">
                                                        <HiOutlinePencil className="w-4 h-4" style={{ color: '#aaaaaa' }} />
                                                    </button>
                                                    <button onClick={() => handleDelete(video._id)} className="p-2 rounded-full transition-colors hover:bg-[#3f3f3f]" title="Delete">
                                                        <HiOutlineTrash className="w-4 h-4" style={{ color: '#ff4e45' }} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <HiOutlineVideoCamera className="w-16 h-16 mx-auto mb-4" style={{ color: '#717171' }} />
                            <h3 className="text-lg font-semibold mb-1" style={{ color: '#f1f1f1' }}>
                                {searchQuery ? 'No videos found' : 'No videos yet'}
                            </h3>
                            <p className="text-sm mb-4" style={{ color: '#717171' }}>
                                {searchQuery ? 'Try a different search term' : 'Upload your first video to get started'}
                            </p>
                            {!searchQuery && (
                                <Link to="/upload" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold"
                                    style={{ backgroundColor: '#ff0000', color: '#fff' }}>
                                    <HiOutlineUpload className="w-4 h-4" /> Upload video
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Channel Analytics Summary */}
                    <div className="rounded-xl p-6" style={{ backgroundColor: '#212121', border: '1px solid #3f3f3f' }}>
                        <h3 className="font-semibold mb-4" style={{ color: '#f1f1f1' }}>Channel analytics</h3>
                        <div className="space-y-0">
                            {[
                                { label: 'Current subscribers', value: formatViewsShort(stats.totalSubscribers) },
                                { label: 'Total views', value: formatViewsShort(stats.totalViews) },
                                { label: 'Total likes', value: formatViewsShort(stats.totalLikes) },
                                { label: 'Estimated revenue', value: `$${stats.estimatedRevenue}` },
                            ].map((item, i) => (
                                <div key={item.label} className="flex items-center justify-between py-3"
                                    style={{ borderBottom: i < 3 ? '1px solid rgba(63,63,63,0.5)' : 'none' }}>
                                    <span className="text-sm" style={{ color: '#aaaaaa' }}>{item.label}</span>
                                    <span className="font-bold text-lg" style={{ color: '#f1f1f1' }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Performing Videos */}
                    <div className="rounded-xl p-6" style={{ backgroundColor: '#212121', border: '1px solid #3f3f3f' }}>
                        <h3 className="font-semibold mb-4" style={{ color: '#f1f1f1' }}>Top performing videos</h3>
                        <div className="space-y-3">
                            {videos.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5).map((video, i) => (
                                <Link key={video._id} to={`/watch/${video._id}`} className="flex items-center gap-3 group">
                                    <span className="text-xs font-bold w-5 text-center" style={{ color: '#717171' }}>{i + 1}</span>
                                    <div className="w-16 aspect-video rounded overflow-hidden shrink-0" style={{ backgroundColor: '#272727' }}>
                                        <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate group-hover:text-[#3ea6ff] transition-colors" style={{ color: '#f1f1f1' }}>{video.title}</p>
                                        <p className="text-xs" style={{ color: '#717171' }}>{formatViews(video.views)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs" style={{ color: '#717171' }}>{video.likes?.length || 0} likes</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Views over time chart placeholder */}
                    <div className="rounded-xl p-6 lg:col-span-2" style={{ backgroundColor: '#212121', border: '1px solid #3f3f3f' }}>
                        <h3 className="font-semibold mb-4" style={{ color: '#f1f1f1' }}>Views over time</h3>
                        <div className="h-48 flex items-end gap-1">
                            {Array.from({ length: 28 }, (_, i) => {
                                const height = Math.random() * 100 + 10;
                                return (
                                    <div key={i} className="flex-1 rounded-t transition-all hover:opacity-80 cursor-pointer"
                                        style={{ height: `${height}%`, backgroundColor: i === 27 ? '#ff0000' : '#3ea6ff', opacity: 0.7 }}
                                        title={`Day ${i + 1}`}
                                    />
                                );
                            })}
                        </div>
                        <div className="flex justify-between mt-2 text-xs" style={{ color: '#717171' }}>
                            <span>28 days ago</span>
                            <span>Today</span>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="rounded-xl p-6 lg:col-span-2" style={{ backgroundColor: '#212121', border: '1px solid #3f3f3f' }}>
                        <h3 className="font-semibold mb-4" style={{ color: '#f1f1f1' }}>Recent activity</h3>
                        <div className="space-y-3">
                            {videos.slice(0, 5).map(video => (
                                <div key={video._id} className="flex items-center gap-3 py-2">
                                    <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(255,0,0,0.1)' }}>
                                        <HiOutlinePlay className="w-4 h-4" style={{ color: '#ff0000' }} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm" style={{ color: '#f1f1f1' }}>
                                            You uploaded <span className="font-medium">{video.title}</span>
                                        </p>
                                        <p className="text-xs" style={{ color: '#717171' }}>{timeAgo(video.createdAt)}</p>
                                    </div>
                                    <span className="text-xs" style={{ color: '#aaaaaa' }}>{formatViewsShort(video.views)} views</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Comments Tab */}
            {activeTab === 'comments' && (
                <div className="rounded-xl p-6" style={{ backgroundColor: '#212121', border: '1px solid #3f3f3f' }}>
                    <h3 className="font-semibold mb-4" style={{ color: '#f1f1f1' }}>Latest comments</h3>
                    <div className="text-center py-12">
                        <HiOutlineChat className="w-16 h-16 mx-auto mb-4" style={{ color: '#717171' }} />
                        <h3 className="text-lg font-semibold mb-1" style={{ color: '#f1f1f1' }}>No new comments</h3>
                        <p className="text-sm" style={{ color: '#717171' }}>Comments on your videos will appear here</p>
                    </div>
                </div>
            )}

            {/* Customization Tab */}
            {activeTab === 'customization' && (
                <div className="max-w-2xl space-y-6">
                    {/* Channel Branding */}
                    <div className="rounded-xl p-6" style={{ backgroundColor: '#212121', border: '1px solid #3f3f3f' }}>
                        <h3 className="font-semibold mb-6" style={{ color: '#f1f1f1' }}>Channel branding</h3>
                        <div className="space-y-6">
                            {/* Profile Picture */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#aaaaaa' }}>Profile picture</label>
                                <div className="flex items-center gap-4">
                                    <img
                                        src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=282828&color=aaa&size=128`}
                                        alt="" className="w-20 h-20 rounded-full object-cover" style={{ backgroundColor: '#272727' }}
                                    />
                                    <div>
                                        <label htmlFor="dash-avatar" className="px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-colors"
                                            style={{ backgroundColor: '#272727', color: '#3ea6ff', border: '1px solid #3f3f3f' }}>
                                            Change
                                        </label>
                                        <input type="file" id="dash-avatar" accept="image/*" className="hidden" />
                                        <p className="text-xs mt-2" style={{ color: '#717171' }}>JPG, GIF or PNG. Max 4MB.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Banner */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#aaaaaa' }}>Banner image</label>
                                <div className="relative rounded-xl overflow-hidden h-32" style={{ backgroundColor: '#272727', border: '1px dashed #3f3f3f' }}>
                                    {user?.banner ? (
                                        <img src={user.banner} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full gap-2">
                                            <HiOutlinePhotograph className="w-8 h-8" style={{ color: '#717171' }} />
                                            <span className="text-xs" style={{ color: '#717171' }}>Upload a banner (2048 × 1152)</span>
                                        </div>
                                    )}
                                    <label htmlFor="dash-banner" className="absolute inset-0 cursor-pointer" />
                                    <input type="file" id="dash-banner" accept="image/*" className="hidden" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Channel Details */}
                    <div className="rounded-xl p-6" style={{ backgroundColor: '#212121', border: '1px solid #3f3f3f' }}>
                        <h3 className="font-semibold mb-6" style={{ color: '#f1f1f1' }}>Basic info</h3>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: '#aaaaaa' }}>Channel name</label>
                                <input
                                    type="text"
                                    value={channelForm.channelName}
                                    onChange={(e) => setChannelForm({ ...channelForm, channelName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                                    style={{ backgroundColor: '#121212', color: '#f1f1f1', border: '1px solid #303030' }}
                                    onFocus={(e) => e.target.style.borderColor = '#1c62b9'}
                                    onBlur={(e) => e.target.style.borderColor = '#303030'}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: '#aaaaaa' }}>Description</label>
                                <textarea
                                    value={channelForm.bio}
                                    onChange={(e) => setChannelForm({ ...channelForm, bio: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all h-28 resize-none"
                                    style={{ backgroundColor: '#121212', color: '#f1f1f1', border: '1px solid #303030' }}
                                    onFocus={(e) => e.target.style.borderColor = '#1c62b9'}
                                    onBlur={(e) => e.target.style.borderColor = '#303030'}
                                    placeholder="Tell viewers about your channel"
                                />
                                <p className="text-xs mt-1" style={{ color: '#717171' }}>{channelForm.bio.length}/1000</p>
                            </div>
                            <button
                                onClick={handleSaveChannel}
                                disabled={savingChannel}
                                className="px-6 py-2.5 rounded-full text-sm font-semibold transition-opacity disabled:opacity-50"
                                style={{ backgroundColor: '#3ea6ff', color: '#0f0f0f' }}
                            >
                                {savingChannel ? 'Saving...' : 'Publish'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
