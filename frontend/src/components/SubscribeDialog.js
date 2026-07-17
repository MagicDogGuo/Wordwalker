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
import { useAuth } from '../context/AuthContext';
import { useSubscribe } from '../hooks/useSubscribe';

const SubscribeDialog = ({ open, onClose }) => {
  const [email, setEmail] = useState('');
  const { user } = useAuth();
  const subscribe = useSubscribe();

  React.useEffect(() => {
    if (open && user && user.email) {
      setEmail(user.email);
    }
    if (!open) {
      setEmail('');
      subscribe.reset();
    }
    // subscribe is a mutation object recreated every render; only its
    // stable .reset() is needed here, so it's intentionally left out.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    subscribe.mutate(email, {
      onSuccess: () => {
        setEmail('');
        setTimeout(() => {
          onClose();
          subscribe.reset();
        }, 2000);
      }
    });
  };

  const handleClose = () => {
    setEmail('');
    subscribe.reset();
    onClose();
  };

  const message = subscribe.data?.message;
  const errorMessage = subscribe.isError
    ? (subscribe.error.response?.data?.message || 'Subscription failed, please try again later')
    : '';

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
              disabled={subscribe.isPending}
              sx={{ mb: 2 }}
            />

            {message && (
              <Typography color="success.main" sx={{ mb: 2 }}>
                {message}
              </Typography>
            )}
            {errorMessage && (
              <Typography color="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Typography>
            )}

            <DialogActions sx={{ px: 0 }}>
              <Button 
                onClick={handleClose} 
                color="inherit"
                disabled={subscribe.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={subscribe.isPending}
              >
                {subscribe.isPending ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </DialogActions>
          </form>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SubscribeDialog;
