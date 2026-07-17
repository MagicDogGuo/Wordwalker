import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import httpClient from '../config/httpClient';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';

const SubscribeDialog = ({ open, onClose }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  React.useEffect(() => {
    if (open && user && user.email) {
      setEmail(user.email);
    }
    if (!open) {
      setEmail('');
    }
  }, [open, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await httpClient.post(API_ENDPOINTS.SUBSCRIBERS.SUBSCRIBE, { email });
      setMessage(response.data.message);
      setEmail('');
      setTimeout(() => {
        onClose();
        setMessage('');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Subscription failed, please try again later');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setMessage('');
    setError('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 3
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        Subscribe to Newsletter
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Get the latest articles and updates delivered to your inbox. Stay informed about new posts, features, and announcements.
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              type="email"
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={isLoading}
              sx={{ mb: 2 }}
            />

            {message && (
              <Typography color="success.main" sx={{ mb: 2 }}>
                {message}
              </Typography>
            )}
            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            <DialogActions sx={{ px: 0 }}>
              <Button 
                onClick={handleClose} 
                color="inherit"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={isLoading}
              >
                {isLoading ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </DialogActions>
          </form>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SubscribeDialog; 