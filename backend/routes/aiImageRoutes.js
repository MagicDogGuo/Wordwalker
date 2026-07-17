const express = require('express');
const router = express.Router();
const axios = require('axios');
const FormData = require('form-data'); // For Imgur upload
const { auth } = require('../middleware/auth');
const CONFIG = require('../config');
const logger = require('../utils/logger');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');
const validate = require('../middleware/validate');
const schemas = require('../validation/schemas');

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
      model: CONFIG.OPENAI_IMAGE_MODEL,
      prompt: `${prompt}, pixel art style`,
      n: 1,
      size: '1024x1024',
      output_format: 'png',
      quality: 'medium',
    },
    {
      headers: {
        Authorization: `Bearer ${CONFIG.OPENAI_API_KEY}`,
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

  logger.error('Failed to extract image from OpenAI response:', openaiResponse.data);
  throw new Error('Failed to parse image from AI (OpenAI) response.');
}

async function uploadToImgur(imageBuffer) {
  if (!CONFIG.IMGUR_CLIENT_ID) {
    logger.warn('Imgur Client ID not found. Please set IMGUR_CLIENT_ID environment variable.');
    // Throw specific error type
    throw new ImgurUploadError('Imgur service is not configured (Client ID missing).');
  }

  const form = new FormData();
  form.append('image', imageBuffer, { filename: 'ai_generated_image.png', contentType: 'image/png' });

  try {
    const imgurResponse = await axios.post('https://api.imgur.com/3/image', form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Client-ID ${CONFIG.IMGUR_CLIENT_ID}`,
      },
    });

    if (imgurResponse.data && imgurResponse.data.success && imgurResponse.data.data && imgurResponse.data.data.link) {
      return imgurResponse.data.data.link;
    } else {
      logger.error('Failed to extract Imgur link from response:', imgurResponse.data);
      throw new ImgurUploadError('Failed to parse Imgur URL from API response.');
    }
  } catch (error) {
    logger.error('Error uploading to Imgur:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
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

router.post('/generate-image', auth, validate(schemas.aiImage.generate), asyncHandler(async (req, res) => {
  const { prompt } = req.body;

  if (!CONFIG.OPENAI_API_KEY) {
    throw new AppError('OpenAI service is not configured (API key missing).', 503);
  }

  let fallbackImageUrl;
  let imageBuffer;

  try {
    const generatedImage = await generateOpenAiImage(prompt);
    imageBuffer = generatedImage.imageBuffer;
    fallbackImageUrl = generatedImage.fallbackImageUrl;
  } catch (error) {
    const detailedError = error.response ? JSON.stringify(error.response.data, null, 2) : error.message;
    logger.error('Error during OpenAI image generation:', detailedError, error.stack);
    const message = getAxiosErrorMessage(error, 'Failed during OpenAI image generation.');
    throw new AppError(message, 500);
  }

  // If OpenAI steps were successful, imageBuffer and openaiImageUrl will be populated.
  // Note: an Imgur upload failure here is intentionally NOT a hard error - we still
  // successfully generated the image, so we fall back to the embedded image data
  // instead of failing the whole request.
  try {
    const imgurUrl = await uploadToImgur(imageBuffer);
    return res.json({ imageUrl: imgurUrl });
  } catch (imgurError) {
    if (imgurError instanceof ImgurUploadError || imgurError.message.includes('Imgur')) {
      logger.warn('Imgur upload failed, returning OpenAI URL as fallback:', imgurError.message);
      return res.status(200).json({
        imageUrl: fallbackImageUrl,
        warning: `Image generated successfully, but failed to save to Imgur: ${imgurError.message}. Using embedded image data instead.`,
      });
    }

    // For any other unexpected errors after OpenAI success but not from Imgur
    const detailedError = imgurError.response ? JSON.stringify(imgurError.response.data, null, 2) : imgurError.message;
    logger.error('Unexpected error after OpenAI success:', detailedError, imgurError.stack);
    const message = (imgurError instanceof Error && imgurError.message) ? imgurError.message : 'An unexpected error occurred after image generation.';
    throw new AppError(message, 500);
  }
}));

module.exports = router; 