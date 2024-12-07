import express from 'express';
import { signUp, Upload } from '../controllers/authController.js';

const router = express.Router();

router.route('/signup').post(Upload.single('avatar'), signUp);

export default router;
