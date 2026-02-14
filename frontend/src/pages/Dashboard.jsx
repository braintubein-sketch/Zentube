import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { videoAPI, authAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { formatViews, formatViewsShort, timeAgo } from '../components/VideoCard';
import toast from 'react-hot-toast';
import {
    HiOutlineChartBar, HiOutlineEye, HiOutlineThumbUp, HiOutlineUserGroup,
    HiOutlineVideoCamera, HiOutlinePencil, HiOutlineTrash, HiOutlineGlobe,
    HiOutlineLockClosed, HiOutlineTrendingUp, HiOutlineClock, HiOutlinePlay
} from 'react-icons/hi';

const Dashboard = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('content');
    const [stats, setStats] = useState({
        totalViews: 0,
        totalSubscribers: 0,
        totalLikes: 0,
        totalVideos: 0,
    });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const { data } = await videoAPI.getVideos({ owner: user?._id, limit: 50 });
            setVideos(data.videos);
            setStats({
                totalVideos: data.total || data.videos.length,
                totalViews: data.videos.reduce((sum, v) => sum + (v.views || 0), 0),
                totalLikes: data.videos.reduce((sum, v) => sum + (v.likes?.length || 0), 0),
                totalSubscribers: user?.subscriberCount || 0,
            });
        } catch { } finally { setLoading(false); }
    };

    const handleDelete = async (videoId) => {
        if (!window.confirm('Delete this video permanently?')) return;
        try {
            await videoAPI.deleteVideo(videoId);
            setVideos(prev => prev.filter(v => v._id !== videoId));
            toast.success('Video deleted');
        } catch { toast.error('Failed to delete'); }
    };

    const statCards = [
        {
            label: 'Total Views', value: formatViewsShort(stats.totalViews), icon: HiOutlineEye,
            color: 'text-accent-blue', bg: 'bg-accent-blue/10'
        },
        {
            label: 'Subscribers', value: formatViewsShort(stats.totalSubscribers), icon: HiOutlineUserGroup,
            color: 'text-brand', bg: 'bg-brand/10'
        },
        {
            label: 'Total Likes', value: formatViewsShort(stats.totalLikes), icon: HiOutlineThumbUp,
            color: 'text-accent-emerald', bg: 'bg-accent-emerald/10'
        },
        {
            label: 'Videos', value: stats.totalVideos, icon: HiOutlineVideoCamera,
            color: 'text-accent-gold', bg: 'bg-accent-gold/10'
        },
    ];

    const tabs = [
        { id: 'content', label: 'Content' },
        { id: 'analytics', label: 'Analytics' },
        { id: 'customization', label: 'Customization' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Channel dashboard</h1>
                    <p className="text-sm text-z-text-muted mt-0.5">{user?.channelName || user?.name}</p>
                </div>
                <Link to="/upload" className="btn-primary flex items-center gap-2">
                    <HiOutlineVideoCamera className="w-5 h-5" /> Upload
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map(stat => (
                    <div key={stat.label} className="card-elevated p-4 hover:border-z-border-light transition-colors">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-z-text-muted uppercase tracking-wider">{stat.label}</span>
                            <div className={`p-2 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs text-accent-emerald flex items-center gap-1 mt-1">
                            <HiOutlineTrendingUp className="w-3 h-3" /> vs last 28 days
                        </p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-z-border mb-6">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`tab ${activeTab === tab.id ? 'tab-active' : ''}`}>
                        {tab.label}
                        {activeTab === tab.id && <div className="tab-indicator" />}
                    </button>
                ))}
            </div>

            {/* Content Tab */}
            {activeTab === 'content' && (
                <div>
                    {videos.length > 0 ? (
                        <div className="card-elevated overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-z-border text-left text-z-text-muted">
                                        <th className="px-4 py-3 font-medium">Video</th>
                                        <th className="px-4 py-3 font-medium hidden md:table-cell">Visibility</th>
                                        <th className="px-4 py-3 font-medium hidden sm:table-cell">Date</th>
                                        <th className="px-4 py-3 font-medium text-right">Views</th>
                                        <th className="px-4 py-3 font-medium text-right hidden md:table-cell">Likes</th>
                                        <th className="px-4 py-3 font-medium text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-z-border/50">
                                    {videos.map(video => (
                                        <tr key={video._id} className="hover:bg-z-surface transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <Link to={`/watch/${video._id}`} className="relative w-24 aspect-video rounded-lg overflow-hidden shrink-0 bg-z-surface">
                                                        <img src={video.thumbnail || `https://placehold.co/240x135/1a1a1a/9147ff?text=Z`}
                                                            alt="" className="w-full h-full object-cover" />
                                                        {video.duration && (
                                                            <span className="absolute bottom-0.5 right-0.5 px-1 py-px text-[10px] bg-black/80 rounded text-white">
                                                                {Math.floor(video.duration / 60)}:{String(Math.floor(video.duration % 60)).padStart(2, '0')}
                                                            </span>
                                                        )}
                                                    </Link>
                                                    <div className="min-w-0">
                                                        <Link to={`/watch/${video._id}`} className="font-medium text-sm line-clamp-2 hover:text-brand transition-colors">
                                                            {video.title}
                                                        </Link>
                                                        <p className="text-xs text-z-text-muted line-clamp-1 mt-0.5">{video.description}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell">
                                                <div className="flex items-center gap-1 text-xs text-z-text-muted">
                                                    {video.isPublished !== false ? (
                                                        <><HiOutlineGlobe className="w-3.5 h-3.5" /> Public</>
                                                    ) : (
                                                        <><HiOutlineLockClosed className="w-3.5 h-3.5" /> Private</>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 hidden sm:table-cell">
                                                <span className="text-xs text-z-text-muted">{timeAgo(video.createdAt)}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="font-medium">{formatViewsShort(video.views)}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right hidden md:table-cell">
                                                <span className="text-z-text-muted">{video.likes?.length || 0}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button onClick={() => navigate(`/edit/${video._id}`)} className="btn-icon-sm" title="Edit">
                                                        <HiOutlinePencil className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(video._id)} className="btn-icon-sm text-accent-rose" title="Delete">
                                                        <HiOutlineTrash className="w-4 h-4" />
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
                            <HiOutlineVideoCamera className="w-16 h-16 text-z-text-muted mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-1">No videos yet</h3>
                            <p className="text-sm text-z-text-muted mb-4">Upload your first video to get started</p>
                            <Link to="/upload" className="btn-primary">Upload video</Link>
                        </div>
                    )}
                </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="card-elevated p-6">
                        <h3 className="font-semibold mb-4">Channel analytics</h3>
                        <div className="flex items-center justify-between py-3 border-b border-z-border/50">
                            <span className="text-sm text-z-text-secondary">Current subscribers</span>
                            <span className="font-bold text-lg">{formatViewsShort(stats.totalSubscribers)}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-z-border/50">
                            <span className="text-sm text-z-text-secondary">Total views</span>
                            <span className="font-bold text-lg">{formatViewsShort(stats.totalViews)}</span>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <span className="text-sm text-z-text-secondary">Total watch time</span>
                            <span className="font-bold text-lg">-</span>
                        </div>
                    </div>

                    <div className="card-elevated p-6">
                        <h3 className="font-semibold mb-4">Top videos</h3>
                        <div className="space-y-3">
                            {videos.slice(0, 5).map((video, i) => (
                                <div key={video._id} className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-z-text-muted w-5 text-center">{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{video.title}</p>
                                        <p className="text-xs text-z-text-muted">{formatViews(video.views)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-z-text-muted">{video.likes?.length || 0} likes</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card-elevated p-6 lg:col-span-2">
                        <h3 className="font-semibold mb-4">Recent activity</h3>
                        <div className="space-y-3">
                            {videos.slice(0, 3).map(video => (
                                <div key={video._id} className="flex items-center gap-3 py-2">
                                    <div className="p-2 rounded-lg bg-brand/10"><HiOutlinePlay className="w-4 h-4 text-brand" /></div>
                                    <div>
                                        <p className="text-sm">You uploaded <span className="font-medium">{video.title}</span></p>
                                        <p className="text-xs text-z-text-muted">{timeAgo(video.createdAt)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Customization Tab */}
            {activeTab === 'customization' && (
                <div className="card-elevated p-6 max-w-2xl">
                    <h3 className="font-semibold mb-6">Channel customization</h3>
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-z-text-secondary mb-1.5">Channel name</label>
                            <input type="text" defaultValue={user?.channelName || user?.name} className="input-field" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-z-text-secondary mb-1.5">Channel description</label>
                            <textarea defaultValue={user?.bio || ''} className="input-field h-24 resize-none"
                                placeholder="Enter a channel description" />
                        </div>
                        <button className="btn-primary">Save changes</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
