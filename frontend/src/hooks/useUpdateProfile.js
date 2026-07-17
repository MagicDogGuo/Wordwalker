import { useMutation } from '@tanstack/react-query';
import * as authService from '../services/authService';

export const useUpdateProfile = () =>
  useMutation({
    mutationFn: (payload) => authService.updateProfile(payload)
  });
