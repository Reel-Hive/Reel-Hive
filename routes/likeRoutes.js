import express from 'express';
import { protect } from '../middlewares/protect.js';
import {
  getAllLikedComments,
  getAllLikedVideos,
  toggleCommentLike,
  toggleVideoLike,
} from '../controllers/likeContoller.js';

const router = express.Router();

router.use(protect);

router.route('/getAllLikedVideos').get(getAllLikedVideos);
router.route('/getAllLikedComments').get(getAllLikedComments);
router.route('/toggle/v/:videoId').post(toggleVideoLike);
router.route('/toggle/c/:commentId').post(toggleCommentLike);

export default router;
