import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import HomeIcon from '@mui/icons-material/Home';
import { PALETTE } from '../theme';

const NotFoundPage = () => {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          py: 8,
          textAlign: 'center',
        }}
      >
        <SearchOffIcon
          sx={{
            fontSize: 80,
            color: PALETTE.mediumBlueGray,
            mb: 2,
          }}
          aria-hidden
        />
        <Typography
          variant="h1"
          component="p"
          sx={{
            fontSize: { xs: '5rem', sm: '6rem' },
            fontWeight: 700,
            lineHeight: 1,
            color: PALETTE.brightRed,
            mb: 1,
          }}
        >
          404
        </Typography>
        <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Page not found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 360 }}>
          The page you are looking for does not exist or may have been moved.
        </Typography>
        <Button
          component={RouterLink}
          to="/"
          variant="contained"
          color="primary"
          size="large"
          startIcon={<HomeIcon />}
        >
          Back to Home
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
