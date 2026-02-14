import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        default: null,
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null,
    },
    reason: {
        type: String,
        required: [true, 'Report reason is required'],
        enum: ['spam', 'harassment', 'inappropriate', 'copyright', 'misinformation', 'other'],
    },
    description: {
        type: String,
        default: '',
        maxlength: [500, 'Description must be less than 500 characters'],
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
        default: 'pending',
    },
}, {
    timestamps: true,
});

reportSchema.index({ status: 1, createdAt: -1 });

const Report = mongoose.model('Report', reportSchema);
export default Report;
