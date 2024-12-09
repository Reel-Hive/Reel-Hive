import express from 'express';
import { protect } from '../middlewares/protect.js';
import { Upload } from '../middlewares/multer.js';
import { getVideoById, publishVideo } from '../controllers/videoController.js';

const router = express.Router();

router.route('/publish-video').post(
  protect,
  Upload.fields([
    {
      name: 'videoFile',
      maxCount: 1,
    },
    {
      name: 'thumbnail',
      maxCount: 1,
    },
  ]),
  publishVideo
);

router.route('/:videoId').get(protect, getVideoById);

export default router;
