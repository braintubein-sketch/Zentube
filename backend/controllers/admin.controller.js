import User from '../models/User.js';
import Video from '../models/Video.js';
import Comment from '../models/Comment.js';
import Report from '../models/Report.js';

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
export const getDashboardStats = async (req, res, next) => {
    try {
        const [totalUsers, totalVideos, totalComments, totalReports, pendingReports] = await Promise.all([
            User.countDocuments(),
            Video.countDocuments(),
            Comment.countDocuments(),
            Report.countDocuments(),
            Report.countDocuments({ status: 'pending' }),
        ]);

        // Get recent stats (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const [newUsers, newVideos] = await Promise.all([
            User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
            Video.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
        ]);

        // Total views
        const viewsAgg = await Video.aggregate([
            { $group: { _id: null, totalViews: { $sum: '$views' } } },
        ]);

        res.json({
            totalUsers,
            totalVideos,
            totalComments,
            totalReports,
            pendingReports,
            newUsers,
            newVideos,
            totalViews: viewsAgg[0]?.totalViews || 0,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
export const getAllUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';

        const filter = search
            ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                ]
            }
            : {};

        const [users, total] = await Promise.all([
            User.find(filter)
                .select('-password')
                .sort('-createdAt')
                .skip(skip)
                .limit(limit),
            User.countDocuments(filter),
        ]);

        res.json({
            users,
            page,
            pages: Math.ceil(total / limit),
            total,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user (admin)
// @route   DELETE /api/admin/users/:id
export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(400).json({ error: 'Cannot delete admin user' });
        }

        // Delete user's videos and comments
        await Video.deleteMany({ owner: user._id });
        await Comment.deleteMany({ user: user._id });
        await User.findByIdAndDelete(user._id);

        res.json({ message: 'User and associated content deleted' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all reports
// @route   GET /api/admin/reports
export const getReports = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const status = req.query.status || 'pending';

        const filter = status !== 'all' ? { status } : {};

        const [reports, total] = await Promise.all([
            Report.find(filter)
                .sort('-createdAt')
                .skip(skip)
                .limit(limit)
                .populate('reporter', 'name email avatar')
                .populate({
                    path: 'video',
                    select: 'title thumbnail owner views',
                    populate: { path: 'owner', select: 'name email' },
                }),
            Report.countDocuments(filter),
        ]);

        res.json({
            reports,
            page,
            pages: Math.ceil(total / limit),
            total,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update report status
// @route   PATCH /api/admin/reports/:id
export const updateReport = async (req, res, next) => {
    try {
        const { status } = req.body;
        const report = await Report.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('reporter', 'name email').populate('video', 'title');

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.json({ report });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all videos (admin, including unpublished)
// @route   GET /api/admin/videos
export const getAllVideos = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [videos, total] = await Promise.all([
            Video.find()
                .sort('-createdAt')
                .skip(skip)
                .limit(limit)
                .populate('owner', 'name email avatar'),
            Video.countDocuments(),
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
