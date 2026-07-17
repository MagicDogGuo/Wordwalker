const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const CONFIG = require('../config');
const { auth } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

function signToken(user) {
  return jwt.sign(
    { userId: user._id, role: user.role },
    CONFIG.JWT_SECRET,
    { expiresIn: CONFIG.JWT_EXPIRES_IN }
  );
}

function toPublicUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    donateuser: user.donateuser
  };
}

// Login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // Never log the raw request body here - it contains the plaintext password.
  logger.debug(`Login attempt for email: ${email}`);

  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('User does not exist', 400);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Incorrect password', 400);
  }

  const token = signToken(user);

  res.json({
    token,
    user: toPublicUser(user)
  });
}));

// Register
router.post('/register', asyncHandler(async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  // Never log the raw request body here - it contains the plaintext password.
  logger.debug(`Registration attempt for email: ${email}`);

  if (!username || !email || !password) {
    throw new AppError('Please provide all required information', 400);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters long', 400);
  }

  if (password !== confirmPassword) {
    throw new AppError('Password and confirmation password do not match', 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError('Please provide a valid email address', 400);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('This email is already registered', 400);
  }

  const user = new User({
    username,
    email,
    password,
    role: 'user',
    donateuser: 'no'
  });
  await user.save();

  const token = signToken(user);

  res.status(201).json({
    message: 'Registration successful',
    token,
    user: toPublicUser(user)
  });
}));

// Get current user info
router.get('/me', auth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  if (!user) {
    throw new AppError('User does not exist', 404);
  }

  res.json(toPublicUser(user));
}));

// PUT update current user's username
router.put('/me/profile', auth, asyncHandler(async (req, res) => {
  const { username } = req.body;

  if (!username || typeof username !== 'string' || username.trim() === '') {
    throw new AppError('Username is required and must be a non-empty string.', 400);
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  user.username = username.trim();
  await user.save();

  // Return updated user info (without password), consistent with /me response
  res.json(toPublicUser(user));
}));

module.exports = router;
