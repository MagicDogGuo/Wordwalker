const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const subscriberRoutes = require('./routes/subscribers');
const aiImageRoutes = require('./routes/aiImageRoutes');
const initData = require('./scripts/initData');

dotenv.config();

const app = express();

// Connect to MongoDB and initialize data
console.log('Connecting to MongoDB...');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connection successful');
    // Initialize data
    console.log('Starting to initialize data...');
    await initData();
    console.log('Data initialization completed');
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err);
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
  console.error(err.stack);
  res.status(500).json({ message: 'Server error' });
});

// 404 handling
app.use((req, res) => {
  res.status(404).json({ message: 'Requested resource not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; 