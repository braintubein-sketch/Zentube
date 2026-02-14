import express from 'express';
import {
    uploadVideo,
    getVideos,
    getShorts,
    getVideo,
    updateVideo,
    deleteVideo,
    toggleLike,
    toggleDislike,
    reportVideo,
    getTrending,
    getRecommended,
} from '../controllers/video.controller.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getVideos);
router.get('/shorts', getShorts);
router.get('/trending', getTrending);

// Protected routes
router.post('/', protect, upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
]), uploadVideo);

// Video specific routes
router.get('/:id', optionalAuth, getVideo);
router.put('/:id', protect, upload.fields([{ name: 'thumbnail', maxCount: 1 }]), updateVideo);
router.delete('/:id', protect, deleteVideo);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/dislike', protect, toggleDislike);
router.post('/:id/report', protect, reportVideo);
router.get('/:id/recommended', getRecommended);

export default router;
