const Joi = require('joi');

// Reusable Mongo ObjectId string validator (24 hex chars).
const objectId = Joi.string().hex().length(24);

const auth = {
  register: Joi.object({
    username: Joi.string().trim().min(1).max(50).required(),
    email: Joi.string().trim().email().required(),
    password: Joi.string().min(6).max(128).required(),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({ 'any.only': 'Password and confirmation password do not match' }),
  }),

  login: Joi.object({
    email: Joi.string().trim().email().required(),
    password: Joi.string().required(),
  }),

  updateProfile: Joi.object({
    username: Joi.string().trim().min(1).max(50).required(),
  }),
};

const posts = {
  create: Joi.object({
    title: Joi.string().trim().min(1).max(200).required(),
    content: Joi.string().min(1).required(),
    imageUrl: Joi.string().uri().allow('').optional(),
    tags: Joi.array().items(Joi.string().trim().max(50)).optional(),
  }),

  update: Joi.object({
    title: Joi.string().trim().min(1).max(200).optional(),
    content: Joi.string().min(1).optional(),
    imageUrl: Joi.string().uri().allow('').optional(),
    tags: Joi.array().items(Joi.string().trim().max(50)).optional(),
  }),
};

const comments = {
  create: Joi.object({
    postId: objectId.required(),
    content: Joi.string().trim().min(1).max(2000).required(),
  }),

  update: Joi.object({
    content: Joi.string().trim().min(1).max(2000).optional(),
    isPublic: Joi.boolean().optional(),
  }),
};

const subscribers = {
  subscribe: Joi.object({
    email: Joi.string().trim().email().required(),
  }),

  updateStatus: Joi.object({
    status: Joi.string().valid('active', 'unsubscribed').required(),
  }),
};

const aiImage = {
  generate: Joi.object({
    prompt: Joi.string().trim().min(1).max(1000).required(),
  }),
};

module.exports = { auth, posts, comments, subscribers, aiImage };
