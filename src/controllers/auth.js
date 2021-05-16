const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const { jwtCookieExpiresIn } = require('../config');

// @desc Register user
// @route POST /api/v1/auth/register
// @access Public
exports.register = asyncHandler(async (req, res, next) => {
  const { firstname, lastname, email, password, role } = req.body;

  try {
    const user = await User.create({
      firstname,
      lastname,
      email,
      password,
      role,
    });

    res.status(200).json({
      success: true,
      // eslint-disable-next-line no-underscore-dangle
      id: user._id,
    });
  } catch (error) {
    next(error);
  }
});

const sendTokenResponse = (user, expires, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: expires
      ? new Date(Date.now() + jwtCookieExpiresIn * 24 * 60 * 60 * 1000)
      : false,
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      data: {
        email: user.email,
        jwt: token,
      },
    });
};

// @desc Login user
// @route POST /api/v1/auth/login
// @access Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password, expires } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Login Failed.', 401));
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Login Failed.', 401));
  }

  sendTokenResponse(user, expires, 200, res);
  return next();
});

// @desc Get current logged in user
// @route GET /api/v1/auth/currentUser
// @access Private
exports.getCurrentUser = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc Logout current user
// @route GET /api/v1/auth/logout
// @access Private
exports.logout = asyncHandler(async (req, res, next) => {
  const options = {
    expires: new Date(Date.now() + 1 * 1000),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(200).cookie('token', 'loggedOut', options).json({
    success: true,
    message: 'User logged out.',
  });

  next();
});
