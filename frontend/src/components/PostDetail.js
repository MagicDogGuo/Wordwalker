import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material';
import httpClient from '../config/httpClient';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';
import CommentList from './CommentList';
import SubscribeForm from './SubscribeForm';
import './PostDetail.css';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const isAdmin = user?.role === 'admin';
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id, user]);

  useEffect(() => {
    console.log(`[PostDetail Diagnostics - Heart Color] isLiked state changed to: ${isLiked}. Heart should now be ${isLiked ? 'RED' : 'DEFAULT'}.`);
  }, [isLiked]);

  const fetchPost = async () => {
    console.log('[PostDetail Diagnostics] fetchPost function called.');
    setLoading(true);
    setError('');
    try {
      const apiUrl = API_ENDPOINTS.POSTS.DETAIL(id);
      console.log(`[PostDetail Diagnostics] Attempting to fetch post from: ${apiUrl}`);
      const response = await httpClient.get(apiUrl);
      const postData = response.data;
      
      console.log('[PostDetail Diagnostics] Fetched post data:', JSON.stringify(postData));

      setPost(postData);
      setEditForm({
        title: postData.title,
        content: postData.content,
        tags: postData.tags || []
      });

      console.log('[PostDetail Diagnostics] Initializing like status. User:', JSON.stringify(user));
      console.log('[PostDetail Diagnostics] Post data for likes:', JSON.stringify(postData?.likes));

      if (user && user.id && postData && postData.likes) {
        const currentUserIdStr = String(user.id);
        const likesArray = Array.isArray(postData.likes) ? postData.likes : [];
        let likedByCurrentUser = false;
        console.log(`[PostDetail Diagnostics] Current User ID: ${currentUserIdStr}, Likes Array on post:`, JSON.stringify(likesArray));

        for (const likeItem of likesArray) {
          if (likeItem && typeof likeItem === 'object' && 
              likeItem.user && typeof likeItem.user === 'object' && 
              likeItem.user._id !== undefined) {
            const likedUserId = String(likeItem.user._id);
            console.log(`[PostDetail Diagnostics] Comparing: Item User ID (from likeItem.user._id): ${likedUserId}, Current User ID: ${currentUserIdStr}`);
            if (likedUserId === currentUserIdStr) {
              likedByCurrentUser = true;
              console.log(`[PostDetail Diagnostics] Match found for user ${currentUserIdStr} in post ${postData._id}`);
              break;
            }
          } else {
            console.warn('[PostDetail Diagnostics] Encountered likeItem with unexpected structure:', JSON.stringify(likeItem));
          }
        }
        setIsLiked(likedByCurrentUser);
        setLikeCount(likesArray.length);
        console.log(`[PostDetail Diagnostics] Initialized isLiked: ${likedByCurrentUser}, likeCount: ${likesArray.length}`);
      } else {
        setIsLiked(false);
        const currentLikesLength = postData.likes ? postData.likes.length : 0;
        setLikeCount(currentLikesLength);
        console.log(`[PostDetail Diagnostics] User or post data for likes missing or invalid. Initialized isLiked: false, likeCount: ${currentLikesLength}`);
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch post:", error.response ? error.response.data : error.message);
      setError('Failed to fetch post. Please try refreshing the page.');
      setLoading(false);
    }
  };

  const handleDeletePost = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await httpClient.delete(API_ENDPOINTS.POSTS.DELETE(id));
        navigate('/posts');
      } catch (error) {
        setError('Failed to delete post');
        console.error('Error deleting post in PostDetail:', error.response ? error.response.data : error.message, error);
      }
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleEditClose = () => {
    setIsEditing(false);
    setEditForm({
      title: post.title,
      content: post.content,
      tags: post.tags || []
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      setEditForm(prev => ({
        ...prev,
        tags: [...new Set([...prev.tags, tagInput.trim()])]
      }));
      setTagInput('');
    }
  };

  const handleDeleteTag = (tagToDelete) => {
    setEditForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToDelete)
    }));
  };

  const handleSaveEdit = async () => {
    try {
      await httpClient.put(API_ENDPOINTS.POSTS.UPDATE(id), editForm);
      await fetchPost();
      setIsEditing(false);
    } catch (error) {
      setError('Failed to update post');
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (isLiking) {
      return;
    }

    const originalIsLiked = isLiked;
    const originalLikeCount = likeCount;

    setIsLiking(true);
    // Optimistic update
    setIsLiked(!originalIsLiked);
    setLikeCount(prevCount => !originalIsLiked ? prevCount + 1 : Math.max(0, prevCount - 1));

    try {
      const response = await httpClient.post(API_ENDPOINTS.POSTS.LIKE(id), {});

      if (response.data && response.data.likeCount !== undefined) {
        setLikeCount(response.data.likeCount);
      }
      // isLiked state relies on optimistic update
    } catch (error) {
      console.error('[PostDetail Diagnostics] Error in handleLike:', error.response ? error.response.data : error.message);
      setError('Operation failed, please try again later');
      // Rollback optimistic update
      setIsLiked(originalIsLiked);
      setLikeCount(originalLikeCount);
    } finally {
      setIsLiking(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!post) return <div>Post not found</div>;

  const canManagePost = isAdmin || (user && post.author?._id === user.id);

  return (
    <div className="post-detail">
      <Container maxWidth="md">
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/posts')}
            className="back-button"
            color="button_donate"
          >
            Back to Posts
          </Button>
          
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {post.title}
              </Typography>
              {canManagePost && (
                <Box>
                  <Tooltip title="Edit Post">
                    <IconButton onClick={handleEditClick} color="primary">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Post">
                    <IconButton onClick={handleDeletePost} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>

            <Typography color="textSecondary" gutterBottom>
              Author: {post.author?.username || 'Unknown'}
            </Typography>
            
            <Typography color="textSecondary" sx={{ mb: 2 }}>
              Published: {new Date(post.createdAt).toLocaleString()}
            </Typography>

            {post.tags && post.tags.length > 0 && (
              <Box sx={{ mb: 3 }}>
                {post.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    color="tag_color" //primary
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            )}

            {/* Display Post Image if imageUrl exists */}
            {post.imageUrl && (
              <Box className="post-detail-image-container">
                <img 
                  src={post.imageUrl} 
                  alt={post.title} 
                  className="post-detail-image"
                />
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, mb: 2 }}>
              <Tooltip title={isLiked ? "Unlike" : "Like"}>
                <span style={{ display: 'inline-flex', alignItems: 'center' }}> 
                  <IconButton 
                    onClick={handleLike} 
                    disabled={isLiking}
                    sx={{
                      color: isLiked ? '#ff4081' : 'inherit',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 64, 129, 0.08)'
                      },
                      '&:disabled': {
                        opacity: 0.7
                      }
                    }}
                  >
                    {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                </span>
              </Tooltip>
              <Typography 
                variant="body2" 
                sx={{ 
                  ml: 1, 
                  color: isLiked ? '#ff4081' : 'text.secondary',
                  fontWeight: isLiked ? 'bold' : 'normal',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                {likeCount} {likeCount === 1 ? 'like' : 'likes'}
              </Typography>
            </Box>

            <Typography variant="body1" component="div" sx={{ mb: 4 }}>
              {post.content}
            </Typography>
          </Paper>

          {/* Comments section */}
          <Box sx={{ mt: 4 }}>
            <CommentList postId={id} />
          </Box>

          {/* Newsletter subscription */}
          <Box sx={{ mt: 4 }}>
            <SubscribeForm />
          </Box>
        </Box>
      </Container>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onClose={handleEditClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Post</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Title"
              name="title"
              value={editForm.title}
              onChange={handleEditChange}
              required
              fullWidth
            />
            <TextField
              label="Content"
              name="content"
              value={editForm.content}
              onChange={handleEditChange}
              required
              multiline
              rows={6}
              fullWidth
            />
            <TextField
              label="Add Tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleAddTag}
              placeholder="Press Enter to add a tag"
              fullWidth
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {editForm.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleDeleteTag(tag)}
                  color="tag_color" //primary
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PostDetail; 