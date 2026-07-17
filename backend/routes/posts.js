const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');
const validate = require('../middleware/validate');
const schemas = require('../validation/schemas');

// Get all posts
router.get('/', asyncHandler(async (req, res) => {
  const posts = await Post.find()
    .populate('author', 'username')
    .sort({ createdAt: -1 });
  res.json(posts);
}));

// NOTE: routes with static/specific path segments (e.g. /me/favorites, /tag/:tagName)
// must be declared BEFORE the generic '/:id' route below, otherwise Express will
// match them against '/:id' first and treat e.g. "me" or "tag" as a post id.

// GET all posts liked (favorited) by current user
router.get('/me/favorites', auth, asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Find all posts where likes[].user equals userId
  const favoritePosts = await Post.find({ 'likes.user': userId })
    .populate('author', 'username email')
    .sort({ createdAt: -1 });

  res.json(favoritePosts);
}));

// GET all posts published by current user
router.get('/me/myposts', auth, asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const userPosts = await Post.find({ author: userId })
    .populate('author', 'username email')
    .sort({ createdAt: -1 });

  res.json(userPosts);
}));

// Get posts by tag name
router.get('/tag/:tagName', asyncHandler(async (req, res) => {
  const { tagName } = req.params;
  // Assumes stored tagName casing matches the incoming value
  const posts = await Post.find({ tags: tagName })
    .populate('author', 'username')
    .sort({ createdAt: -1 });

  // No posts is not an error condition; just return an empty array.
  res.json(posts);
}));

// Get all unique tags
router.get('/tags/unique', asyncHandler(async (req, res) => {
  const uniqueTags = await Post.distinct('tags');
  res.json(uniqueTags.sort());
}));

// Get a single post
router.get('/:id', asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'username')
    .populate('likes.user', 'username');

  if (!post) {
    throw new AppError('Post does not exist', 404);
  }

  res.json(post);
}));

// Create post
router.post('/', auth, validate(schemas.posts.create), asyncHandler(async (req, res) => {
  const { title, content, imageUrl, tags } = req.body;
  const post = new Post({
    title,
    content,
    author: req.user._id,
    imageUrl,
    tags: tags || []
  });

  await post.save();
  res.status(201).json(post);
}));

// Update post
router.put('/:id', auth, validate(schemas.posts.update), asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new AppError('Post does not exist', 404);
  }

  // Check if the user is the author or an admin
  if (post.author.toString() !== req.user._id && req.user.role !== 'admin') {
    throw new AppError('You do not have permission to edit this post', 403);
  }

  const { title, content, imageUrl, tags } = req.body;

  if (title) post.title = title;
  if (content) post.content = content;
  if (imageUrl) post.imageUrl = imageUrl;
  if (tags) post.tags = tags;

  await post.save();
  res.json(post);
}));

// Delete post
router.delete('/:id', auth, asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new AppError('Post does not exist', 404);
  }

  // Check if the user is the author or an admin
  if (post.author.toString() !== req.user._id && req.user.role !== 'admin') {
    throw new AppError('You do not have permission to delete this post', 403);
  }

  await post.deleteOne();
  res.json({ message: 'Post deleted' });
}));

// Favorite/unfavorite post
router.post('/:id/favorite', auth, asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new AppError('Post does not exist', 404);
  }

  const user = await User.findById(req.user._id);
  const favoriteIndex = user.favorites.indexOf(post._id);

  if (favoriteIndex === -1) {
    // Favorite post
    user.favorites.push(post._id);
    await user.save();
    res.json({ message: 'Post favorited' });
  } else {
    // Remove from favorites
    user.favorites.splice(favoriteIndex, 1);
    await user.save();
    res.json({ message: 'Favorite removed' });
  }
}));

// Like/unlike post
router.post('/:id/like', auth, asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new AppError('Post does not exist', 404);
  }

  const likeIndex = post.likes.findIndex(
    like => like.user.toString() === req.user._id.toString()
  );

  if (likeIndex === -1) {
    // Like
    post.likes.push({ user: req.user._id });
    await post.save();
    res.json({ message: 'Post liked' });
  } else {
    // Unlike
    post.likes.splice(likeIndex, 1);
    await post.save();
    res.json({ message: 'Like removed' });
  }
}));

module.exports = router;
