import multer from 'multer';
import { catchAsync } from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { User } from '../models/userModel.js';
import uploadOnCloudinary from '../utils/cloudinary.js';

// CREATE FOR IMAGE STORE
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const Upload = multer({
  storage,
});

// signup controller For create a new user in database

export const signUp = catchAsync(async (req, res, next) => {
  // get user details from frontend
  const { name, email, password } = req.body;
  console.log('email: ', email);

  // check that field are not empty
  if ([name, email, password].some((field) => field?.trim() === '')) {
    return next(new AppError('All fields are required!', 400));
  }

  // Check alreay user exist
  const existedUser = await User.findOne({ email });

  if (existedUser) {
    return next(new AppError('User with this email already exists!', 409));
  }

  // Handle avatar upload
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    return next(new AppError('Avatar file is required!', 400));
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    return next(new AppError('Failed to upload avatar to Cloudinary', 500));
  }

  const user = await User.create({
    name,
    email,
    password,
    avatar: avatar.url,
  });

  const createdUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  if (!createdUser) {
    return next(
      new AppError('Something went wrong while registering the user', 400)
    );
  }

  return res.status(201).json({
    status: 'success',
    data: {
      name,
      email,
      password,
      avatar: avatar.url,
    },
  });
});
