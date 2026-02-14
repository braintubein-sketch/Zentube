import { useState, useEffect } from 'react';
import { userAPI } from '../api';
import VideoCard from '../components/VideoCard';
import { HiOutlineBookmark } from 'react-icons/hi';

const WatchLater = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchWatchLater(); }, []);

    const fetchWatchLater = async () => {
        try {
            const { data } = await userAPI.getWatchLater();
            setVideos(data.videos);
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
            {/* Header */}
            <div className="flex gap-6 mb-8">
                <div className="w-72 aspect-video rounded-2xl bg-gradient-to-br from-brand/20 via-accent-blue/10 to-brand/5
          flex items-center justify-center shrink-0 hidden sm:flex">
                    <HiOutlineBookmark className="w-16 h-16 text-brand" />
                </div>
                <div className="py-2">
                    <h1 className="text-2xl font-bold mb-1">Watch later</h1>
                    <p className="text-sm text-z-text-muted mb-3">{videos.length} videos • Private</p>
                    <div className="flex gap-2">
                        <button className="btn-primary flex items-center gap-2">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                            Play all
                        </button>
                        <button className="btn-secondary">Shuffle</button>
                    </div>
                </div>
            </div>

            {videos.length > 0 ? (
                <div className="space-y-2">
                    {videos.map((video, i) => (
                        <div key={video._id} className="flex items-center gap-3">
                            <span className="text-sm text-z-text-muted w-6 text-center shrink-0">{i + 1}</span>
                            <div className="flex-1"><VideoCard video={video} horizontal /></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-z-surface flex items-center justify-center">
                        <HiOutlineBookmark className="w-12 h-12 text-z-text-muted" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No saved videos</h3>
                    <p className="text-z-text-muted text-sm">Save videos to watch later</p>
                </div>
            )}
        </div>
    );
};

export default WatchLater;
