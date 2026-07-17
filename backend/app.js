const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const CONFIG = require('./config');
const logger = require('./utils/logger');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const subscriberRoutes = require('./routes/subscribers');
const aiImageRoutes = require('./routes/aiImageRoutes');
const initData = require('./scripts/initData');

const app = express();

// Connect to MongoDB and initialize data
logger.info('Connecting to MongoDB...');

mongoose.connect(CONFIG.MONGODB_URI)
  .then(async () => {
    logger.info('MongoDB connection successful');
    // Initialize data
    logger.info('Starting to initialize data...');
    await initData();
    logger.info('Data initialization completed');
  })
  .catch(err => {
    logger.error('MongoDB connection failed:', err);
    process.exit(1);
  });

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/ai', aiImageRoutes);

// Error handling
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ message: 'Server error' });
});

// 404 handling
app.use((req, res) => {
  res.status(404).json({ message: 'Requested resource not found' });
});

const PORT = CONFIG.PORT;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

module.exports = app; 