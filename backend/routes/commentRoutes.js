import express from 'express';
import { protect } from '../middlewares/protect.js';
import {
  createComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from '../controllers/commentController.js';

const router = express.Router();

router.use(protect);

router
    .route('/:videoId')
    .get(getVideoComments)
    .post(createComment);
router
    .route('/c/:commentId')
    .patch(updateComment)
    .delete(deleteComment);

export default router;
