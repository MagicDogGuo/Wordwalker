import { useQuery } from '@tanstack/react-query';
import * as postsService from '../services/postsService';
import { queryKeys } from './queryKeys';

export const usePost = (id) =>
  useQuery({
    queryKey: queryKeys.posts.detail(id),
    queryFn: () => postsService.getPost(id),
    enabled: !!id
  });
