import { useQuery } from '@tanstack/react-query';
import * as postsService from '../services/postsService';
import { queryKeys } from './queryKeys';
import { useAuth } from '../context/AuthContext';

export const useMyFavoritePosts = () => {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.posts.myFavorites,
    queryFn: postsService.getMyFavoritePosts,
    enabled: !!token
  });
};
