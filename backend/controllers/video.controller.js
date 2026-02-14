import Video from '../models/Video.js';
import User from '../models/User.js';
import Comment from '../models/Comment.js';
import Report from '../models/Report.js';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

// Helper: upload buffer to cloudinary
const uploadToCloudinary = (buffer, options) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        });
        streamifier.createReadStream(buffer).pipe(stream);
    });
};

// @desc    Upload video
// @route   POST /api/videos
export const uploadVideo = async (req, res, next) => {
    try {
        const { title, description, category, tags, isShort } = req.body;

        if (!title || !category) {
            return res.status(400).json({ error: 'Title and category are required' });
        }

        if (!req.files || !req.files.video) {
            return res.status(400).json({ error: 'Video file is required' });
        }

        // Upload video to Cloudinary
        const videoFile = req.files.video[0];
        const videoResult = await uploadToCloudinary(videoFile.buffer, {
            folder: 'zentro/videos',
            resource_type: 'video',
            chunk_size: 6000000,
        });

        // Upload thumbnail if provided
        let thumbnailUrl = '';
        let thumbnailPublicId = '';
        if (req.files.thumbnail) {
            const thumbResult = await uploadToCloudinary(req.files.thumbnail[0].buffer, {
                folder: 'zentro/thumbnails',
                transformation: [{ width: 1280, height: 720, crop: 'fill' }],
            });
            thumbnailUrl = thumbResult.secure_url;
            thumbnailPublicId = thumbResult.public_id;
        } else {
            // Auto-generate thumbnail from video
            thumbnailUrl = videoResult.secure_url.replace(/\.[^.]+$/, '.jpg');
        }

        const video = await Video.create({
            title,
            description: description || '',
            videoUrl: videoResult.secure_url,
            videoPublicId: videoResult.public_id,
            thumbnail: thumbnailUrl,
            thumbnailPublicId,
            duration: videoResult.duration || 0,
            category,
            tags: tags ? tags.split(',').map(t => t.trim()) : [],
            owner: req.user._id,
            isShort: isShort === 'true' || isShort === true,
        });

        await video.populate('owner', 'name avatar channelName');

        res.status(201).json({ video });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all videos (paginated, filtered)
// @route   GET /api/videos
export const getVideos = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;
        const category = req.query.category;
        const sort = req.query.sort || '-createdAt';

        const filter = { isPublished: true, isShort: false };
        if (category && category !== 'All') {
            filter.category = category;
        }

        const [videos, total] = await Promise.all([
            Video.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('owner', 'name avatar channelName subscribers'),
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

// @desc    Get shorts
// @route   GET /api/videos/shorts
export const getShorts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [videos, total] = await Promise.all([
            Video.find({ isPublished: true, isShort: true })
                .sort('-createdAt')
                .skip(skip)
                .limit(limit)
                .populate('owner', 'name avatar channelName'),
            Video.countDocuments({ isPublished: true, isShort: true }),
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

// @desc    Get single video
// @route   GET /api/videos/:id
export const getVideo = async (req, res, next) => {
    try {
        const video = await Video.findById(req.params.id)
            .populate('owner', 'name avatar channelName subscribers');

        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        // Increment views
        video.views += 1;
        await video.save();

        res.json({ video });
    } catch (error) {
        next(error);
    }
};

// @desc    Update video
// @route   PUT /api/videos/:id
export const updateVideo = async (req, res, next) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        if (video.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { title, description, category, tags, isPublished } = req.body;
        if (title) video.title = title;
        if (description !== undefined) video.description = description;
        if (category) video.category = category;
        if (tags) video.tags = tags.split(',').map(t => t.trim());
        if (isPublished !== undefined) video.isPublished = isPublished;

        // Handle thumbnail update
        if (req.files && req.files.thumbnail) {
            if (video.thumbnailPublicId) {
                await cloudinary.uploader.destroy(video.thumbnailPublicId);
            }
            const thumbResult = await uploadToCloudinary(req.files.thumbnail[0].buffer, {
                folder: 'zentro/thumbnails',
                transformation: [{ width: 1280, height: 720, crop: 'fill' }],
            });
            video.thumbnail = thumbResult.secure_url;
            video.thumbnailPublicId = thumbResult.public_id;
        }

        await video.save();
        await video.populate('owner', 'name avatar channelName');

        res.json({ video });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete video
// @route   DELETE /api/videos/:id
export const deleteVideo = async (req, res, next) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        if (video.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Delete from Cloudinary
        if (video.videoPublicId) {
            await cloudinary.uploader.destroy(video.videoPublicId, { resource_type: 'video' });
        }
        if (video.thumbnailPublicId) {
            await cloudinary.uploader.destroy(video.thumbnailPublicId);
        }

        // Delete comments
        await Comment.deleteMany({ video: video._id });

        await Video.findByIdAndDelete(video._id);

        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Like/Unlike video
// @route   POST /api/videos/:id/like
export const toggleLike = async (req, res, next) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        const userId = req.user._id;
        const likeIndex = video.likes.indexOf(userId);
        const dislikeIndex = video.dislikes.indexOf(userId);

        if (likeIndex > -1) {
            video.likes.splice(likeIndex, 1);
        } else {
            video.likes.push(userId);
            if (dislikeIndex > -1) {
                video.dislikes.splice(dislikeIndex, 1);
            }
        }

        await video.save();

        res.json({
            likes: video.likes.length,
            dislikes: video.dislikes.length,
            isLiked: likeIndex === -1,
            isDisliked: false,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Dislike video
// @route   POST /api/videos/:id/dislike
export const toggleDislike = async (req, res, next) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        const userId = req.user._id;
        const dislikeIndex = video.dislikes.indexOf(userId);
        const likeIndex = video.likes.indexOf(userId);

        if (dislikeIndex > -1) {
            video.dislikes.splice(dislikeIndex, 1);
        } else {
            video.dislikes.push(userId);
            if (likeIndex > -1) {
                video.likes.splice(likeIndex, 1);
            }
        }

        await video.save();

        res.json({
            likes: video.likes.length,
            dislikes: video.dislikes.length,
            isLiked: false,
            isDisliked: dislikeIndex === -1,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Report video
// @route   POST /api/videos/:id/report
export const reportVideo = async (req, res, next) => {
    try {
        const { reason, description } = req.body;
        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        const existingReport = await Report.findOne({
            reporter: req.user._id,
            video: video._id,
            status: 'pending',
        });

        if (existingReport) {
            return res.status(400).json({ error: 'You have already reported this video' });
        }

        await Report.create({
            reporter: req.user._id,
            video: video._id,
            reason,
            description,
        });

        video.isReported = true;
        video.reports.push({ user: req.user._id, reason });
        await video.save();

        res.json({ message: 'Video reported successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get trending/recommended videos
// @route   GET /api/videos/trending
export const getTrending = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 12;

        const videos = await Video.find({ isPublished: true, isShort: false })
            .sort({ views: -1, likes: -1 })
            .limit(limit)
            .populate('owner', 'name avatar channelName');

        res.json({ videos });
    } catch (error) {
        next(error);
    }
};

// @desc    Get recommended videos (for sidebar)
// @route   GET /api/videos/:id/recommended
export const getRecommended = async (req, res, next) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        const videos = await Video.find({
            _id: { $ne: video._id },
            isPublished: true,
            isShort: false,
            $or: [
                { category: video.category },
                { tags: { $in: video.tags } },
            ],
        })
            .sort({ views: -1 })
            .limit(12)
            .populate('owner', 'name avatar channelName');

        // If not enough similar videos, fill with popular ones
        if (videos.length < 8) {
            const moreVideos = await Video.find({
                _id: { $nin: [video._id, ...videos.map(v => v._id)] },
                isPublished: true,
                isShort: false,
            })
                .sort({ views: -1, createdAt: -1 })
                .limit(12 - videos.length)
                .populate('owner', 'name avatar channelName');

            videos.push(...moreVideos);
        }

        res.json({ videos });
    } catch (error) {
        next(error);
    }
};
