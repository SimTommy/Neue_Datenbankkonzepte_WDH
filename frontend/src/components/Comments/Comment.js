import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../AuthContext';
import './Comment.css';

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

  const handleRemoveMedia = async (mediaType, mediaPath) => {
    const relativePath = mediaPath.replace('http://localhost:4000', '');
    try {
      await axios.post(`http://localhost:4000/api/comments/${comment._id}/remove-media`, { mediaType, mediaPath: relativePath }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      onCommentUpdated(comment._id, { ...comment, [mediaType]: comment[mediaType].filter(path => path !== mediaPath) });
    } catch (error) {
      console.error('Error removing media:', error.response.data);
    }
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
          <div className="comment-media">
            {comment.images && comment.images.map((image, index) => (
              <div key={index}>
                <img className="comment-media" src={`http://localhost:4000${image}`} alt="comment media" />
                {(user.id === comment.author._id || user.role === 'admin') && (
                  <button onClick={() => handleRemoveMedia('image', image)}>Remove</button>
                )}
              </div>
            ))}
            {comment.videos && comment.videos.map((video, index) => (
              <div key={index}>
                <video className="comment-media" src={`http://localhost:4000${video}`} controls />
                {(user.id === comment.author._id || user.role === 'admin') && (
                  <button onClick={() => handleRemoveMedia('video', video)}>Remove</button>
                )}
              </div>
            ))}
            {comment.documents && comment.documents.map((document, index) => (
              <div key={index}>
                <a className="comment-media" href={`http://localhost:4000${document}`} target="_blank" rel="noopener noreferrer">View Document</a>
                {(user.id === comment.author._id || user.role === 'admin') && (
                  <button onClick={() => handleRemoveMedia('document', document)}>Remove</button>
                )}
              </div>
            ))}
          </div>
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
