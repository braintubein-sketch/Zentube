import Video from '../models/Video.js';
import User from '../models/User.js';

// @desc    Search videos and channels
// @route   GET /api/search
export const search = async (req, res, next) => {
    try {
        const query = req.query.q || '';
        const type = req.query.type || 'all'; // all, videos, channels
        const category = req.query.category;
        const sort = req.query.sort || 'relevance'; // relevance, date, views
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        let results = { videos: [], channels: [], totalVideos: 0, totalChannels: 0 };

        if (!query.trim()) {
            return res.json(results);
        }

        // Search videos
        if (type === 'all' || type === 'videos') {
            const videoFilter = {
                isPublished: true,
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } },
                    { tags: { $regex: query, $options: 'i' } },
                ],
            };

            if (category && category !== 'All') {
                videoFilter.category = category;
            }

            let sortOption = {};
            switch (sort) {
                case 'date': sortOption = { createdAt: -1 }; break;
                case 'views': sortOption = { views: -1 }; break;
                default: sortOption = { score: { $meta: 'textScore' } };
            }

            // Try text search first, fall back to regex
            try {
                const [videos, totalVideos] = await Promise.all([
                    Video.find(videoFilter)
                        .sort(sort === 'relevance' ? { views: -1 } : sortOption)
                        .skip(skip)
                        .limit(limit)
                        .populate('owner', 'name avatar channelName subscribers'),
                    Video.countDocuments(videoFilter),
                ]);
                results.videos = videos;
                results.totalVideos = totalVideos;
            } catch {
                const [videos, totalVideos] = await Promise.all([
                    Video.find(videoFilter)
                        .sort({ views: -1 })
                        .skip(skip)
                        .limit(limit)
                        .populate('owner', 'name avatar channelName subscribers'),
                    Video.countDocuments(videoFilter),
                ]);
                results.videos = videos;
                results.totalVideos = totalVideos;
            }
        }

        // Search channels
        if (type === 'all' || type === 'channels') {
            const channelFilter = {
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { channelName: { $regex: query, $options: 'i' } },
                ],
            };

            const [channels, totalChannels] = await Promise.all([
                User.find(channelFilter)
                    .select('name avatar channelName subscribers bio')
                    .skip(skip)
                    .limit(limit),
                User.countDocuments(channelFilter),
            ]);

            results.channels = channels.map(ch => ({
                ...ch.toObject(),
                subscriberCount: ch.subscribers.length,
            }));
            results.totalChannels = totalChannels;
        }

        res.json({
            ...results,
            page,
            query,
        });
    } catch (error) {
        next(error);
    }
};
