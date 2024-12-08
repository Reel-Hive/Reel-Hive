import { catchAsync } from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { User } from '../models/userModel.js';
import sendEmail from '../utils/email.js';

export const getMe = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
};

export const getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find().select('-password');

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

export const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

export const deleteUser = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  // SEND EMAIL
  const message = `Dear ${user.name},\n\nYour account has been successfully deleted. We're sorry to see you go. If you have any feedback or questions, please contact our support team.\n\nBest regards,\nReel Hive Team`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Account deleted successfully',
      message,
    });
  } catch (error) {
    return next(
      new AppError('There was an error sending email. Try again later!', 500)
    );
  }

  res.status(200).json({
    status: 'success',
    data: null,
    message: 'Your account deleted successfully!',
  });
});
