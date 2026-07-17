import { useMutation } from '@tanstack/react-query';
import * as aiService from '../services/aiService';

export const useGeneratePostImage = () =>
  useMutation({
    mutationFn: (prompt) => aiService.generatePostImage(prompt)
  });
