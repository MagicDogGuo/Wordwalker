import httpClient from '../config/httpClient';
import { API_ENDPOINTS } from '../config/api';

export const getPosts = async () => {
  const { data } = await httpClient.get(API_ENDPOINTS.POSTS.LIST);
  return data;
};

export const getPost = async (id) => {
  const { data } = await httpClient.get(API_ENDPOINTS.POSTS.DETAIL(id));
  return data;
};

export const createPost = async (postData) => {
  const { data } = await httpClient.post(API_ENDPOINTS.POSTS.CREATE, postData);
  return data;
};

export const updatePost = async (id, postData) => {
  const { data } = await httpClient.put(API_ENDPOINTS.POSTS.UPDATE(id), postData);
  return data;
};

export const deletePost = async (id) => {
  const { data } = await httpClient.delete(API_ENDPOINTS.POSTS.DELETE(id));
  return data;
};

export const likePost = async (id) => {
  const { data } = await httpClient.post(API_ENDPOINTS.POSTS.LIKE(id), {});
  return data;
};

export const getMyFavoritePosts = async () => {
  const { data } = await httpClient.get(API_ENDPOINTS.POSTS.MY_FAVORITES);
  return data;
};

export const getMyPosts = async () => {
  const { data } = await httpClient.get(API_ENDPOINTS.POSTS.MY_POSTS);
  return data;
};

export const getPostsByTag = async (tagName) => {
  const { data } = await httpClient.get(API_ENDPOINTS.POSTS.LIST_BY_TAG(tagName));
  return data;
};

export const getUniqueTags = async () => {
  const { data } = await httpClient.get(API_ENDPOINTS.POSTS.LIST_UNIQUE_TAGS);
  return data;
};
