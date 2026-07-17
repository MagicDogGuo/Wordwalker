const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { auth, isAdmin } = require('../middleware/auth');
const User = require('../models/User');

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// NOTE: routes with static/specific path segments (e.g. /me/favorites, /tag/:tagName)
// must be declared BEFORE the generic '/:id' route below, otherwise Express will
// match them against '/:id' first and treat e.g. "me" or "tag" as a post id.

// GET all posts liked (favorited) by current user
router.get('/me/favorites', auth, async (req, res) => {
  try {
    // req.user._id should be set by auth middleware after token parsing
    const userId = req.user._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authorized or user ID is invalid' });
    }

    // Find all posts where likes[].user equals userId
    const favoritePosts = await Post.find({ 'likes.user': userId })
                                    .populate('author', 'username email') // Populate author's username and email
                                    .sort({ createdAt: -1 });     // Sort by creation time descending

    res.json(favoritePosts);
  } catch (error) {
    console.error('Error fetching favorite posts:', error);
    res.status(500).json({ message: 'Failed to fetch favorite posts. Please try again later.' });
  }
});

// GET all posts published by current user
router.get('/me/myposts', auth, async (req, res) => {
  try {
    const userId = req.user._id; // Get user ID from auth middleware

    if (!userId) {
      return res.status(401).json({ message: 'User not authorized or user ID is invalid' });
    }

    const userPosts = await Post.find({ author: userId })
                                .populate('author', 'username email') // Populate author info
                                .sort({ createdAt: -1 });     // Sort by creation time descending

    res.json(userPosts);
  } catch (error) {
    console.error('Error fetching user\'s posts:', error);
    res.status(500).json({ message: 'Failed to fetch user\'s posts. Please try again later.' });
  }
});

// New: get posts by tag name
router.get('/tag/:tagName', async (req, res) => {
  try {
    const tagName = req.params.tagName;
    // Find posts whose tags array contains tagName
    // Assumes stored tagName casing matches the incoming value
    const posts = await Post.find({ tags: tagName })
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    if (!posts || posts.length === 0) {
      // No posts is not strictly an error; return empty array or a custom message
      // return res.status(404).json({ message: `No posts found with tag: ${tagName}` });
      return res.json([]); // Returning an empty array is more common
    }

    res.json(posts);
  } catch (error) {
    console.error(`Error fetching posts by tag ${req.params.tagName}:`, error);
    res.status(500).json({ message: 'Failed to fetch posts by tag. Please try again later.' });
  }
});

// New: get all unique tags
router.get('/tags/unique', async (req, res) => {
  try {
    const uniqueTags = await Post.distinct('tags');
    // distinct() returns an array of all unique tags
    // Example: ["Tech", "Health", "AI", "Science"]
    res.json(uniqueTags.sort()); // Return sorted alphabetically
  } catch (error) {
    console.error('Error fetching unique tags:', error);
    res.status(500).json({ message: 'Failed to fetch unique tags. Please try again later.' });
  }
});

// Get a single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username')
      .populate('likes.user', 'username');

    if (!post) {
      return res.status(404).json({ message: 'Post does not exist' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create post
router.post('/', auth, async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update post
router.put('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post does not exist' });
    }

    // Check if the user is the author or an admin
    if (post.author.toString() !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to edit this post' });
    }

    const { title, content, imageUrl, tags } = req.body;

    if (title) post.title = title;
    if (content) post.content = content;
    if (imageUrl) post.imageUrl = imageUrl;
    if (tags) post.tags = tags;

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post does not exist' });
    }

    // Check if the user is the author or an admin
    if (post.author.toString() !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Favorite/unfavorite post
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post does not exist' });
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like/unlike post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post does not exist' });
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
