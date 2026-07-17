const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const CONFIG = require('./config');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const subscriberRoutes = require('./routes/subscribers');
const aiImageRoutes = require('./routes/aiImageRoutes');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

// This module only defines the Express app (middleware + routes + error
// handling). It does NOT connect to MongoDB, start listening, or touch
// process.exit/signals - that all lives in server.js. Keeping side effects out
// of this module makes it possible to import/test the app without needing a
// live DB connection or an open port.
const app = express();

// Security & rate-limiting middleware
app.use(helmet());
app.use(cors({ origin: CONFIG.CLIENT_URL }));
app.use(express.json());
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/ai', aiImageRoutes);

// 404 handling (must come after all routes, before the central error handler)
app.use((req, res) => {
  res.status(404).json({ message: 'Requested resource not found' });
});

// Central error handler - every route forwards errors here via asyncHandler/next(err)
// instead of formatting error responses ad-hoc (see middleware/errorHandler.js).
app.use(errorHandler);

module.exports = app;
