import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../AuthContext';

const Comment = ({ comment, eventId, onCommentUpdated, onCommentDeleted }) => {
  const { user } = useAuth();
  const [editingComment, setEditingComment] = useState(false);
  const [updatedCommentData, setUpdatedCommentData] = useState(comment.content);

  const handleDeleteComment = async () => {
    try {
      await axios.delete(`http://localhost:4000/api/events/${eventId}/comments/${comment._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      onCommentDeleted(comment._id);
    } catch (error) {
      console.error('Error deleting comment:', error.response.data);
    }
  };

  const handleEditComment = () => {
    setEditingComment(true);
  };

  const handleCancelEdit = () => {
    setEditingComment(false);
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`http://localhost:4000/api/events/${eventId}/comments/${comment._id}`, { content: updatedCommentData }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEditingComment(false);
      onCommentUpdated(comment._id, updatedCommentData);
    } catch (error) {
      console.error('Error updating comment:', error.response.data);
    }
  };

  const handleInputChange = (e) => {
    setUpdatedCommentData(e.target.value);
  };

  return (
    <li>
      {editingComment ? (
        <div>
          <textarea value={updatedCommentData} onChange={handleInputChange}></textarea>
          <button onClick={handleSaveEdit}>Save</button>
          <button onClick={handleCancelEdit}>Cancel</button>
        </div>
      ) : (
        <div>
          <strong>{comment.author.username}:</strong> {comment.content}
          {(user && (user.id === comment.author._id || user.role === 'admin')) && (
            <div>
              <button onClick={handleEditComment}>Edit</button>
              <button onClick={handleDeleteComment}>Delete</button>
            </div>
          )}
        </div>
      )}
    </li>
  );
};

export default Comment;
