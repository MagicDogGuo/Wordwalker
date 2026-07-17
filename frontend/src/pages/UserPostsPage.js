import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import httpClient from '../config/httpClient';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  CircularProgress,
  Box,
  Alert,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api'; // Assume API endpoints are configured here
import PostForm from '../components/PostForm'; // Import PostForm

const UserPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false); // State for PostForm dialog

  // Hoist fetchUserPosts and wrap with useCallback
  const fetchUserPosts = useCallback(async () => {
    if (!token) {
      setError('Please log in to manage your posts.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await httpClient.get(API_ENDPOINTS.POSTS.MY_POSTS);
      setPosts(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch user posts:', err);
      setError(err.response?.data?.message || 'Could not load your posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [token]); // Dependencies for useCallback

  useEffect(() => {
    fetchUserPosts(); // Call the hoisted function
  }, [fetchUserPosts]); // useEffect depends on the memoized fetchUserPosts

  const handleCreatePostInDialog = async (postData) => {
    try {
      setError(''); // Clear previous errors
      await httpClient.post(API_ENDPOINTS.POSTS.CREATE, postData);
      fetchUserPosts(); // Refetch posts to show the new one
      setOpenCreateDialog(false);
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.response?.data?.message || 'Could not create the post. Please try again.');
      // Keep dialog open if error occurs, or handle error display within PostForm
    }
  };

  const handleDeleteClick = (postId) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;
    try {
      // Assume API_ENDPOINTS.POSTS.DELETE(postId) is the delete endpoint
      await httpClient.delete(API_ENDPOINTS.POSTS.DELETE(postToDelete));
      setPosts(posts.filter(post => post._id !== postToDelete));
      setPostToDelete(null);
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error('Failed to delete post:', err);
      setError(err.response?.data?.message || 'Could not delete the post. Please try again.');
      setPostToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleCloseDeleteDialog = () => {
    setPostToDelete(null);
    setDeleteDialogOpen(false);
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Loading your posts...</Typography>
      </Container>
    );
  }

  if (error && !posts.length) { // Fill the full page with error only when there are no posts to show
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          My Posts
        </Typography>
        <Button
          variant="contained"
          color="primary" // Match style from Posts.js
          startIcon={<AddIcon />}
          onClick={() => setOpenCreateDialog(true)} // Open dialog instead of navigating
        >
          New Post 
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>} 

      {posts.length === 0 && !loading && !error && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6">You haven't created any posts yet.</Typography>
          <Typography color="text.secondary">
            Click "New Post" to start sharing your thoughts!
          </Typography>
        </Box>
      )}

      <Grid container spacing={3}>
        {posts.map((post) => (
          <Grid item key={post._id} xs={12} sm={6} md={4}>
            <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  {post.title}
                </Typography>
                {/* Optionally show author, but this page is usually for the current user
                <Typography color="text.secondary" gutterBottom>
                  Author: {post.author?.username || user?.username || 'You'}
                </Typography>
                */}
                <Typography variant="body2" color="text.secondary" paragraph sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  minHeight: '3.6em' 
                }}>
                  {post.content} 
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between' }}>
                <Button 
                  component={RouterLink} 
                  to={`/posts/${post._id}`} 
                  size="small"
                >
                  View
                </Button>
                <Box>
                  <IconButton 
                    size="small" 
                    onClick={() => handleDeleteClick(post._id)}
                    aria-label="delete post"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this post? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Post Creation Dialog */}
      <PostForm
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        onSubmit={handleCreatePostInDialog}
        // initialData will be undefined/null, so it's a new post form
      />
    </Container>
  );
};

export default UserPostsPage; 