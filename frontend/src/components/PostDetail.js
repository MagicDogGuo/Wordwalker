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
  Tooltip
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
import PostEditDialog from './PostEditDialog';
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

  const handleDeletePost = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deletePost.mutate(id, {
        onSuccess: () => navigate('/posts')
      });
    }
  };

  const handleSaveEdit = (postData) => {
    updatePost.mutate(
      { id, postData },
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
                    <IconButton onClick={() => setIsEditing(true)} color="primary">
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

      <PostEditDialog
        open={isEditing}
        post={post}
        onClose={() => setIsEditing(false)}
        onSave={handleSaveEdit}
        isSaving={updatePost.isPending}
      />
    </div>
  );
};

export default PostDetail;
