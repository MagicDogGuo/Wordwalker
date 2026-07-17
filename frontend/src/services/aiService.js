import httpClient from '../config/httpClient';
import { API_ENDPOINTS } from '../config/api';

export const generatePostImage = async (prompt) => {
  const { data } = await httpClient.post(API_ENDPOINTS.AI.GENERATE_IMAGE, { prompt });
  return data;
};
