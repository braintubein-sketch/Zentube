import { useState, useEffect } from 'react';
import { userAPI } from '../api';
import VideoCard from '../components/VideoCard';
import { HiOutlineClock, HiOutlineTrash } from 'react-icons/hi';

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchHistory(); }, []);

    const fetchHistory = async () => {
        try {
            const { data } = await userAPI.getWatchHistory();
            setHistory(data.history);
        } catch { } finally { setLoading(false); }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Watch history</h1>
                <div className="flex gap-2">
                    <button className="btn-ghost flex items-center gap-2 text-sm">
                        <HiOutlineTrash className="w-4 h-4" />
                        Clear all history
                    </button>
                </div>
            </div>

            <div className="flex gap-6">
                {/* Videos List */}
                <div className="flex-1 min-w-0">
                    {history.length > 0 ? (
                        <div className="space-y-2">
                            {history.map((item, i) => (
                                item.video && <VideoCard key={i} video={item.video} horizontal />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-z-surface flex items-center justify-center">
                                <HiOutlineClock className="w-12 h-12 text-z-text-muted" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No watch history</h3>
                            <p className="text-z-text-muted text-sm">Videos you watch will appear here</p>
                        </div>
                    )}
                </div>

                {/* Search History Sidebar */}
                <div className="hidden lg:block w-72 shrink-0">
                    <div className="card-elevated p-4">
                        <div className="relative mb-3">
                            <input type="text" placeholder="Search watch history" className="input-field text-sm py-2" />
                        </div>
                        <div className="space-y-2 text-sm">
                            <h3 className="font-semibold text-z-text-secondary text-xs uppercase tracking-wider">Manage history</h3>
                            <button className="w-full text-left py-1.5 text-z-text-secondary hover:text-z-text transition-colors">
                                Clear all watch history
                            </button>
                            <button className="w-full text-left py-1.5 text-z-text-secondary hover:text-z-text transition-colors">
                                Pause watch history
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default History;
