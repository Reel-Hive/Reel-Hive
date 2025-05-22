import express from 'express';
import {
  login,
  logout,
  signUp,
  updateAvatar,
  updateCoverImage,
  updateDetails,
  updatePassword,
} from '../controllers/authController.js';
import {
  deleteUser,
  getAllUsers,
  getMe,
  getUser,
  getUserChannelProfile,
  getWatchHistory,
} from '../controllers/userController.js';
import { protect } from '../middlewares/protect.js';
import { Upload } from '../middlewares/multer.js';

const router = express.Router();

router.route('/signup').post(
  Upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
  ]),
  signUp
);
router.route('/login').post(login);
router.route('/logout').post(protect, logout);

// Update Routes
router.route('/update-password').patch(protect, updatePassword);
router.route('/update-details').patch(protect, updateDetails);
router
  .route('/update-avatar')
  .patch(protect, Upload.single('avatar'), updateAvatar);

router
  .route('/update-coverImage')
  .patch(protect, Upload.single('coverImage'), updateCoverImage);

// user Routes --> personal route
router.route('/me').get(protect, getMe);
router.route('/getAllUsers').get(getAllUsers);
router.route('/:id').get(protect, getUser);
router.route('/deleteMe').delete(protect, deleteUser);
router.route('/c/:username').get(protect, getUserChannelProfile);
router.route('/:userId/getHistory').get(protect, getWatchHistory);

export default router;
