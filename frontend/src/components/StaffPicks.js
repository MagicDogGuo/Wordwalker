import React from 'react';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { usePosts } from '../hooks/usePosts';

const StaffPicks = () => {
  // Shares the same query cache/key as Posts.js, so this no longer triggers
  // a second network request for the post list.
  const { data: posts, isLoading, isError } = usePosts();

  if (isLoading) {
    return <CircularProgress />;
  }

  if (isError) {
    return <Alert severity="error">Failed to load staff picks.</Alert>;
  }

  const picks = posts && posts.length > 0
    ? [...posts].sort(() => 0.5 - Math.random()).slice(0, 3)
    : [];

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
