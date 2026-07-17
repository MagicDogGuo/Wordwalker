import httpClient from '../config/httpClient';
import { API_ENDPOINTS } from '../config/api';

export const getCommentsByPost = async (postId) => {
  const { data } = await httpClient.get(API_ENDPOINTS.COMMENTS.LIST(postId));
  return data;
};

export const createComment = async ({ postId, content }) => {
  const { data } = await httpClient.post(API_ENDPOINTS.COMMENTS.CREATE, { postId, content });
  return data;
};

export const deleteComment = async (commentId) => {
  const { data } = await httpClient.delete(API_ENDPOINTS.COMMENTS.DELETE(commentId));
  return data;
};
