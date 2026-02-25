const express = require('express');
const router = express.Router();
const { User } = require('../models');
const {
  generateTokens,
  authenticateToken,
  refreshTokenHandler,
} = require('../middleware/auth');
const { asyncHandler, APIError } = require('../middleware/errorHandler');
const { authLimiter } = require('../middleware/rateLimiter');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { username, email, password, fullName } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      throw new APIError('Username, email, and password are required', 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new APIError('Email already registered', 400);
      }
      if (existingUser.username === username) {
        throw new APIError('Username already taken', 400);
      }
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      profile: { fullName },
    });

    // Generate tokens
    const tokens = generateTokens(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toPublicJSON(),
        ...tokens,
      },
    });
  })
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw new APIError('Email and password are required', 400);
    }

    // Find user (include password for comparison)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new APIError('Invalid credentials', 401);
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      throw new APIError('Invalid credentials', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new APIError('Account is deactivated', 403);
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate tokens
    const tokens = generateTokens(user._id);

    // Remove password from response
    user.password = undefined;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toPublicJSON(),
        ...tokens,
      },
    });
  })
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', refreshTokenHandler);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/me',
  authenticateToken,
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      data: {
        user: req.user.toPublicJSON(),
      },
    });
  })
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { fullName, bio, avatar, settings } = req.body;

    const user = await User.findById(req.user._id);

    // Update profile
    if (fullName !== undefined) user.profile.fullName = fullName;
    if (bio !== undefined) user.profile.bio = bio;
    if (avatar !== undefined) user.profile.avatar = avatar;

    // Update settings
    if (settings) {
      if (settings.theme) user.settings.theme = settings.theme;
      if (settings.notifications !== undefined)
        user.settings.notifications = settings.notifications;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.toPublicJSON(),
      },
    });
  })
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client should delete tokens)
 * @access  Private
 */
router.post(
  '/logout',
  authenticateToken,
  asyncHandler(async (req, res) => {
    // In a stateless JWT system, logout is handled client-side
    // We just send a success response
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  })
);

module.exports = router;
