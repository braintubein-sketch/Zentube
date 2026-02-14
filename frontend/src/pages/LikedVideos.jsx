import { useState, useEffect } from 'react';
import { videoAPI } from '../api';
import VideoCard from '../components/VideoCard';
import { HiOutlineThumbUp } from 'react-icons/hi';

const LikedVideos = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLikedVideos();
    }, []);

    const fetchLikedVideos = async () => {
        try {
            // Using a generic endpoint; in production, you'd have a dedicated liked videos endpoint
            const { data } = await videoAPI.getVideos({ liked: true });
            setVideos(data.videos || []);
        } catch {
        } finally {
            setLoading(false);
        }
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
                <div className="w-72 aspect-video rounded-2xl bg-gradient-to-br from-brand/20 via-brand/10 to-accent-blue/20
          flex items-center justify-center shrink-0">
                    <HiOutlineThumbUp className="w-16 h-16 text-brand" />
                </div>
                <div className="py-2">
                    <h1 className="text-2xl font-bold mb-1">Liked videos</h1>
                    <p className="text-sm text-z-text-muted mb-3">{videos.length} videos • Private</p>
                    <div className="flex gap-2">
                        <button className="btn-primary flex items-center gap-2">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            Play all
                        </button>
                        <button className="btn-secondary">Shuffle</button>
                    </div>
                </div>
            </div>

            {/* Video List */}
            {videos.length > 0 ? (
                <div className="space-y-2">
                    {videos.map((video, i) => (
                        <div key={video._id} className="flex items-center gap-3">
                            <span className="text-sm text-z-text-muted w-6 text-center shrink-0">{i + 1}</span>
                            <div className="flex-1">
                                <VideoCard video={video} horizontal />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <HiOutlineThumbUp className="w-16 h-16 text-z-text-muted mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-1">No liked videos yet</h3>
                    <p className="text-sm text-z-text-muted">Videos you like will appear here</p>
                </div>
            )}
        </div>
    );
};

export default LikedVideos;
