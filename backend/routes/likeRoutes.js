import express from 'express';
import { protect } from '../middlewares/protect.js';
import {
  getAllLikedComments,
  getAllLikedVideos,
  toggleCommentDislike,
  toggleCommentLike,
  toggleVideoDislike,
  toggleVideoLike,
} from '../controllers/likeContoller.js';

const router = express.Router();

router.use(protect);

router.route('/getAllLikedVideos').get(getAllLikedVideos);
router.route('/getAllLikedComments').get(getAllLikedComments);

// Like and dislike video
router.route('/toggle/v/like/:videoId').post(toggleVideoLike);
router.route('/toggle/v/dislike/:videoId').post(toggleVideoDislike);

// Like and dislike comment
router.route('/toggle/c/like/:commentId').post(toggleCommentLike);
router.route('/toggle/c/dislike/:commentId').post(toggleCommentDislike);

export default router;
