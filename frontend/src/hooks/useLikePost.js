import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as postsService from '../services/postsService';

export const useLikePost = (postId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => postsService.likePost(postId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] })
  });
};
