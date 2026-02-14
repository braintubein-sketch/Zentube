import express from 'express';
import {
    getComments,
    addComment,
    deleteComment,
    toggleCommentLike,
} from '../controllers/comment.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/:videoId', getComments);
router.post('/:videoId', protect, addComment);
router.delete('/:id', protect, deleteComment);
router.post('/:id/like', protect, toggleCommentLike);

export default router;
