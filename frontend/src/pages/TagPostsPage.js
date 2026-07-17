import React, { useMemo } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { Container, Typography, List, ListItem, CircularProgress, Alert, Paper, Chip, Stack } from '@mui/material';
import ExploreIcon from '@mui/icons-material/Explore';
import { useUniqueTags, usePostsByTag } from '../hooks/usePostsByTag';

const TagPostsPage = () => {
  const { tagName: rawTagName } = useParams();
  const navigate = useNavigate();
  const decodedTagName = rawTagName ? decodeURIComponent(rawTagName) : '';

  const { data: uniqueTags = [], isLoading: loadingTags, isError: isErrorTags } = useUniqueTags();
  const { data: posts = [], isLoading: loadingPosts, isError: isErrorPosts } = usePostsByTag(decodedTagName);

  const displayedUniqueTags = useMemo(() => {
    if (uniqueTags.length === 0) return [];
    return [...uniqueTags].sort(() => 0.5 - Math.random()).slice(0, 5);
  }, [uniqueTags]);

  if (loadingPosts || loadingTags) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (isErrorTags) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Failed to load topics.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      {/* Top Tags Navigation Bar */}
      <Stack direction="row" spacing={1} sx={{ mb: 3, overflowX: 'auto', pb: 1, justifyContent: 'center' }} >
        <Chip 
          icon={<ExploreIcon />}
          label="Explore All"
          onClick={() => navigate('/posts')}
          clickable
          sx={{ mr: 1 }}
        />
        {displayedUniqueTags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            component={RouterLink}
            to={`/tags/${encodeURIComponent(tag)}`}
            clickable
            variant={decodedTagName === tag ? 'filled' : 'outlined'}
            color={decodedTagName === tag ? 'primary' : 'default'}
          />
        ))}
      </Stack>

      <Typography variant="h2" component="h1" sx={{ textAlign: 'center', my: 4, fontWeight: 'bold', color: 'text.primary' }}>
        {decodedTagName}
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
        {isErrorPosts && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {`Failed to load posts for tag "${decodedTagName}". Please try again.`}
          </Alert>
        )}
        {posts.length === 0 && !isErrorPosts && (
          <Typography variant="body1">
            No posts found for this tag.
          </Typography>
        )}
        {posts.length > 0 && (
          <List>
            {posts.map((post) => (
              <ListItem 
                key={post._id} 
                divider 
                component={RouterLink} 
                to={`/posts/${post._id}`}
                sx={{ 
                  textDecoration: 'none', 
                  color: 'inherit',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  },
                  flexDirection: 'column',
                  alignItems: 'flex-start'
                }}
              >
                <Typography variant="h6" component="div" sx={{ fontWeight: 'medium' }}>
                  {post.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  By {post.author?.username || 'Unknown Author'} - {new Date(post.createdAt).toLocaleDateString()}
                </Typography>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default TagPostsPage;
