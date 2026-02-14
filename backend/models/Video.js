import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [150, 'Title must be less than 150 characters'],
    },
    description: {
        type: String,
        default: '',
        maxlength: [5000, 'Description must be less than 5000 characters'],
    },
    videoUrl: {
        type: String,
        required: [true, 'Video URL is required'],
    },
    videoPublicId: {
        type: String,
        default: '',
    },
    thumbnail: {
        type: String,
        default: '',
    },
    thumbnailPublicId: {
        type: String,
        default: '',
    },
    duration: {
        type: Number,
        default: 0,
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Education', 'Gaming', 'Tech', 'Entertainment', 'Music', 'Movies', 'Vlogs', 'Sports', 'News', 'Other'],
    },
    tags: [{
        type: String,
        trim: true,
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    views: {
        type: Number,
        default: 0,
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    dislikes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    isShort: {
        type: Boolean,
        default: false,
    },
    isPublished: {
        type: Boolean,
        default: true,
    },
    isReported: {
        type: Boolean,
        default: false,
    },
    reports: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: String,
        createdAt: { type: Date, default: Date.now },
    }],
    commentCount: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

// Virtual for like count
videoSchema.virtual('likeCount').get(function () {
    return this.likes ? this.likes.length : 0;
});

videoSchema.set('toJSON', { virtuals: true });
videoSchema.set('toObject', { virtuals: true });

// Indexes
videoSchema.index({ title: 'text', description: 'text', tags: 'text' });
videoSchema.index({ owner: 1, createdAt: -1 });
videoSchema.index({ category: 1 });
videoSchema.index({ views: -1 });
videoSchema.index({ createdAt: -1 });
videoSchema.index({ isShort: 1 });
videoSchema.index({ isPublished: 1 });

const Video = mongoose.model('Video', videoSchema);
export default Video;
