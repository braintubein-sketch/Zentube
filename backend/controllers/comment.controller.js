import Comment from '../models/Comment.js';
import Video from '../models/Video.js';

// @desc    Get comments for a video
// @route   GET /api/comments/:videoId
export const getComments = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [comments, total] = await Promise.all([
            Comment.find({ video: req.params.videoId, parentComment: null })
                .sort('-createdAt')
                .skip(skip)
                .limit(limit)
                .populate('user', 'name avatar channelName')
                .populate({
                    path: 'replies',
                    populate: { path: 'user', select: 'name avatar channelName' },
                }),
            Comment.countDocuments({ video: req.params.videoId, parentComment: null }),
        ]);

        // Get replies for each comment
        const commentsWithReplies = await Promise.all(
            comments.map(async (comment) => {
                const replies = await Comment.find({ parentComment: comment._id })
                    .sort('createdAt')
                    .populate('user', 'name avatar channelName');
                return { ...comment.toObject(), replies };
            })
        );

        res.json({
            comments: commentsWithReplies,
            page,
            pages: Math.ceil(total / limit),
            total,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add comment
// @route   POST /api/comments/:videoId
export const addComment = async (req, res, next) => {
    try {
        const { text, parentComment } = req.body;
        const videoId = req.params.videoId;

        if (!text || !text.trim()) {
            return res.status(400).json({ error: 'Comment text is required' });
        }

        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        const comment = await Comment.create({
            text: text.trim(),
            user: req.user._id,
            video: videoId,
            parentComment: parentComment || null,
        });

        // Update comment count
        video.commentCount += 1;
        await video.save();

        await comment.populate('user', 'name avatar channelName');

        res.status(201).json({ comment });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
export const deleteComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Delete replies
        await Comment.deleteMany({ parentComment: comment._id });

        // Update video comment count
        const replyCount = await Comment.countDocuments({ parentComment: comment._id });
        await Video.findByIdAndUpdate(comment.video, {
            $inc: { commentCount: -(1 + replyCount) },
        });

        await Comment.findByIdAndDelete(comment._id);

        res.json({ message: 'Comment deleted' });
    } catch (error) {
        next(error);
    }
};

// @desc    Like comment
// @route   POST /api/comments/:id/like
export const toggleCommentLike = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const userId = req.user._id;
        const index = comment.likes.indexOf(userId);

        if (index > -1) {
            comment.likes.splice(index, 1);
        } else {
            comment.likes.push(userId);
        }

        await comment.save();

        res.json({
            likes: comment.likes.length,
            isLiked: index === -1,
        });
    } catch (error) {
        next(error);
    }
};
