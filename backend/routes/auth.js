const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const CONFIG = require('../config');

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('Received login request:', req.body);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    console.log('Looking up user:', email);
    const user = await User.findOne({ email });
    console.log('User found:', user ? 'yes' : 'no');

    if (!user) {
      return res.status(400).json({ message: 'User does not exist' });
    }

    try {
      console.log('Starting password comparison...');
      const isMatch = await user.comparePassword(password);
      console.log('Password comparison finished, result:', isMatch);
      
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect password' });
      }
    } catch (bcryptError) {
      console.error('Password comparison error:', bcryptError);
      return res.status(500).json({ message: 'Password verification failed', error: bcryptError.message });
    }

    console.log('Generating JWT token...');
    const token = jwt.sign({ userId: user._id, role: user.role }, CONFIG.JWT_SECRET, { expiresIn: CONFIG.JWT_EXPIRES_IN });
    console.log('Token generated successfully');

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        donateuser: user.donateuser
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('Received registration request:', req.body);
    
    const { username, email, password, confirmPassword } = req.body;
    
    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required information' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Password and confirmation password do not match' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // Check whether user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'This email is already registered' });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      role: 'user',
      donateuser: 'no'
    });

    console.log('Saving user...');
    await user.save();
    console.log('User saved successfully');

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, CONFIG.JWT_SECRET, { expiresIn: CONFIG.JWT_EXPIRES_IN });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        donateuser: user.donateuser
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Get current user info
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, CONFIG.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User does not exist' });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      donateuser: user.donateuser
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(401).json({ message: 'Unauthorized', error: error.message });
  }
});

// PUT update current user's username
router.put('/me/profile', async (req, res) => {
  try {
    // 1. Validate token and get user ID (this normally belongs in auth middleware)
    // We parse token manually here; if auth middleware is already applied to /api/auth, req.user can be used directly
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied.' });
    }
    let decoded;
    try {
      decoded = jwt.verify(token, CONFIG.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Token is not valid.' });
    }

    const userId = decoded.userId;
    const { username } = req.body;

    if (!username || typeof username !== 'string' || username.trim() === '') {
      return res.status(400).json({ message: 'Username is required and must be a non-empty string.' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.username = username.trim();
    await user.save();

    // Return updated user info (without password), consistent with /me response
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      donateuser: user.donateuser
      // If AuthContext needs favorites, return it here as well
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    res.status(500).json({ message: 'Server error while updating profile.' });
  }
});

module.exports = router; 