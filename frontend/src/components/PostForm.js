import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack,
  Typography,
  CircularProgress
} from '@mui/material';
import { useGeneratePostImage } from '../hooks/useGeneratePostImage';

const PostForm = ({ open, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [],
    imageUrl: ''
  });
  const [tagInput, setTagInput] = useState('');
  const [aiGeneratedPreviewUrl, setAiGeneratedPreviewUrl] = useState('');
  const generateImage = useGeneratePostImage();

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          title: initialData.title || '',
          content: initialData.content || '',
          tags: initialData.tags || [],
          imageUrl: initialData.imageUrl || ''
        });
        setAiGeneratedPreviewUrl(initialData.imageUrl || '');
      } else {
        setFormData({
          title: '',
          content: '',
          tags: [],
          imageUrl: ''
        });
        setAiGeneratedPreviewUrl('');
      }
      setTagInput('');
      generateImage.reset();
    }
    // generateImage is a mutation object recreated every render; only its
    // stable .reset() is needed here, so it's intentionally left out.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      setFormData(prev => ({
        ...prev,
        tags: [...new Set([...prev.tags, tagInput.trim()])]
      }));
      setTagInput('');
    }
  };

  const handleDeleteTag = (tagToDelete) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToDelete)
    }));
  };

  const handleGenerateAiImage = () => {
    if (!formData.title.trim()) return;

    setAiGeneratedPreviewUrl('');
    setFormData(prev => ({ ...prev, imageUrl: '' }));

    generateImage.mutate(formData.title, {
      onSuccess: (data) => {
        if (data.imageUrl) {
          setFormData(prev => ({ ...prev, imageUrl: data.imageUrl }));
          setAiGeneratedPreviewUrl(data.imageUrl);
        }
      },
      onError: () => {
        setAiGeneratedPreviewUrl('');
        setFormData(prev => ({ ...prev, imageUrl: '' }));
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const aiImageError = generateImage.isError
    ? (generateImage.error.response?.data?.message || generateImage.error.message || 'Failed to generate image. Please try again.')
    : generateImage.data?.warning;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? 'Edit Post' : 'New Post'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            label="Content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            multiline
            rows={4}
            fullWidth
          />
          
          <Box sx={{ border: '1px solid #ccc', p: 2, borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>Generate Post Image (Optional)</Typography>
            <Button
              onClick={handleGenerateAiImage}
              variant="outlined"
              disabled={generateImage.isPending || !formData.title.trim()}
              fullWidth
              startIcon={generateImage.isPending ? <CircularProgress size={20} /> : null}
              sx={{ mb: aiImageError || aiGeneratedPreviewUrl ? 1 : 0 }}
            >
              {generateImage.isPending ? 'Generating Image...' : 'Generate Image with AI from Title'}
            </Button>
            {aiImageError && 
              <Typography 
                color={aiImageError.toLowerCase().includes('warning') || aiImageError.toLowerCase().includes('temporary') ? "warning.main" : "error"} 
                sx={{ mt: 1 }}
              >
                {aiImageError}
              </Typography>}
            {aiGeneratedPreviewUrl && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ textAlign: 'left' }}>
                  Image Preview:
                </Typography>
                <Box sx={{ textAlign: 'center' }}>
                  <img 
                    src={aiGeneratedPreviewUrl} 
                    alt="Post preview" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '200px', 
                      border: '1px solid #eee' 
                    }} 
                  />
                </Box>
              </Box>
            )}
          </Box>

          <TextField
            label="Add Tags (Optional)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleAddTag}
            placeholder="Press Enter to add a tag"
            fullWidth
          />
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {formData.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                onDelete={() => handleDeleteTag(tag)}
                color="primary"
                sx={{ margin: '4px' }}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {initialData ? 'Update' : 'Publish'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PostForm;
