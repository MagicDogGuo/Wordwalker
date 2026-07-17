import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
  Alert
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';

const FavoritePostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth(); // Token is required to authorize requests

  useEffect(() => {
    const fetchFavoritePosts = async () => {
      if (!token) {
        setError('Please log in to view your favorites.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await httpClient.get(API_ENDPOINTS.POSTS.MY_FAVORITES);
        setPosts(response.data);
        setError('');
      } catch (err) {
        console.error('Failed to fetch favorite posts:', err);
        setError(err.response?.data?.message || 'Could not load favorite posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFavoritePosts();
  }, [token]);

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Loading favorites...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (posts.length === 0) {
    return (
      <Container sx={{ py: 4}}>
        <Typography variant="h4" component="h1" gutterBottom >
          My Favorites
        </Typography>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6">Your favorites list is empty.</Typography>
          <Typography color="text.secondary">
            Go explore some posts and like them to add to your favorites!
          </Typography>
          <Button component={RouterLink} to="/posts" variant="contained" sx={{ mt: 2 }}>
            Browse Posts
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Favorites
      </Typography>
      <Grid container spacing={3}>
        {posts.map((post) => (
          <Grid item key={post._id} xs={12} sm={6} md={4}>
            <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  {post.title}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  Author: {post.author?.username || 'Anonymous'}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3, // Display 3 lines
                  WebkitBoxOrient: 'vertical',
                  minHeight: '3.6em' // Height for 3 lines of text (assuming 1.2em line height)
                }}>
                  {post.content} 
                </Typography>
              </CardContent>
              <CardActions>
                <Button component={RouterLink} to={`/posts/${post._id}`} size="small">
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default FavoritePostsPage; 