import { useState, useEffect } from 'react';
import { videoAPI } from '../api';
import VideoCard from '../components/VideoCard';
import VideoCardSkeleton from '../components/VideoCardSkeleton';
import { HiOutlineFire } from 'react-icons/hi';

const TABS = ['Now', 'Music', 'Gaming', 'Movies'];

const Trending = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Now');

    useEffect(() => { fetchTrending(); }, [activeTab]);

    const fetchTrending = async () => {
        try {
            setLoading(true);
            const params = { limit: 24 };
            if (activeTab !== 'Now') params.category = activeTab;
            const { data } = await videoAPI.getTrending(params);
            setVideos(data.videos);
        } catch { } finally { setLoading(false); }
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-gradient-fire rounded-xl">
                    <HiOutlineFire className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold">Trending</h1>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-z-border mb-6">
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`tab ${activeTab === tab ? 'tab-active' : ''}`}
                    >
                        {tab}
                        {activeTab === tab && <div className="tab-indicator" />}
                    </button>
                ))}
            </div>

            {loading ? (
                <VideoCardSkeleton count={12} />
            ) : videos.length > 0 ? (
                <div className="space-y-3">
                    {videos.map((video, i) => (
                        <div key={video._id} className="flex items-start gap-3">
                            <span className="text-2xl font-bold text-z-text-muted w-8 text-center shrink-0 pt-4">{i + 1}</span>
                            <div className="flex-1"><VideoCard video={video} horizontal /></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <h3 className="text-xl font-semibold mb-2">No trending videos yet</h3>
                    <p className="text-z-text-muted text-sm">Check back later for trending content</p>
                </div>
            )}
        </div>
    );
};

export default Trending;
