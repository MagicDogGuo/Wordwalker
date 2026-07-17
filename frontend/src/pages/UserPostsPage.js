import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../context/AuthContext';
import { useMyPosts } from '../hooks/useMyPosts';
import { useCreatePost, useDeletePost } from '../hooks/usePosts';
import PostForm from '../components/PostForm';

const UserPostsPage = () => {
  const { token } = useAuth();
  const { data: posts = [], isLoading, isError, error } = useMyPosts();
  const createPost = useCreatePost();
  const deletePost = useDeletePost();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  const handleCreatePostInDialog = (postData) => {
    createPost.mutate(postData, {
      onSuccess: () => setOpenCreateDialog(false)
    });
  };

  const handleDeleteClick = (postId) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!postToDelete) return;
    deletePost.mutate(postToDelete);
    setPostToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleCloseDeleteDialog = () => {
    setPostToDelete(null);
    setDeleteDialogOpen(false);
  };

  if (!token) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Please log in to manage your posts.</Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Loading your posts...</Typography>
      </Container>
    );
  }

  if (isError && !posts.length) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">
          {error.response?.data?.message || 'Could not load your posts. Please try again later.'}
        </Alert>
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
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreateDialog(true)}
        >
          New Post 
        </Button>
      </Box>

      {createPost.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {createPost.error.response?.data?.message || 'Could not create the post. Please try again.'}
        </Alert>
      )}

      {posts.length === 0 && (
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
