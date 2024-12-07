import jwt from 'jsonwebtoken';
import { catchAsync } from './catchAsync.js';
import AppError from './appError.js';
import { User } from '../models/userModel.js';

export const signInToken = catchAsync(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header('Authorization').replace('Bearer', '');

    if (!token) {
      return next(new AppError('Unauthorized request', 401));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_GENERATE_SECRET);

    const user = await User.findById(decoded?._id).select(
      '-password -refreshToken'
    );

    if (!user) {
      return next(new AppError('Invalid access token', 401));
    }

    req.user = user;

    next();
  } catch (error) {
    return next(new AppError('Invalid access Token' || error.message, 401));
  }
});
