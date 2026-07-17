import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as postsService from '../services/postsService';
import { queryKeys } from './queryKeys';

export const usePosts = () =>
  useQuery({
    queryKey: queryKeys.posts.list,
    queryFn: postsService.getPosts
  });

// Post CRUD mutations invalidate every 'posts'-prefixed query (list, detail,
// myPosts, myFavorites, byTag) since a single post can appear in any of them.
export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postsService.createPost,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] })
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, postData }) => postsService.updatePost(id, postData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] })
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postsService.deletePost,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] })
  });
};
