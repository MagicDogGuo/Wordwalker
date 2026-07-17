import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as commentsService from '../services/commentsService';
import { queryKeys } from './queryKeys';

export const useComments = (postId) =>
  useQuery({
    queryKey: queryKeys.comments.byPost(postId),
    queryFn: () => commentsService.getCommentsByPost(postId),
    enabled: !!postId
  });

export const useCreateComment = (postId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content) => commentsService.createComment({ postId, content }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.comments.byPost(postId) })
  });
};

export const useDeleteComment = (postId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId) => commentsService.deleteComment(commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.comments.byPost(postId) })
  });
};
