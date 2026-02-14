import { useState, useEffect } from 'react';
import { userAPI } from '../api';
import VideoCard from '../components/VideoCard';
import VideoCardSkeleton from '../components/VideoCardSkeleton';
import { HiOutlineUserGroup } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const Subscriptions = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [viewMode, setViewMode] = useState('grid'); // grid or list

    useEffect(() => { fetchFeed(); }, [page]);

    const fetchFeed = async () => {
        try {
            setLoading(true);
            const { data } = await userAPI.getSubscriptionFeed({ page, limit: 16 });
            setVideos(data.videos);
            setTotalPages(data.pages);
        } catch { } finally { setLoading(false); }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Latest</h1>
                <div className="flex items-center gap-2 bg-z-surface rounded-lg overflow-hidden">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-z-chip-active text-z-bg' : 'text-z-text-secondary hover:text-z-text'}`}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 3h8v8H3V3zm0 10h8v8H3v-8zM13 3h8v8h-8V3zm0 10h8v8h-8v-8z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-z-chip-active text-z-bg' : 'text-z-text-secondary hover:text-z-text'}`}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
                        </svg>
                    </button>
                </div>
            </div>

            {loading ? (
                <VideoCardSkeleton count={8} horizontal={viewMode === 'list'} />
            ) : videos.length > 0 ? (
                <>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                            {videos.map(video => <VideoCard key={video._id} video={video} />)}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {videos.map(video => <VideoCard key={video._id} video={video} horizontal />)}
                        </div>
                    )}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-3 mt-8">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="btn-secondary disabled:opacity-30">Previous</button>
                            <span className="flex items-center text-sm text-z-text-muted">Page {page} of {totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                className="btn-secondary disabled:opacity-30">Next</button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-20">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-z-surface flex items-center justify-center">
                        <HiOutlineUserGroup className="w-12 h-12 text-z-text-muted" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No subscriptions yet</h3>
                    <p className="text-z-text-muted text-sm mb-4">Subscribe to channels to see their latest videos here</p>
                    <Link to="/" className="btn-primary">Explore Videos</Link>
                </div>
            )}
        </div>
    );
};

export default Subscriptions;
