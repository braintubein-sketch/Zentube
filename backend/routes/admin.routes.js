import express from 'express';
import {
    getDashboardStats,
    getAllUsers,
    deleteUser,
    getReports,
    updateReport,
    getAllVideos,
} from '../controllers/admin.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/reports', getReports);
router.patch('/reports/:id', updateReport);
router.get('/videos', getAllVideos);

export default router;
