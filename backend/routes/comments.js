const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

// Get all comments for a post
router.get('/post/:postId', asyncHandler(async (req, res) => {
  const comments = await Comment.find({
    postId: req.params.postId,
    isPublic: true
  })
    .populate('user', 'username _id')
    .sort({ createdAt: -1 });
  res.json(comments);
}));

// Create a new comment
router.post('/', auth, asyncHandler(async (req, res) => {
  const { postId, content } = req.body;

  // Check whether the post exists
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError('Post does not exist', 404);
  }

  const comment = new Comment({
    postId,
    user: req.user._id,
    content,
    isPublic: true
  });

  await comment.save();
  // Populate the user field before sending the response
  const populatedComment = await Comment.findById(comment._id).populate('user', 'username _id');
  res.status(201).json(populatedComment);
}));

// Update comment
router.put('/:id', auth, asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    throw new AppError('Comment does not exist', 404);
  }

  // Check permissions
  if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('You do not have permission to edit this comment', 403);
  }

  const { content, isPublic } = req.body;
  if (content) comment.content = content;
  if (isPublic !== undefined && req.user.role === 'admin') {
    comment.isPublic = isPublic;
  }

  await comment.save();
  res.json(comment);
}));

// Delete comment
router.delete('/:id', auth, asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    throw new AppError('Comment does not exist', 404);
  }

  // Check permissions
  if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('You do not have permission to delete this comment', 403);
  }

  await Comment.findByIdAndDelete(req.params.id);
  res.json({ message: 'Comment deleted' });
}));

// Get all comments by current user
router.get('/user', auth, asyncHandler(async (req, res) => {
  const comments = await Comment.find({ user: req.user._id })
    .populate('postId', 'title')
    .sort({ createdAt: -1 });
  res.json(comments);
}));

module.exports = router;
