import React, { useState, useEffect } from 'react';
import httpClient from '../config/httpClient';
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  TextField,
  Button,
  Snackbar
} from '@mui/material';
import {
  Email as EmailIcon,
  Person as PersonIcon,
  Favorite as FavoriteIcon, // Icon for favorites count
  VpnKey as VpnKeyIcon // Example icon; can be replaced with a better role icon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';

const UserProfilePage = () => {
  const { user, token, loading: authLoading } = useAuth();
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    if (user) {
      setNewUsername(user.username);
    }
    const fetchFavorites = async () => {
      if (token) {
        try {
          setLoadingFavorites(true);
          const response = await httpClient.get(API_ENDPOINTS.POSTS.MY_FAVORITES);
          setFavoritesCount(response.data.length);
        } catch (err) {
          console.error('Failed to fetch favorites count:', err);
          // Do not block page rendering; log error or show a small warning message
          setError('Could not load favorites count.'); 
        } finally {
          setLoadingFavorites(false);
        }
      }
    };

    if (!authLoading && user) { // Ensure auth is loaded and user exists
      fetchFavorites();
    } else if (!authLoading && !user) { // If auth finished loading but user does not exist
      setLoadingFavorites(false); // No need to load favorites
      setError('Please log in to view your profile.');
    }
  }, [token, user, authLoading]);

  if (authLoading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Loading user data...</Typography>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error || 'User not found. Please log in.'}</Alert>
      </Container>
    );
  }
  
  const handleUsernameChange = (e) => {
    setNewUsername(e.target.value);
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
    if (editMode && user) { // Reset input to current username when leaving edit mode
      setNewUsername(user.username);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    setSnackbarMessage('');
  };

  const handleSubmitUsername = async (e) => {
    e.preventDefault();
    if (!newUsername.trim() || newUsername.trim() === user.username) {
      setSnackbarMessage(newUsername.trim() === user.username ? 'Username is the same.' : 'Username cannot be empty.');
      setSnackbarOpen(true);
      return;
    }
    setIsUpdating(true);
    try {
      await httpClient.put(API_ENDPOINTS.AUTH.UPDATE_PROFILE, {
        username: newUsername.trim()
      });
      setSnackbarMessage('Username updated successfully! Page will refresh.');
      setSnackbarOpen(true);
      // Updating user state in AuthContext would be cleaner
      // AuthContext currently has no direct update method, so page refresh is used
      setTimeout(() => {
        window.location.reload(); 
      }, 2000); // Delay refresh so user can see the message
      setEditMode(false);
    } catch (err) {
      console.error('Failed to update username:', err);
      setSnackbarMessage(err.response?.data?.message || 'Failed to update username. Please try again.');
      setSnackbarOpen(true);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Main content: show basic profile info even while favorites are loading
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        User Profile
      </Typography>
      <Paper elevation={3} sx={{ p: 3 }}>
        <List>
          <ListItem>
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            {!editMode ? (
              <ListItemText primary="Username" secondary={user.username || 'N/A'} />
            ) : (
              <Box component="form" onSubmit={handleSubmitUsername} sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                <TextField 
                  label="New Username"
                  value={newUsername}
                  onChange={handleUsernameChange}
                  variant="outlined"
                  size="small"
                  fullWidth
                  disabled={isUpdating}
                  sx={{ mr: 1 }}
                />
                <Button type="submit" variant="contained" color="primary" disabled={isUpdating} size="small">
                  {isUpdating ? <CircularProgress size={20} color="inherit" /> : 'Save'}
                </Button>
              </Box>
            )}
            <Button onClick={handleEditToggle} disabled={isUpdating} size="small" sx={{ ml: 'auto' }}>
              {editMode ? 'Cancel' : 'Edit'}
            </Button>
          </ListItem>
          <Divider component="li" />
          <ListItem>
            <ListItemIcon>
              <EmailIcon />
            </ListItemIcon>
            <ListItemText primary="Email" secondary={user.email || 'N/A'} />
          </ListItem>
          <Divider component="li" />
          <ListItem>
            <ListItemIcon>
              <FavoriteIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Favorites Count" 
              secondary={
                loadingFavorites ? <CircularProgress size={20} /> : (error && !favoritesCount ? 'Error loading' : favoritesCount)
              } 
            />
          </ListItem>
          <Divider component="li" />
          <ListItem>
            <ListItemIcon>
              <VpnKeyIcon /> {/* Replace with a more suitable icon if needed */}
            </ListItemIcon>
            <ListItemText primary="Role" secondary={user.role || 'N/A'} />
          </ListItem>
        </List>
      </Paper>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default UserProfilePage; 