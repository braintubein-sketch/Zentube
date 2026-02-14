import { useState, useEffect } from 'react';
import { adminAPI } from '../api';
import { formatViewsShort, timeAgo } from '../components/VideoCard';
import toast from 'react-hot-toast';
import {
    HiOutlineEye, HiOutlineUserGroup, HiOutlineVideoCamera, HiOutlineFlag,
    HiOutlineTrash, HiOutlineCheck, HiOutlineX, HiOutlineBan,
    HiOutlineChartBar, HiOutlineShieldCheck, HiOutlineTrendingUp
} from 'react-icons/hi';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [videos, setVideos] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchData(); }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'overview') {
                const { data } = await adminAPI.getDashboard();
                setStats(data);
            } else if (activeTab === 'users') {
                const { data } = await adminAPI.getUsers();
                setUsers(data.users);
            } else if (activeTab === 'videos') {
                const { data } = await adminAPI.getVideos();
                setVideos(data.videos);
            } else if (activeTab === 'reports') {
                const { data } = await adminAPI.getReports();
                setReports(data.reports);
            }
        } catch { } finally { setLoading(false); }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Permanently delete this user?')) return;
        try {
            await adminAPI.deleteUser(userId);
            setUsers(prev => prev.filter(u => u._id !== userId));
            toast.success('User deleted');
        } catch { toast.error('Failed'); }
    };

    const handleDeleteVideo = async (videoId) => {
        if (!window.confirm('Permanently delete this video?')) return;
        try {
            await adminAPI.deleteVideo(videoId);
            setVideos(prev => prev.filter(v => v._id !== videoId));
            toast.success('Video deleted');
        } catch { toast.error('Failed'); }
    };

    const handleResolveReport = async (reportId, action) => {
        try {
            await adminAPI.resolveReport(reportId, { action });
            setReports(prev => prev.filter(r => r._id !== reportId));
            toast.success(action === 'resolve' ? 'Report resolved' : 'Report dismissed');
        } catch { toast.error('Failed'); }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: HiOutlineChartBar },
        { id: 'users', label: 'Users', icon: HiOutlineUserGroup },
        { id: 'videos', label: 'Content', icon: HiOutlineVideoCamera },
        { id: 'reports', label: 'Reports', icon: HiOutlineFlag },
    ];

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-gradient-gold rounded-xl">
                    <HiOutlineShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Admin Panel</h1>
                    <p className="text-sm text-z-text-muted">Platform management & moderation</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-z-chip-active text-z-bg'
                                : 'bg-z-surface text-z-text-secondary hover:bg-z-surface-hover'
                            }`}>
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-accent-gold/30 border-t-accent-gold rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    {/* Overview */}
                    {activeTab === 'overview' && stats && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { label: 'Total Users', value: stats.totalUsers || 0, icon: HiOutlineUserGroup, color: 'text-brand', bg: 'bg-brand/10' },
                                    { label: 'Total Videos', value: stats.totalVideos || 0, icon: HiOutlineVideoCamera, color: 'text-accent-blue', bg: 'bg-accent-blue/10' },
                                    { label: 'Total Views', value: stats.totalViews || 0, icon: HiOutlineEye, color: 'text-accent-emerald', bg: 'bg-accent-emerald/10' },
                                    { label: 'Pending Reports', value: stats.pendingReports || 0, icon: HiOutlineFlag, color: 'text-accent-rose', bg: 'bg-accent-rose/10' },
                                ].map(stat => (
                                    <div key={stat.label} className="card-elevated p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-medium text-z-text-muted uppercase tracking-wider">{stat.label}</span>
                                            <div className={`p-2 rounded-lg ${stat.bg}`}><stat.icon className={`w-4 h-4 ${stat.color}`} /></div>
                                        </div>
                                        <p className="text-3xl font-bold">{formatViewsShort(stat.value)}</p>
                                        <p className="text-xs text-accent-emerald flex items-center gap-1 mt-1">
                                            <HiOutlineTrendingUp className="w-3 h-3" /> Growing
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="card-elevated p-6">
                                    <h3 className="font-semibold mb-4">Recent users</h3>
                                    <div className="space-y-3">
                                        {stats.recentUsers?.slice(0, 5).map(user => (
                                            <div key={user._id} className="flex items-center gap-3">
                                                <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=9147ff&color=fff`}
                                                    alt="" className="avatar avatar-sm" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{user.name}</p>
                                                    <p className="text-xs text-z-text-muted">{user.email}</p>
                                                </div>
                                                <span className="text-xs text-z-text-muted">{timeAgo(user.createdAt)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="card-elevated p-6">
                                    <h3 className="font-semibold mb-4">Recent videos</h3>
                                    <div className="space-y-3">
                                        {stats.recentVideos?.slice(0, 5).map(video => (
                                            <div key={video._id} className="flex items-center gap-3">
                                                <div className="w-16 aspect-video rounded bg-z-surface shrink-0 overflow-hidden">
                                                    <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{video.title}</p>
                                                    <p className="text-xs text-z-text-muted">{formatViewsShort(video.views)} views</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Users */}
                    {activeTab === 'users' && (
                        <div className="card-elevated overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-z-border text-left text-z-text-muted">
                                        <th className="px-4 py-3 font-medium">User</th>
                                        <th className="px-4 py-3 font-medium hidden md:table-cell">Email</th>
                                        <th className="px-4 py-3 font-medium hidden sm:table-cell">Role</th>
                                        <th className="px-4 py-3 font-medium hidden lg:table-cell">Joined</th>
                                        <th className="px-4 py-3 font-medium text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-z-border/50">
                                    {users.map(u => (
                                        <tr key={u._id} className="hover:bg-z-surface transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}&background=9147ff&color=fff`}
                                                        alt="" className="avatar avatar-sm" />
                                                    <div>
                                                        <p className="font-medium">{u.name}</p>
                                                        <p className="text-xs text-z-text-muted md:hidden">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell text-z-text-muted">{u.email}</td>
                                            <td className="px-4 py-3 hidden sm:table-cell">
                                                <span className={`tag ${u.role === 'admin' ? 'bg-accent-gold/15 text-accent-gold' : ''}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 hidden lg:table-cell text-z-text-muted text-xs">{timeAgo(u.createdAt)}</td>
                                            <td className="px-4 py-3 text-center">
                                                {u.role !== 'admin' && (
                                                    <button onClick={() => handleDeleteUser(u._id)}
                                                        className="btn-icon-sm text-accent-rose" title="Delete user">
                                                        <HiOutlineTrash className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Videos */}
                    {activeTab === 'videos' && (
                        <div className="card-elevated overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-z-border text-left text-z-text-muted">
                                        <th className="px-4 py-3 font-medium">Video</th>
                                        <th className="px-4 py-3 font-medium hidden sm:table-cell">Creator</th>
                                        <th className="px-4 py-3 font-medium text-right hidden md:table-cell">Views</th>
                                        <th className="px-4 py-3 font-medium hidden lg:table-cell">Date</th>
                                        <th className="px-4 py-3 font-medium text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-z-border/50">
                                    {videos.map(v => (
                                        <tr key={v._id} className="hover:bg-z-surface transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-20 aspect-video rounded bg-z-surface shrink-0 overflow-hidden">
                                                        {v.thumbnail && <img src={v.thumbnail} alt="" className="w-full h-full object-cover" />}
                                                    </div>
                                                    <p className="font-medium line-clamp-2">{v.title}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 hidden sm:table-cell text-z-text-muted">{v.owner?.name}</td>
                                            <td className="px-4 py-3 text-right hidden md:table-cell">{formatViewsShort(v.views)}</td>
                                            <td className="px-4 py-3 hidden lg:table-cell text-xs text-z-text-muted">{timeAgo(v.createdAt)}</td>
                                            <td className="px-4 py-3 text-center">
                                                <button onClick={() => handleDeleteVideo(v._id)}
                                                    className="btn-icon-sm text-accent-rose" title="Delete">
                                                    <HiOutlineTrash className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Reports */}
                    {activeTab === 'reports' && (
                        <div className="space-y-3">
                            {reports.length > 0 ? reports.map(report => (
                                <div key={report._id} className="card-elevated p-4 flex items-start gap-4">
                                    <div className="p-2 rounded-lg bg-accent-rose/10 shrink-0 mt-0.5">
                                        <HiOutlineFlag className="w-5 h-5 text-accent-rose" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="font-medium text-sm">{report.reason}</p>
                                                <p className="text-xs text-z-text-muted mt-0.5">
                                                    Reported by {report.reportedBy?.name || 'Unknown'} • {timeAgo(report.createdAt)}
                                                </p>
                                            </div>
                                            <span className={`tag text-[10px] ${report.status === 'pending' ? 'bg-accent-gold/15 text-accent-gold' :
                                                    report.status === 'resolved' ? 'bg-accent-emerald/15 text-accent-emerald' :
                                                        'bg-z-chip text-z-text-muted'
                                                }`}>{report.status}</span>
                                        </div>
                                        {report.details && <p className="text-sm text-z-text-secondary mt-2">{report.details}</p>}
                                        <div className="flex gap-2 mt-3">
                                            <button onClick={() => handleResolveReport(report._id, 'resolve')}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-accent-emerald/10 text-accent-emerald rounded-lg text-xs font-medium hover:bg-accent-emerald/20 transition-colors">
                                                <HiOutlineCheck className="w-3.5 h-3.5" /> Resolve
                                            </button>
                                            <button onClick={() => handleResolveReport(report._id, 'dismiss')}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-z-surface text-z-text-secondary rounded-lg text-xs font-medium hover:bg-z-surface-hover transition-colors">
                                                <HiOutlineX className="w-3.5 h-3.5" /> Dismiss
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-16">
                                    <HiOutlineShieldCheck className="w-16 h-16 text-accent-emerald mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-1">All clear!</h3>
                                    <p className="text-sm text-z-text-muted">No pending reports</p>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminPanel;
