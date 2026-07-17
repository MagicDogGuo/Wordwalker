const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Subscriber = require('../models/Subscriber');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');
const validate = require('../middleware/validate');
const schemas = require('../validation/schemas');

// Subscribe to newsletter
router.post('/', validate(schemas.subscribers.subscribe), asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Check whether already subscribed
  const existingSubscriber = await Subscriber.findOne({ email });
  if (existingSubscriber) {
    if (existingSubscriber.status === 'active') {
      throw new AppError('This mailbox is subscribed', 400);
    }
    // Re-subscribe
    existingSubscriber.status = 'active';
    await existingSubscriber.save();
    return res.json({ message: 'Re-subscribed successfully' });
  }

  const subscriber = new Subscriber({ email });
  await subscriber.save();
  res.status(201).json({ message: 'Subscribed successfully' });
}));

// Unsubscribe
router.put('/unsubscribe/:id', asyncHandler(async (req, res) => {
  const subscriber = await Subscriber.findById(req.params.id);
  if (!subscriber) {
    throw new AppError('Subscriber not found', 404);
  }

  subscriber.status = 'unsubscribed';
  await subscriber.save();
  res.json({ message: 'Unsubscribed successfully' });
}));

// Get all subscribers (admin only)
router.get('/', auth, asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    throw new AppError('No permission to access this resource', 403);
  }

  const subscribers = await Subscriber.find().sort({ subscribedAt: -1 });
  res.json(subscribers);
}));

// Update subscriber status (admin only)
router.put('/:id', auth, validate(schemas.subscribers.updateStatus), asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    throw new AppError('No permission to access this resource', 403);
  }

  const { status } = req.body;
  const subscriber = await Subscriber.findById(req.params.id);
  if (!subscriber) {
    throw new AppError('Subscriber not found', 404);
  }

  subscriber.status = status;
  await subscriber.save();
  res.json(subscriber);
}));

module.exports = router;
