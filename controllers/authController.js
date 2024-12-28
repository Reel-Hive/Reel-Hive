import { catchAsync } from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { User } from '../models/userModel.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import sendEmail from '../utils/email.js';

// Generat access and refresh token
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new AppError('somthing went wrong while generating tokens', 400);
  }
};

export const signUp = catchAsync(async (req, res, next) => {
  // get user details from frontend
  const { name, email, password, username } = req.body;

  // check that field are not empty
  if ([name, email, password, username].some((field) => field?.trim() === '')) {
    return next(new AppError('All fields are required!', 400));
  }

  // Check alreay user exist
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    return next(new AppError('User with this email already exists!', 409));
  }

  // Handle avatar upload
  const avatarLocalPath = req.files?.avatar[0]?.buffer;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].buffer;
  }

  if (!avatarLocalPath) {
    return next(new AppError('Avatar file is required!', 400));
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath.buffer, 'image');
  const coverImage = await uploadOnCloudinary(
    coverImageLocalPath.buffer,
    'image'
  );

  if (!avatar) {
    return next(new AppError('Failed to upload avatar to Cloudinary', 500));
  }

  const user = await User.create({
    username,
    name,
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || '',
  });

  const createdUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  if (!createdUser) {
    return next(
      new AppError('Something went wrong while registering the user', 400)
    );
  }

  // Generate token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const options = {
    httpOnly: true,
    secure: false, // Set to true in production if using HTTPS
    sameSite: 'None', // Allow cookies for cross-origin requests
    path: '/', // Ensure cookies are accessible site-wide
  };

  // SEND EMAIL
  const message = `Welcome to Reel Hive! ${user.name}. we're excited to have you join our Platform.Hrere you can find usefully video.\n\nOnce agian, Thank you for sign up! We look forward to keeping you informed ith our latest  updates!\n\nBest regards,\nReel Hive Team`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Welcome to Our Platform',
      message,
    });
  } catch (error) {
    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }

  return res
    .status(201)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json({
      status: 'success',
      data: {
        createdUser,
      },
    });
});

export const login = catchAsync(async (req, res, next) => {
  // get user details form frontend
  const { email, password, username } = req.body;

  // check email field not empty
  if (!email) {
    return next(new AppError('email name is required!', 400));
  }
  // check user exist
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (!user) {
    return next(
      new AppError("User with this email or username  doesn't exist!", 404)
    );
  }
  // check passord correction
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    return next(new AppError('Password is incorrect', 401));
  }
  // Generate token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  const options = {
    httpOnly: true,
    secure: false, // Set to true in production if using HTTPS
    sameSite: 'None', // Allow cookies for cross-origin requests
    path: '/', // Ensure cookies are accessible site-wide
  };
  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json({
      status: 'success',
      loggedUser,
      refreshToken,
    });
});

export const logout = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: {
        refreshToken: 1, // this is remove the field from document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: false, // Set to true in production if using HTTPS
    sameSite: 'None', // Allow cookies for cross-origin requests
    path: '/', // Ensure cookies are accessible site-wide
  };

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json({
      status: 'success',
      message: 'Logged Out Successfully!',
    });
});

export const updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);
  if (!isPasswordCorrect) {
    return next(new AppError('Invalid Password incorrect', 400));
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  // Send email
  const message = `Hello ${user.name}! Your password updated successfully! If you don't have update password and getting this email then contact our team!\n\nBest regards,\nReel Hive team`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Updated Password',
      message,
    });
  } catch (error) {
    return next(
      new AppError('Error while sending email. Please try later!', 500)
    );
  }

  return res.status(200).json({
    status: 'success',
    message: 'password updated successfully',
  });
});

export const updateDetails = catchAsync(async (req, res, next) => {
  const { name, username } = req.body;
  if (!(name || username)) {
    return next(new AppError('Name filed is rquired', 400));
  }

  const updateFields = {};
  if (name) updateFields.name = name;
  if (username) updateFields.username = username;

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: updateFields,
    },
    {
      new: true,
    }
  ).select('-password');

  // Send email
  const message = `Hello ${user.name}! Your Details updated successfully! If you don't have update password and getting this email then contact our team!\n\nBest regards,\nReel Hive team`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Updated Details',
      message,
    });
  } catch (error) {
    return next(
      new AppError('Error hile sending email. Please try later!', 500)
    );
  }

  return res.status(200).json({
    status: 'success',
    message: 'Account details updated successfully!',
    user,
  });
});

export const updateAvatar = catchAsync(async (req, res, next) => {
  const avatarLocalPath = req.file?.buffer;

  if (!avatarLocalPath) {
    return next(new AppError('avatar field required!', 400));
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath.buffer, 'image');
  if (!avatar.url) {
    return next(new AppError('Error hile uploding avatar!', 400));
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select('-password');

  // Send email
  const message = `Hello ${user.name}! Your Avatar updated successfully! If you don't have update password and getting this email then contact our team!\n\nBest regards,\nReel Hive team`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Updated Avatar Image',
      message,
    });
  } catch (error) {
    return next(
      new AppError('Error hile sending email. Please try later!', 500)
    );
  }

  return res.status(200).json({
    status: 'sccess',
    message: 'Avatar updated successfully!',
    avatar: avatar.url,
  });
});

export const updateCoverImage = catchAsync(async (req, res, next) => {
  const coverImageLocalPath = req.file?.buffer;

  if (!coverImageLocalPath) {
    return next(new AppError('cover Image field required!', 400));
  }

  const coverImage = await uploadOnCloudinary(
    coverImageLocalPath.buffer,
    'image'
  );
  if (!coverImage.url) {
    return next(new AppError('Error hile uploding avatar!', 400));
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select('-password');

  // Send email
  const message = `Hello ${user.name}! Your Cover Image updated successfully! If you don't have update password and getting this email then contact our team!\n\nBest regards,\nReel Hive team`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Updated Cover Image',
      message,
    });
  } catch (error) {
    return next(
      new AppError('Error hile sending email. Please try later!', 500)
    );
  }

  return res.status(200).json({
    status: 'sccess',
    message: 'Cover Image updated successfully!',
    coverImage: coverImage.url,
  });
});
