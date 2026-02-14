import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

// @desc    Register user
// @route   POST /api/auth/register
export const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Please provide all required fields' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const user = await User.create({
            name,
            email,
            password,
            channelName: name,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c3aed&color=fff&size=200`,
        });

        const token = generateToken(user._id);

        res.status(201).json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                channelName: user.channelName,
                role: user.role,
                subscriberCount: 0,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user._id);

        res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                channelName: user.channelName,
                role: user.role,
                bio: user.bio,
                banner: user.banner,
                subscriberCount: user.subscribers.length,
                subscriptions: user.subscriptions,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
export const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('subscriptions', 'name avatar channelName')
            .populate('watchLater');

        res.json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                banner: user.banner,
                bio: user.bio,
                channelName: user.channelName,
                role: user.role,
                subscriberCount: user.subscribers.length,
                subscriptions: user.subscriptions,
                watchLater: user.watchLater,
                isMonetized: user.isMonetized,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
export const updateProfile = async (req, res, next) => {
    try {
        const { name, bio, channelName } = req.body;
        const user = await User.findById(req.user._id);

        if (name) user.name = name;
        if (bio !== undefined) user.bio = bio;
        if (channelName) user.channelName = channelName;

        // Handle avatar upload
        if (req.files && req.files.avatar) {
            const avatarFile = req.files.avatar[0];
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'zentro/avatars', transformation: [{ width: 200, height: 200, crop: 'fill' }] },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                streamifier.createReadStream(avatarFile.buffer).pipe(stream);
            });
            user.avatar = result.secure_url;
        }

        // Handle banner upload
        if (req.files && req.files.banner) {
            const bannerFile = req.files.banner[0];
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'zentro/banners', transformation: [{ width: 1280, height: 320, crop: 'fill' }] },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                streamifier.createReadStream(bannerFile.buffer).pipe(stream);
            });
            user.banner = result.secure_url;
        }

        await user.save();

        res.json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                banner: user.banner,
                bio: user.bio,
                channelName: user.channelName,
                role: user.role,
                subscriberCount: user.subscribers.length,
            },
        });
    } catch (error) {
        next(error);
    }
};
