import { useState, useEffect } from 'react';
import { useLikePost } from './useLikePost';

// Shared optimistic like/unlike behavior for a post, used by both PostList
// and PostDetail so they no longer duplicate the same state + rollback logic.
export const usePostLike = (post, user) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post?.likes?.length || 0);
  const likePost = useLikePost(post?._id);

  useEffect(() => {
    if (user && post?.likes) {
      setLiked(post.likes.some(like => like.user === user.id || like.user?._id === user.id));
    }
    setLikeCount(post?.likes?.length || 0);
  }, [user, post?.likes]);

  const toggleLike = (onRequireLogin) => {
    if (!user) {
      onRequireLogin?.();
      return;
    }
    if (likePost.isPending) return;

    const originalLiked = liked;
    const originalLikeCount = likeCount;

    setLiked(!originalLiked);
    setLikeCount(prev => !originalLiked ? prev + 1 : Math.max(0, prev - 1));

    likePost.mutate(undefined, {
      onSuccess: (data) => {
        if (!data) return;
        if (data.likeCount !== undefined) setLikeCount(data.likeCount);
        if (data.isLiked !== undefined) setLiked(data.isLiked);
        else if (data.likes && Array.isArray(data.likes) && user?.id) {
          setLiked(data.likes.some(like => like.user === user.id || like.user?._id === user.id));
        }
      },
      onError: (error) => {
        setLiked(originalLiked);
        setLikeCount(originalLikeCount);
        console.error('Error liking post:', error);
      }
    });
  };

  return { liked, likeCount, isLiking: likePost.isPending, toggleLike };
};
