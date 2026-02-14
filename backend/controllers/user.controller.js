import User from '../models/User.js';
import Video from '../models/Video.js';

// @desc    Get user channel/profile
// @route   GET /api/users/:id
export const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
            .select('name email avatar banner bio channelName subscribers createdAt isMonetized');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const videoCount = await Video.countDocuments({ owner: user._id, isPublished: true });

        res.json({
            user: {
                _id: user._id,
                name: user.name,
                avatar: user.avatar,
                banner: user.banner,
                bio: user.bio,
                channelName: user.channelName,
                subscriberCount: user.subscribers.length,
                videoCount,
                createdAt: user.createdAt,
                isMonetized: user.isMonetized,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Subscribe/Unsubscribe to channel
// @route   POST /api/users/:id/subscribe
export const toggleSubscribe = async (req, res, next) => {
    try {
        const channelId = req.params.id;
        const userId = req.user._id;

        if (channelId === userId.toString()) {
            return res.status(400).json({ error: 'You cannot subscribe to yourself' });
        }

        const channel = await User.findById(channelId);
        if (!channel) {
            return res.status(404).json({ error: 'Channel not found' });
        }

        const user = await User.findById(userId);
        const isSubscribed = channel.subscribers.includes(userId);

        if (isSubscribed) {
            // Unsubscribe
            channel.subscribers = channel.subscribers.filter(id => id.toString() !== userId.toString());
            user.subscriptions = user.subscriptions.filter(id => id.toString() !== channelId);
        } else {
            // Subscribe
            channel.subscribers.push(userId);
            user.subscriptions.push(channelId);
        }

        await channel.save();
        await user.save();

        res.json({
            isSubscribed: !isSubscribed,
            subscriberCount: channel.subscribers.length,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user's videos
// @route   GET /api/users/:id/videos
export const getUserVideos = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;
        const sort = req.query.sort || '-createdAt';

        const filter = { owner: req.params.id, isPublished: true };

        const [videos, total] = await Promise.all([
            Video.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('owner', 'name avatar channelName'),
            Video.countDocuments(filter),
        ]);

        res.json({
            videos,
            page,
            pages: Math.ceil(total / limit),
            total,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get watch history
// @route   GET /api/users/history
export const getWatchHistory = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
            .populate({
                path: 'watchHistory.video',
                populate: { path: 'owner', select: 'name avatar channelName' },
            });

        const history = user.watchHistory
            .filter(h => h.video)
            .sort((a, b) => b.watchedAt - a.watchedAt)
            .slice(0, 50);

        res.json({ history });
    } catch (error) {
        next(error);
    }
};

// @desc    Add to watch history
// @route   POST /api/users/history/:videoId
export const addToWatchHistory = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        const videoId = req.params.videoId;

        // Remove existing entry if present
        user.watchHistory = user.watchHistory.filter(
            h => h.video.toString() !== videoId
        );

        // Add to beginning
        user.watchHistory.unshift({ video: videoId, watchedAt: new Date() });

        // Keep only last 100
        if (user.watchHistory.length > 100) {
            user.watchHistory = user.watchHistory.slice(0, 100);
        }

        await user.save();
        res.json({ message: 'Added to watch history' });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle watch later
// @route   POST /api/users/watchlater/:videoId
export const toggleWatchLater = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        const videoId = req.params.videoId;

        const index = user.watchLater.indexOf(videoId);
        if (index > -1) {
            user.watchLater.splice(index, 1);
        } else {
            user.watchLater.push(videoId);
        }

        await user.save();
        res.json({
            isSaved: index === -1,
            watchLater: user.watchLater,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get watch later list
// @route   GET /api/users/watchlater
export const getWatchLater = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
            .populate({
                path: 'watchLater',
                populate: { path: 'owner', select: 'name avatar channelName' },
            });

        res.json({ videos: user.watchLater || [] });
    } catch (error) {
        next(error);
    }
};

// @desc    Get subscriptions feed
// @route   GET /api/users/subscriptions/feed
export const getSubscriptionFeed = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const [videos, total] = await Promise.all([
            Video.find({ owner: { $in: user.subscriptions }, isPublished: true })
                .sort('-createdAt')
                .skip(skip)
                .limit(limit)
                .populate('owner', 'name avatar channelName'),
            Video.countDocuments({ owner: { $in: user.subscriptions }, isPublished: true }),
        ]);

        res.json({
            videos,
            page,
            pages: Math.ceil(total / limit),
            total,
        });
    } catch (error) {
        next(error);
    }
};
