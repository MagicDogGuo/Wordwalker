import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Link,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import httpClient from '../config/httpClient';

const StaffPicks = () => {
  const [picks, setPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPostsAndFilterPicks = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await httpClient.get(API_ENDPOINTS.POSTS.LIST);
        const allPosts = response.data;
        
        if (allPosts && allPosts.length > 0) {
          // Shuffle posts randomly
          const shuffledPosts = [...allPosts].sort(() => 0.5 - Math.random());
          // Take the first three posts, or all if fewer than three
          setPicks(shuffledPosts.slice(0, 3));
        } else {
          setPicks([]); // If there are no posts, picks stays empty
        }

      } catch (err) {
        console.error("Error fetching staff picks:", err);
        setError('Failed to load staff picks.');
      } finally {
        setLoading(false);
      }
    };

    fetchPostsAndFilterPicks();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (picks.length === 0) {
    return <Typography variant="body2">No staff picks available at the moment.</Typography>;
  }

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2, backgroundColor: '#f9f9f9' }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Staff Picks
      </Typography>
      <List dense>
        {picks.map((pick) => (
          <ListItem 
            key={pick._id} 
            disablePadding
            component={RouterLink}
            to={`/posts/${pick._id}`}
            sx={{ 
              mb: 1, 
              color: 'text.primary', 
              textDecoration: 'none',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          >
            <ListItemText 
              primary={pick.title} 
              primaryTypographyProps={{ 
                variant: 'subtitle1', 
                sx: { fontWeight: 'medium' } 
              }}
              secondary={`By ${pick.author?.username || 'Unknown Author'}`}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default StaffPicks; 