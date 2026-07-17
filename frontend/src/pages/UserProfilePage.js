import React, { useState, useEffect } from 'react';
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
  Favorite as FavoriteIcon,
  VpnKey as VpnKeyIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useMyFavoritePosts } from '../hooks/useMyFavoritePosts';
import { useUpdateProfile } from '../hooks/useUpdateProfile';

const UserProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: favoritePosts, isLoading: loadingFavorites, isError: isFavoritesError } = useMyFavoritePosts();
  const updateProfile = useUpdateProfile();

  const [editMode, setEditMode] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    if (user) {
      setNewUsername(user.username);
    }
  }, [user]);

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
        <Alert severity="error">User not found. Please log in.</Alert>
      </Container>
    );
  }

  const favoritesCount = favoritePosts?.length || 0;

  const handleUsernameChange = (e) => {
    setNewUsername(e.target.value);
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
    if (editMode && user) {
      setNewUsername(user.username);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    setSnackbarMessage('');
  };

  const handleSubmitUsername = (e) => {
    e.preventDefault();
    if (!newUsername.trim() || newUsername.trim() === user.username) {
      setSnackbarMessage(newUsername.trim() === user.username ? 'Username is the same.' : 'Username cannot be empty.');
      setSnackbarOpen(true);
      return;
    }

    updateProfile.mutate(
      { username: newUsername.trim() },
      {
        onSuccess: () => {
          setSnackbarMessage('Username updated successfully! Page will refresh.');
          setSnackbarOpen(true);
          setEditMode(false);
          // Updating user state in AuthContext would be cleaner
          // AuthContext currently has no direct update method, so page refresh is used
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        },
        onError: (err) => {
          setSnackbarMessage(err.response?.data?.message || 'Failed to update username. Please try again.');
          setSnackbarOpen(true);
        }
      }
    );
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
                  disabled={updateProfile.isPending}
                  sx={{ mr: 1 }}
                />
                <Button type="submit" variant="contained" color="primary" disabled={updateProfile.isPending} size="small">
                  {updateProfile.isPending ? <CircularProgress size={20} color="inherit" /> : 'Save'}
                </Button>
              </Box>
            )}
            <Button onClick={handleEditToggle} disabled={updateProfile.isPending} size="small" sx={{ ml: 'auto' }}>
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
                loadingFavorites ? <CircularProgress size={20} /> : (isFavoritesError ? 'Error loading' : favoritesCount)
              } 
            />
          </ListItem>
          <Divider component="li" />
          <ListItem>
            <ListItemIcon>
              <VpnKeyIcon />
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
