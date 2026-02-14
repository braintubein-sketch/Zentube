import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchAPI } from '../api';
import VideoCard from '../components/VideoCard';
import VideoCardSkeleton from '../components/VideoCardSkeleton';
import { formatViewsShort } from '../components/VideoCard';
import { HiOutlineFilter, HiOutlineX } from 'react-icons/hi';

const Search = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const categoryParam = searchParams.get('category') || '';
    const [results, setResults] = useState({ videos: [], channels: [] });
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        sort: 'relevance',
        uploadDate: '',
        type: '',
        duration: '',
    });

    useEffect(() => {
        if (query || categoryParam) fetchResults();
    }, [query, categoryParam]);

    const fetchResults = async () => {
        try {
            setLoading(true);
            const params = {};
            if (query) params.q = query;
            if (categoryParam) params.category = categoryParam;
            if (filters.sort !== 'relevance') params.sort = filters.sort;
            if (filters.type) params.type = filters.type;

            const { data } = await searchAPI.search(params);
            setResults(data);
        } catch { } finally { setLoading(false); }
    };

    return (
        <div className="max-w-5xl">
            {/* Filter Toggle */}
            <div className="flex items-center gap-3 mb-4">
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
            ${showFilters ? 'bg-z-chip-active text-z-bg' : 'bg-z-surface text-z-text-secondary hover:bg-z-surface-hover'}`}
                >
                    <HiOutlineFilter className="w-4 h-4" />
                    Filters
                </button>
                {query && <p className="text-sm text-z-text-muted">Results for "<span className="text-z-text font-medium">{query}</span>"</p>}
                {categoryParam && <span className="chip chip-brand">{categoryParam}</span>}
            </div>

            {/* Filters Bar */}
            {showFilters && (
                <div className="flex flex-wrap gap-3 mb-6 py-4 border-y border-z-border animate-slide-down">
                    <select value={filters.uploadDate}
                        onChange={(e) => setFilters({ ...filters, uploadDate: e.target.value })}
                        className="input-field w-auto py-2 text-sm">
                        <option value="">Upload date</option>
                        <option value="hour">Last hour</option>
                        <option value="today">Today</option>
                        <option value="week">This week</option>
                        <option value="month">This month</option>
                        <option value="year">This year</option>
                    </select>
                    <select value={filters.type}
                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        className="input-field w-auto py-2 text-sm">
                        <option value="">Type</option>
                        <option value="video">Video</option>
                        <option value="channel">Channel</option>
                        <option value="short">Short</option>
                    </select>
                    <select value={filters.duration}
                        onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
                        className="input-field w-auto py-2 text-sm">
                        <option value="">Duration</option>
                        <option value="short">Under 4 minutes</option>
                        <option value="medium">4-20 minutes</option>
                        <option value="long">Over 20 minutes</option>
                    </select>
                    <select value={filters.sort}
                        onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                        className="input-field w-auto py-2 text-sm">
                        <option value="relevance">Relevance</option>
                        <option value="date">Upload date</option>
                        <option value="views">View count</option>
                        <option value="rating">Rating</option>
                    </select>
                </div>
            )}

            {loading ? (
                <VideoCardSkeleton count={6} horizontal />
            ) : (
                <>
                    {/* Channel Results */}
                    {results.channels?.length > 0 && (
                        <div className="space-y-3 mb-8">
                            {results.channels.map(channel => (
                                <Link key={channel._id} to={`/channel/${channel._id}`}
                                    className="flex items-center gap-5 p-4 rounded-xl hover:bg-z-surface transition-colors">
                                    <div className="w-36 flex items-center justify-center shrink-0">
                                        <img
                                            src={channel.avatar || `https://ui-avatars.com/api/?name=${channel.name}&background=9147ff&color=fff&size=200`}
                                            alt={channel.name} className="avatar w-24 h-24"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-0.5">{channel.channelName || channel.name}</h3>
                                        <p className="text-xs text-z-text-muted mb-1">
                                            @{channel.name?.toLowerCase().replace(/\s+/g, '')} • {formatViewsShort(channel.subscriberCount)} subscribers
                                        </p>
                                        <p className="text-sm text-z-text-secondary line-clamp-1">{channel.bio}</p>
                                    </div>
                                    <button className="btn-subscribe ml-auto shrink-0">Subscribe</button>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Video Results */}
                    {results.videos?.length > 0 ? (
                        <div className="space-y-3">
                            {results.videos.map(video => (
                                <VideoCard key={video._id} video={video} horizontal />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <h3 className="text-lg font-semibold mb-2">No results found</h3>
                            <p className="text-sm text-z-text-muted">Try different keywords or remove filters</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Search;
