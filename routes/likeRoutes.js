import express from 'express';
import { protect } from '../middlewares/protect.js';
import {
  getLikedComments,
  getLikedVideos,
  toggleCommentLike,
  toggleVideoLike,
} from '../controllers/likeContoller.js';

const router = express.Router();

router.use(protect);

router.route('/getAllLikedVideos').get(getLikedVideos);
router.route('/getAllLikedComments').get(getLikedComments);
router.route('/toggle/v/:videoId').post(toggleVideoLike);
router.route('/toggle/c/:commentId').post(toggleCommentLike);

export default router;
