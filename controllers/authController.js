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
    return next(
      new AppError('User with this email or username already exists!', 409)
    );
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

  let avatar, coverImage;
  try {
    avatar = await uploadOnCloudinary(avatarLocalPath, 'image');
    if (coverImageLocalPath) {
      coverImage = await uploadOnCloudinary(coverImageLocalPath, 'image');
    }
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    return next(new AppError('Failed to upload files to Cloudinary', 500));
  }
  // const avatar = await uploadOnCloudinary(avatarLocalPath.buffer, 'image');
  // const coverImage = await uploadOnCloudinary(
  //   coverImageLocalPath.buffer,
  //   'image'
  // );

  // if (!avatar) {
  //   return next(new AppError('Failed to upload avatar to Cloudinary', 500));
  // }

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
    secure: true, // Disable secure cookie since we are not usong HTTPS
    sameSite: 'Lax', // Allow cookie to be sent in the same origin context
    path: '/', // Ensure cookies are accessible site-wide
  };

  // SEND EMAIL
  const message = `
  <div style="font-family: Arial, sans-serif; padding: 30px; background-color: #0d1117; color: #ffffff; text-align: center; border-radius: 10px;">
    <h1 style="color: #ffcc00; font-size: 36px; font-weight: bold;">🎬 Welcome to <span style="color: #007bff;">Reel Hive</span>! 🚀</h1>
    <p style="font-size: 18px; color: #ddd;">Hey <strong>${user.name}</strong>,</p>
    <p style="font-size: 16px; color: #ccc; max-width: 600px; margin: auto;">
      🎉 You’ve just entered a world of creativity, entertainment, and endless possibilities.  
      <span style="color: #ffcc00;">Reel Hive</span> is where creators shine, communities grow, and the best videos come to life. 🌟  
    </p>

    <h2 style="color: #ffcc00; font-size: 24px; margin-top: 30px;">🚀 What Can You Do on Reel Hive?</h2>
    <div style="text-align: left; display: inline-block; max-width: 600px; font-size: 16px;">
      <p>🎥 <strong>Upload & Share Videos:</strong> Show your talent to the world in high quality.</p>
      <p>🔥 <strong>Discover Trending Content:</strong> Stay ahead with viral and must-watch videos.</p>
      <p>💬 <strong>Engage with the Community:</strong> Like, comment, and interact with your favorite creators.</p>
      <p>📢 <strong>Subscribe & Grow:</strong> Build your audience and follow amazing creators.</p>
      <p>✨ <strong>Personalized Experience:</strong> Get recommendations based on your interests.</p>
    </div>

    <h2 style="color: #007bff; font-size: 24px; margin-top: 30px;">🔹 Your Journey Starts Now!</h2>
    <p style="font-size: 16px; color: #bbb; max-width: 600px; margin: auto;">
      Start streaming, exploring, and creating today! Whether you’re here to **watch, share, or go viral**,  
      **Reel Hive** is the perfect place for you.  
    </p>

    <p style="margin-top: 30px;">
      <a href="https://uploadvidoes.netlify.app" style="display: inline-block; padding: 14px 28px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px;">🎥 Start Watching Now</a>
    </p>

    <hr style="border: 1px solid #333; margin: 30px 0;">

    <p style="font-size: 14px; color: #aaa;">
      Need any help? <a href="mailto:support@reelhive.com" style="color: #ffcc00; text-decoration: none;">Contact Support</a>
    </p>

    <p style="font-size: 14px; color: #aaa;">
      🚀 Keep creating, keep exploring, and let the <strong>Reel Hive</strong> community inspire you! 🌍
    </p>

    <p style="font-size: 16px; color: #ffcc00; font-weight: bold;">🎬 See you on Reel Hive! <br>The Reel Hive Team</p>
  </div>
`;

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
    secure: true, // Disable secure cookie since we are not usong HTTPS
    sameSite: 'None', // Allow cookie to be sent in the same origin context
    path: '/', // Ensure cookies are accessible site-wide
  };

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json({
      status: 'success',
      data: {
        loggedUser,
        refreshToken,
        accessToken,
      },
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
    secure: true, // Disable secure cookie since we are not usong HTTPS
    sameSite: 'Lax', // Allow cookie to be sent in the same origin context
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
  const message = `
  <div style="font-family: Arial, sans-serif; padding: 30px; background-color: #0d1117; color: #ffffff; text-align: center; border-radius: 10px;">
    <h1 style="color: #ffcc00; font-size: 36px; font-weight: bold;">🔒 Password Updated Successfully!</h1>
    
    <p style="font-size: 18px; color: #ddd;">Hey <span style="color: #00bfff; font-weight: bold;">${user.name}</span>,</p>
    
    <p style="font-size: 16px; color: #ccc; max-width: 600px; margin: auto;">
      Your password has been changed successfully! 🔐  
      For security reasons, we want to make sure it was <span style="color: #ff4d4d; font-weight: bold;">YOU</span> who made this update.  
    </p>

    <h2 style="color: #ffcc00; font-size: 24px; margin-top: 30px;">⚡ Important Update:</h2>
    <div style="text-align: left; display: inline-block; max-width: 600px; font-size: 16px;">
      <p>✅ <span style="color: #00ff99; font-weight: bold;">New Password Set:</span> Your new password is now active.</p>
      <p>🚨 <span style="color: #ff4d4d; font-weight: bold;">Didn't request this change?</span> Contact our support team immediately.</p>
      <p>💡 <span style="color: #00bfff; font-weight: bold;">Security Tip:</span> Always use a strong & unique password.</p>
    </div>

    <h2 style="color: #007bff; font-size: 24px; margin-top: 30px;">🔐 Stay Secure with These Tips</h2>

    <p style="font-size: 16px; color: #bbb; max-width: 600px; margin: auto;">
      🔑 <span style="color: #ffcc00; font-weight: bold;">Enable Two-Factor Authentication</span> for extra protection.  
    </p>

    <p style="font-size: 16px; color: #bbb; max-width: 600px; margin: auto;">
      🚫 <span style="color: #ff4d4d; font-weight: bold;">Never share your password</span> with anyone—even our team.  
    </p>

    <p style="font-size: 16px; color: #bbb; max-width: 600px; margin: auto;">
      🔄 <span style="color: #00bfff; font-weight: bold;">Update your password regularly</span> to keep your account safe.  
    </p>

    <p style="margin-top: 30px;">
      <a href="https://uploadvidoes.netlify.app" style="display: inline-block; padding: 14px 28px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px;">🔐 Review Security Settings</a>
    </p>

    <hr style="border: 1px solid #333; margin: 30px 0;">

    <p style="font-size: 14px; color: #aaa;">
      Need help? <a href="mailto:support@reelhive.com" style="color: #ffcc00; text-decoration: none;">Contact Support</a>
    </p>

    <p style="font-size: 14px; color: #aaa;">
      🚀 Keep streaming, keep exploring, and stay safe on <span style="color: #00bfff; font-weight: bold;">Reel Hive</span>!  
    </p>

    <p style="font-size: 16px; color: #ffcc00; font-weight: bold;">🎬 See you on Reel Hive! <br>The Reel Hive Team</p>
  </div>
`;

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
  const message = `
  <div style="font-family: Arial, sans-serif; padding: 30px; background-color: #0d1117; color: #ffffff; text-align: center; border-radius: 10px;">
    <h1 style="color: #ffcc00; font-size: 36px; font-weight: bold;">✅ Account Details Updated!</h1>
    
    <p style="font-size: 18px; color: #ddd;">Hey <span style="color: #00bfff; font-weight: bold;">${
      user.name
    }</span>,</p>
    
    <p style="font-size: 16px; color: #ccc; max-width: 600px; margin: auto;">
      Your account details have been successfully updated! 🛠️  
      If you made these changes, no further action is needed. If not, please <span style="color: #ff4d4d; font-weight: bold;">contact us immediately!</span> 🚨  
    </p>

    <h2 style="color: #ffcc00; font-size: 24px; margin-top: 30px;">🔹 What's Updated?</h2>
    <div style="text-align: left; display: inline-block; max-width: 600px; font-size: 16px;">
      <p>📝 <span style="color: #00ff99; font-weight: bold;">Name:</span> ${
        user.name
      }</p>
      <p>👤 <span style="color: #00ff99; font-weight: bold;">Username:</span> ${
        user.username
      }</p>
      <p>🕒 <span style="color: #00bfff; font-weight: bold;">Updated On:</span> ${new Date().toLocaleString()}</p>
    </div>

    <h2 style="color: #007bff; font-size: 24px; margin-top: 30px;">⚡ Important Security Reminder</h2>

    <p style="font-size: 16px; color: #bbb; max-width: 600px; margin: auto;">
      🔑 <span style="color: #ffcc00; font-weight: bold;">Ensure your email & username are correct</span> to avoid login issues.  
    </p>

    <p style="font-size: 16px; color: #bbb; max-width: 600px; margin: auto;">
      🚫 <span style="color: #ff4d4d; font-weight: bold;">If you didn’t request these changes</span>, contact our support team immediately.  
    </p>

    <p style="font-size: 16px; color: #bbb; max-width: 600px; margin: auto;">
      📌 <span style="color: #00bfff; font-weight: bold;">Keep your profile updated</span> for a better experience on Reel Hive.  
    </p>

    <p style="margin-top: 30px;">
      <a href="https://uploadvidoes.netlify.app" style="display: inline-block; padding: 14px 28px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px;">🔧 Manage Your Profile</a>
    </p>

    <hr style="border: 1px solid #333; margin: 30px 0;">

    <p style="font-size: 14px; color: #aaa;">
      Need help? <a href="mailto:support@reelhive.com" style="color: #ffcc00; text-decoration: none;">Contact Support</a>
    </p>

    <p style="font-size: 14px; color: #aaa;">
      🚀 Keep streaming, keep exploring, and stay secure on <span style="color: #00bfff; font-weight: bold;">Reel Hive</span>!  
    </p>

    <p style="font-size: 16px; color: #ffcc00; font-weight: bold;">🎬 See you on Reel Hive! <br>The Reel Hive Team</p>
  </div>
`;

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

  const avatar = await uploadOnCloudinary(avatarLocalPath, 'image');
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
  const message = `
  <div style="font-family: Arial, sans-serif; padding: 30px; background-color: #0d1117; color: #ffffff; text-align: center; border-radius: 10px;">
    <h1 style="color: #ffcc00; font-size: 36px; font-weight: bold;">🖼️ Avatar Updated Successfully!</h1>
    
    <p style="font-size: 18px; color: #ddd;">Hey <span style="color: #00bfff; font-weight: bold;">${user.name}</span>,</p>
    
    <p style="font-size: 16px; color: #ccc; max-width: 600px; margin: auto;">
      Your profile avatar has been successfully updated! 🎉  
      A fresh new look makes your Reel Hive experience even better. 🌟  
      If you didn’t make this change, <span style="color: #ff4d4d; font-weight: bold;">contact us immediately!</span> 🚨  
    </p>

    <h2 style="color: #ffcc00; font-size: 24px; margin-top: 30px;">📸 Your New Avatar</h2>
    <img src="${avatar.url}" alt="New Avatar" 
  style="border-radius: 50%; width: 120px; height: 120px; border: 3px solid #ffcc00; margin: 15px auto; 
  display: block; object-fit: cover; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);">


    <h2 style="color: #007bff; font-size: 24px; margin-top: 30px;">⚡ Keep Your Profile Updated</h2>

    <p style="font-size: 16px; color: #bbb; max-width: 600px; margin: auto;">
      ✅ <span style="color: #00ff99; font-weight: bold;">A good profile picture</span> helps others recognize you.  
    </p>

    <p style="font-size: 16px; color: #bbb; max-width: 600px; margin: auto;">
      🚀 <span style="color: #ffcc00; font-weight: bold;">Express yourself</span> with a stylish avatar!  
    </p>

    <p style="font-size: 16px; color: #bbb; max-width: 600px; margin: auto;">
      🔐 <span style="color: #ff4d4d; font-weight: bold;">Didn’t update your avatar?</span> Contact us immediately!  
    </p>

    <p style="margin-top: 30px;">
      <a href="https://uploadvidoes.netlify.app" style="display: inline-block; padding: 14px 28px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px;">🔧 Manage Your Profile</a>
    </p>

    <hr style="border: 1px solid #333; margin: 30px 0;">

    <p style="font-size: 14px; color: #aaa;">
      Need help? <a href="mailto:support@reelhive.com" style="color: #ffcc00; text-decoration: none;">Contact Support</a>
    </p>

    <p style="font-size: 14px; color: #aaa;">
      🚀 Keep streaming, keep exploring, and stay stylish on <span style="color: #00bfff; font-weight: bold;">Reel Hive</span>!  
    </p>

    <p style="font-size: 16px; color: #ffcc00; font-weight: bold;">🎬 See you on Reel Hive! <br>The Reel Hive Team</p>
  </div>
`;

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

  const coverImage = await uploadOnCloudinary(coverImageLocalPath, 'image');
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
  const message = `
  <div style="font-family: Arial, sans-serif; padding: 30px; background-color: #0d1117; color: #ffffff; text-align: center; border-radius: 10px;">
    <h1 style="color: #ffcc00; font-size: 36px; font-weight: bold;">🖼️ Cover Image Updated Successfully!</h1>

    <p style="font-size: 18px; color: #ddd;">Hey <span style="color: #00bfff; font-weight: bold;">${user.name}</span>,</p>

    <p style="font-size: 16px; color: #ccc; max-width: 600px; margin: auto;">
      Your cover image has been updated! 🚀 Now your profile looks even better.  
      If you made this change, enjoy your fresh look! If not, please <span style="color: #ff4d4d; font-weight: bold;">contact us immediately!</span> 🚨  
    </p>

    <h2 style="color: #ffcc00; font-size: 24px; margin-top: 30px;">🔹 Your New Cover Image</h2>

    <div style="max-width: 600px; margin: auto; padding: 15px; background-color: #222; border-radius: 8px;">
      <img src="${coverImage.url}" alt="Cover Image" style="width: 100%; border-radius: 8px; box-shadow: 0px 4px 10px rgba(255, 204, 0, 0.5);">
    </div>

    <h2 style="color: #007bff; font-size: 24px; margin-top: 30px;">⚡ Quick Tips for a Perfect Cover</h2>

    <p style="font-size: 16px; color: #32cd32; max-width: 600px; margin: auto;">
      ✅ Make sure your cover image is <span style="color: #ffcc00; font-weight: bold;">high-quality</span> and <span style="color: #ffcc00; font-weight: bold;">properly visible</span> without scratches.  
    </p>

    <p style="font-size: 16px; color: #32cd32; max-width: 600px; margin: auto;">
      🎨 <span style="color: #ffcc00; font-weight: bold;">Use a clean and aesthetic image</span> to make your profile look professional.  
    </p>

    <p style="font-size: 16px; color: #32cd32; max-width: 600px; margin: auto;">
      🚫 If you see any issue in the image display, <span style="color: #ff4d4d; font-weight: bold;">try re-uploading</span> a higher resolution image.  
    </p>

    <p style="margin-top: 30px;">
      <a href="https://uploadvidoes.netlify.app" style="display: inline-block; padding: 14px 28px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px;">📷 Change Cover Again</a>
    </p>

    <hr style="border: 1px solid #333; margin: 30px 0;">

    <p style="font-size: 14px; color: #aaa;">
      Need help? <a href="mailto:support@reelhive.com" style="color: #ffcc00; text-decoration: none;">Contact Support</a>
    </p>

    <p style="font-size: 14px; color: #aaa;">
      🚀 Keep streaming, keep exploring, and make your profile shine on <span style="color: #00bfff; font-weight: bold;">Reel Hive</span>!  
    </p>

    <p style="font-size: 16px; color: #ffcc00; font-weight: bold;">🎬 See you on Reel Hive! <br>The Reel Hive Team</p>
  </div>
`;

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
