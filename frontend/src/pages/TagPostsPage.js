import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { Container, Typography, List, ListItem, /* ListItemText, */ CircularProgress, Alert, Paper, /* Box, */ Divider, Chip, Stack } from '@mui/material'; // ListItemText and Box are not directly used now, kept for future extension
import { API_ENDPOINTS } from '../config/api';
import httpClient from '../config/httpClient';
import ExploreIcon from '@mui/icons-material/Explore'; // Icon for "Explore topics"
// import { useAuth } from '../context/AuthContext'; // Removed unused import

const TagPostsPage = () => {
  const { tagName: rawTagName } = useParams(); // Renamed to rawTagName for clarity
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [errorPosts, setErrorPosts] = useState(null);
  const [decodedTagName, setDecodedTagName] = useState(''); // Used to display decoded tag name

  const [uniqueTags, setUniqueTags] = useState([]);
  const [displayedUniqueTags, setDisplayedUniqueTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(true);
  const [errorTags, setErrorTags] = useState(null);

  // Effect to fetch unique tags and select a subset for display
  useEffect(() => {
    const fetchAndProcessUniqueTags = async () => {
      setLoadingTags(true);
      setErrorTags(null);
      try {
        const response = await httpClient.get(API_ENDPOINTS.POSTS.LIST_UNIQUE_TAGS);
        const allTags = response.data || [];
        setUniqueTags(allTags); // Store all tags, might be useful elsewhere or for debugging

        if (allTags.length > 0) {
          const shuffledTags = [...allTags].sort(() => 0.5 - Math.random());
          setDisplayedUniqueTags(shuffledTags.slice(0, 5)); // Select first 5 after shuffling
        } else {
          setDisplayedUniqueTags([]);
        }

      } catch (err) {
        console.error("Error fetching unique tags:", err);
        setErrorTags("Failed to load topics.");
        setDisplayedUniqueTags([]); // Clear on error as well
      } finally {
        setLoadingTags(false);
      }
    };
    fetchAndProcessUniqueTags();
  }, []);

  // Effect to fetch posts for the current tag
  useEffect(() => {
    if (rawTagName) {
      const actualTagName = decodeURIComponent(rawTagName);
      setDecodedTagName(actualTagName);

      const fetchPostsByTag = async () => {
        setLoadingPosts(true);
        setErrorPosts(null);
        try {
          const response = await httpClient.get(API_ENDPOINTS.POSTS.LIST_BY_TAG(actualTagName));
          setPosts(response.data);
        } catch (err) {
          console.error(`Error fetching posts for tag ${actualTagName}:`, err);
          setErrorPosts(`Failed to load posts for tag "${actualTagName}". Please try again.`);
        } finally {
          setLoadingPosts(false);
        }
      };
      fetchPostsByTag();
    }
  }, [rawTagName]);

  if (loadingPosts || loadingTags) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (errorTags) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{errorTags}</Alert>
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
        {errorPosts && (
          <Alert severity="error" sx={{ mb: 2 }}>{errorPosts}</Alert>
        )}
        {posts.length === 0 && !loadingPosts && !errorPosts && (
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
                {/* Optional: add excerpt or partial content here */}
                {/* <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {post.content?.substring(0, 150)}...
                </Typography> */}
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default TagPostsPage; 