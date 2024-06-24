import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../AuthContext';
import './CommentForm.css';

const CommentForm = ({ eventId, onCommentAdded }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');

  const handleChange = (e) => {
    setContent(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const commentData = { content, author: user.id };
      await axios.post(`http://localhost:4000/api/events/${eventId}/comments`, commentData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setContent('');
      onCommentAdded();
    } catch (error) {
      console.error('Error adding comment:', error.response.data);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <textarea name="content" placeholder="Add a comment" value={content} onChange={handleChange} required />
      <button type="submit">Add Comment</button>
    </form>
  );
};

export default CommentForm;
