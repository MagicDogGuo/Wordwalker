import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './CommentList.css';
import { useComments, useCreateComment, useDeleteComment } from '../hooks/useComments';

const CommentList = ({ postId }) => {
  const [newComment, setNewComment] = useState('');
  const { user, token } = useAuth();

  const { data: comments = [], isError: isCommentsError } = useComments(postId);
  const createComment = useCreateComment(postId);
  const deleteComment = useDeleteComment(postId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim() || !token) return;

    createComment.mutate(newComment, {
      onSuccess: () => setNewComment('')
    });
  };

  const handleDelete = (commentId) => {
    deleteComment.mutate(commentId);
  };

  const errorMessage = createComment.error?.response?.data?.message
    || deleteComment.error?.response?.data?.message
    || (isCommentsError ? 'Failed to fetch comments' : '');

  return (
    <div className="comment-section">
      <h3>Comments</h3>
      {errorMessage && <div className="error-message">{errorMessage}</div>}

      {/* Comment input form */}
      {user && (
        <form onSubmit={handleSubmit} className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            required
          />
          <button type="submit" color="primary">Post Comment</button>
        </form>
      )}

      {/* Comments list */}
      <div className="comments-list">
        {comments.map(comment => (
          <div key={comment._id} className="comment-item">
            <div className="comment-header">
              <span className="comment-author">{comment.user?.username || 'Unknown User'}</span>
              <span className="comment-date">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="comment-content">{comment.content}</div>
            {(user?.id === comment.user?._id || user?.role === 'admin') && (
              <button
                onClick={() => handleDelete(comment._id)}
                className="delete-comment"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentList;
