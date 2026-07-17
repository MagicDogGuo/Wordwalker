import httpClient from '../config/httpClient';
import { API_ENDPOINTS } from '../config/api';

export const fetchCurrentUser = async () => {
  const { data } = await httpClient.get(API_ENDPOINTS.AUTH.ME);
  return data;
};

export const loginRequest = async (credentials) => {
  const { data } = await httpClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  return data;
};

export const registerRequest = async (payload) => {
  const { data } = await httpClient.post(API_ENDPOINTS.AUTH.REGISTER, payload);
  return data;
};

export const updateProfile = async (payload) => {
  const { data } = await httpClient.put(API_ENDPOINTS.AUTH.UPDATE_PROFILE, payload);
  return data;
};
