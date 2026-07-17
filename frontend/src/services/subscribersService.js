import httpClient from '../config/httpClient';
import { API_ENDPOINTS } from '../config/api';

export const subscribe = async (email) => {
  const { data } = await httpClient.post(API_ENDPOINTS.SUBSCRIBERS.SUBSCRIBE, { email });
  return data;
};
