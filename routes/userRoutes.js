import express from 'express';
import {
  login,
  logout,
  signUp,
  updateAvatar,
  updateCoverImage,
  updateDetails,
  updatePassword,
  Upload,
} from '../controllers/authController.js';
import { protect } from '../utils/protect.js';

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

export default router;
