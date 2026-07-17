import React, { useState } from 'react';
import { Container, Box, Button, Grid } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import PostList from './PostList';
import PostForm from './PostForm';
import StaffPicks from './StaffPicks';
import RecommendedTopics from './RecommendedTopics';
import './Posts.css';
import { useAuth } from '../context/AuthContext';
import { usePosts, useCreatePost, useUpdatePost, useDeletePost } from '../hooks/usePosts';

function Posts() {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const { user } = useAuth();

  const { data: posts = [] } = usePosts();
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();

  const handleCreatePost = (postData) => {
    createPost.mutate(postData, {
      onSuccess: () => setOpenDialog(false)
    });
  };

  const handleUpdatePost = (postData) => {
    updatePost.mutate(
      { id: editingPost._id, postData },
      {
        onSuccess: () => {
          setOpenDialog(false);
          setEditingPost(null);
        }
      }
    );
  };

  const handleDeletePost = (id) => {
    deletePost.mutate(id);
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setOpenDialog(true);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {user && (
            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setOpenDialog(true)}
              >
                New Post
              </Button>
            </Box>
          )}
          <PostList
            posts={posts}
            onDelete={handleDeletePost}
            onEdit={handleEditPost}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{ position: 'sticky', top: '80px' }}>
            <StaffPicks />
            <Box sx={{mt:3}}>
              <RecommendedTopics />
            </Box>
          </Box>
        </Grid>

        {user && (
          <PostForm
            open={openDialog}
            onClose={() => {
              setOpenDialog(false);
              setEditingPost(null);
            }}
            onSubmit={editingPost ? handleUpdatePost : handleCreatePost}
            initialData={editingPost}
          />
        )}
      </Grid>
    </Container>
  );
}

export default Posts;
