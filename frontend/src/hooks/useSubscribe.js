import { useMutation } from '@tanstack/react-query';
import * as subscribersService from '../services/subscribersService';

export const useSubscribe = () =>
  useMutation({
    mutationFn: (email) => subscribersService.subscribe(email)
  });
