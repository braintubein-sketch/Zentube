import express from 'express';
import {
    getUserProfile,
    toggleSubscribe,
    getUserVideos,
    getWatchHistory,
    addToWatchHistory,
    toggleWatchLater,
    getWatchLater,
    getSubscriptionFeed,
} from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protected routes (order matters - specific before parameterized)
router.get('/history', protect, getWatchHistory);
router.post('/history/:videoId', protect, addToWatchHistory);
router.get('/watchlater', protect, getWatchLater);
router.post('/watchlater/:videoId', protect, toggleWatchLater);
router.get('/subscriptions/feed', protect, getSubscriptionFeed);

// Public routes
router.get('/:id', getUserProfile);
router.get('/:id/videos', getUserVideos);
router.post('/:id/subscribe', protect, toggleSubscribe);

export default router;
