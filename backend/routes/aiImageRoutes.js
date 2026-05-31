const express = require('express');
const router = express.Router();
const axios = require('axios');
const FormData = require('form-data'); // For Imgur upload
const { auth } = require('../middleware/auth');

// Define a custom error type for Imgur upload failures to identify them later
class ImgurUploadError extends Error {
  constructor(message) {
    super(message);
    this.name = "ImgurUploadError";
  }
}

function getAxiosErrorMessage(error, fallbackMessage) {
  const apiError = error.response?.data?.error;
  if (typeof apiError === 'string') {
    return apiError;
  }
  if (typeof apiError?.message === 'string' && apiError.message) {
    return apiError.message;
  }
  if (typeof error.response?.data?.message === 'string') {
    return error.response.data.message;
  }
  if (typeof error.message === 'string') {
    return error.message;
  }
  return fallbackMessage;
}

async function generateOpenAiImage(prompt) {
  const openaiResponse = await axios.post(
    'https://api.openai.com/v1/images/generations',
    {
      model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1-mini',
      prompt: `${prompt}, pixel art style`,
      n: 1,
      size: '1024x1024',
      output_format: 'png',
      quality: 'medium',
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const imageData = openaiResponse.data?.data?.[0];
  const b64Json = imageData?.b64_json;

  if (b64Json) {
    return {
      imageBuffer: Buffer.from(b64Json, 'base64'),
      fallbackImageUrl: `data:image/png;base64,${b64Json}`,
    };
  }

  const legacyUrl = imageData?.url;
  if (legacyUrl) {
    const imageDownloadResponse = await axios.get(legacyUrl, {
      responseType: 'arraybuffer',
    });
    return {
      imageBuffer: Buffer.from(imageDownloadResponse.data, 'binary'),
      fallbackImageUrl: legacyUrl,
    };
  }

  console.error('Failed to extract image from OpenAI response:', openaiResponse.data);
  throw new Error('Failed to parse image from AI (OpenAI) response.');
}

async function uploadToImgur(imageBuffer) {
  if (!process.env.IMGUR_CLIENT_ID) {
    console.warn('Imgur Client ID not found. Please set IMGUR_CLIENT_ID environment variable.');
    // Throw specific error type
    throw new ImgurUploadError('Imgur service is not configured (Client ID missing).');
  }

  const form = new FormData();
  form.append('image', imageBuffer, { filename: 'ai_generated_image.png', contentType: 'image/png' });

  try {
    const imgurResponse = await axios.post('https://api.imgur.com/3/image', form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
      },
    });

    if (imgurResponse.data && imgurResponse.data.success && imgurResponse.data.data && imgurResponse.data.data.link) {
      return imgurResponse.data.data.link;
    } else {
      console.error('Failed to extract Imgur link from response:', imgurResponse.data);
      throw new ImgurUploadError('Failed to parse Imgur URL from API response.');
    }
  } catch (error) {
    console.error('Error uploading to Imgur:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    let errorMessage = 'Failed to upload image to Imgur.';
    if (error.response && error.response.data && error.response.data.data && typeof error.response.data.data.error === 'string') {
        errorMessage = error.response.data.data.error;
    } else if (error.response && error.response.data && error.response.data.error && typeof error.response.data.error.message === 'string') {
        errorMessage = error.response.data.error.message;
    } else if (error.message) {
        errorMessage = error.message; // Use original error message if more specific parsing fails
    }
    // Throw specific error type, possibly wrapping the original error message
    throw new ImgurUploadError(errorMessage);
  }
}

router.post('/generate-image', auth, async (req, res) => {
  const { prompt } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ message: 'OpenAI service is not configured (API key missing).' });
  }
  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    return res.status(400).json({ message: 'A valid prompt is required.' });
  }

  let fallbackImageUrl = null;
  let imageBuffer = null;

  try {
    const generatedImage = await generateOpenAiImage(prompt);
    imageBuffer = generatedImage.imageBuffer;
    fallbackImageUrl = generatedImage.fallbackImageUrl;
  } catch (error) {
    const detailedError = error.response ? JSON.stringify(error.response.data, null, 2) : error.message;
    console.error('Error during OpenAI image generation:', detailedError, error.stack);
    const message = getAxiosErrorMessage(error, 'Failed during OpenAI image generation.');
    return res.status(500).json({ message });
  }

  // If OpenAI steps were successful, imageBuffer and openaiImageUrl will be populated
  try {
    // Step 3: Upload the image buffer to Imgur
    const imgurUrl = await uploadToImgur(imageBuffer);
    // If uploadToImgur is successful, it returns the URL
    return res.json({ imageUrl: imgurUrl });

  } catch (imgurError) {
    // Check if the error is from Imgur upload (using our custom error type or by checking the message)
    if (imgurError instanceof ImgurUploadError || imgurError.message.includes('Imgur')) {
      console.warn('Imgur upload failed, returning OpenAI URL as fallback:', imgurError.message);
      return res.status(200).json({
        imageUrl: fallbackImageUrl,
        warning: `Image generated successfully, but failed to save to Imgur: ${imgurError.message}. Using embedded image data instead.`,
      });
    } else {
      // For any other unexpected errors after OpenAI success but not from Imgur
      const detailedError = imgurError.response ? JSON.stringify(imgurError.response.data, null, 2) : imgurError.message;
      console.error('Unexpected error after OpenAI success:', detailedError, imgurError.stack);
      const message = (imgurError instanceof Error && imgurError.message) ? imgurError.message : 'An unexpected error occurred after image generation.';
      return res.status(500).json({ message });
    }
  }
});

module.exports = router; 