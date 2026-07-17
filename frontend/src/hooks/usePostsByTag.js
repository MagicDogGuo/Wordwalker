import { useQuery } from '@tanstack/react-query';
import * as postsService from '../services/postsService';
import { queryKeys } from './queryKeys';

export const useUniqueTags = () =>
  useQuery({
    queryKey: queryKeys.posts.uniqueTags,
    queryFn: postsService.getUniqueTags
  });

export const usePostsByTag = (tagName) =>
  useQuery({
    queryKey: queryKeys.posts.byTag(tagName),
    queryFn: () => postsService.getPostsByTag(tagName),
    enabled: !!tagName
  });
