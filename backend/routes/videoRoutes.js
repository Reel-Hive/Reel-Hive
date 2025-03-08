import express from 'express';
import { protect } from '../middlewares/protect.js';
import { Upload } from '../middlewares/multer.js';
import {
  getVideoById,
  publishVideo,
  getAllVideos,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  getUserVideos,
} from '../controllers/videoController.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getAllVideos)
  .post(
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

router
  .route('/:videoId')
  .get(getVideoById)
  .patch(Upload.single('thumbnail'), updateVideo)
  .delete(deleteVideo);

router.route('/:username/getUserVideos').get(getUserVideos);
router.route('/toggle/publish/:videoId').patch(togglePublishStatus);
export default router;
