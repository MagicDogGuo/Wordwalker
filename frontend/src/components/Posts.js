import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Grid } from '@mui/material';
import PostList from './PostList';
import PostForm from './PostForm';
import StaffPicks from './StaffPicks';
import RecommendedTopics from './RecommendedTopics';
import httpClient from '../config/httpClient';
import './Posts.css';
import { Link, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Favorite as FavoriteIcon,
  Comment as CommentIcon,
  Add as AddIcon
} from '@mui/icons-material';

function Posts() {
  const [posts, setPosts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [comment, setComment] = useState('');
  const [openCommentDialog, setOpenCommentDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await httpClient.get(API_ENDPOINTS.POSTS.LIST);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleCreatePost = async (postData) => {
    try {
      await httpClient.post(API_ENDPOINTS.POSTS.CREATE, postData);
      fetchPosts();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleUpdatePost = async (postData) => {
    try {
      await httpClient.put(API_ENDPOINTS.POSTS.UPDATE(editingPost._id), postData);
      fetchPosts();
      setOpenDialog(false);
      setEditingPost(null);
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleDeletePost = async (id) => {
    try {
      await httpClient.delete(API_ENDPOINTS.POSTS.DELETE(id));
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
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