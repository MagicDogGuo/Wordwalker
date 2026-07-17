import React, { useState } from 'react';
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
import { useAuth } from '../context/AuthContext';
import { usePost } from '../hooks/usePost';
import { usePostLike } from '../hooks/usePostLike';
import { useDeletePost, useUpdatePost } from '../hooks/usePosts';
import CommentList from './CommentList';
import SubscribeForm from './SubscribeForm';
import './PostDetail.css';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const { data: post, isLoading, isError } = usePost(id);
  const { liked, likeCount, isLiking, toggleLike } = usePostLike(post, user);
  const deletePost = useDeletePost();
  const updatePost = useUpdatePost();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');

  const handleDeletePost = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deletePost.mutate(id, {
        onSuccess: () => navigate('/posts')
      });
    }
  };

  const handleEditClick = () => {
    setEditForm({
      title: post.title,
      content: post.content,
      tags: post.tags || []
    });
    setTagInput('');
    setIsEditing(true);
  };

  const handleEditClose = () => {
    setIsEditing(false);
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

  const handleSaveEdit = () => {
    updatePost.mutate(
      { id, postData: editForm },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  const handleLike = () => toggleLike(() => navigate('/login'));

  if (isLoading) return <div>Loading...</div>;
  if (isError || !post) return <div>Failed to fetch post. Please try refreshing the page.</div>;

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
              <Tooltip title={liked ? "Unlike" : "Like"}>
                <span style={{ display: 'inline-flex', alignItems: 'center' }}> 
                  <IconButton 
                    onClick={handleLike} 
                    disabled={isLiking}
                    sx={{
                      color: liked ? '#ff4081' : 'inherit',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 64, 129, 0.08)'
                      },
                      '&:disabled': {
                        opacity: 0.7
                      }
                    }}
                  >
                    {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                </span>
              </Tooltip>
              <Typography 
                variant="body2" 
                sx={{ 
                  ml: 1, 
                  color: liked ? '#ff4081' : 'text.secondary',
                  fontWeight: liked ? 'bold' : 'normal',
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
          <Button onClick={handleSaveEdit} variant="contained" color="primary" disabled={updatePost.isPending}>
            {updatePost.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PostDetail;
