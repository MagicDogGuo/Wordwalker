import { useQuery } from '@tanstack/react-query';
import * as postsService from '../services/postsService';
import { queryKeys } from './queryKeys';
import { useAuth } from '../context/AuthContext';

export const useMyPosts = () => {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.posts.myPosts,
    queryFn: postsService.getMyPosts,
    enabled: !!token
  });
};
