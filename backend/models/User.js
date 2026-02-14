import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name must be less than 50 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false,
    },
    avatar: {
        type: String,
        default: '',
    },
    banner: {
        type: String,
        default: '',
    },
    bio: {
        type: String,
        default: '',
        maxlength: [500, 'Bio must be less than 500 characters'],
    },
    channelName: {
        type: String,
        default: '',
        trim: true,
    },
    subscribers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    subscriptions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    watchHistory: [{
        video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
        watchedAt: { type: Date, default: Date.now },
    }],
    watchLater: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
    }],
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    isMonetized: {
        type: Boolean,
        default: false,
    },
    totalViews: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for subscriber count
userSchema.virtual('subscriberCount').get(function () {
    return this.subscribers ? this.subscribers.length : 0;
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ channelName: 1 });
userSchema.index({ name: 'text', channelName: 'text' });

const User = mongoose.model('User', userSchema);
export default User;
