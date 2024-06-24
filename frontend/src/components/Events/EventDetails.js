import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import TicketButton from '../Tickets/TicketButton';
import CommentForm from '../Comments/CommentForm';
import { useAuth } from '../../AuthContext';
import './EventDetails.css';

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);

  const fetchEvent = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:4000/api/events/${id}`);
      setEvent(response.data);
    } catch (error) {
      console.error('Error fetching event:', error);
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [id, fetchEvent]);

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`http://localhost:4000/api/events/${id}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchEvent();
    } catch (error) {
      console.error('Error deleting comment:', error.response.data);
    }
  };

  const handleDeleteEvent = async () => {
    try {
      await axios.delete(`http://localhost:4000/api/events/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Redirect to the events list after deleting
      window.location.href = '/events';
    } catch (error) {
      console.error('Error deleting event:', error.response.data);
    }
  };

  if (!event) {
    return <p>Loading...</p>;
  }

  return (
    <div className="event-details">
      <h2>{event.title}</h2>
      <p>{event.description}</p>
      <p>{new Date(event.startTime).toLocaleString()} - {new Date(event.endTime).toLocaleString()}</p>
      <p>Location: {event.location}</p>
      <p>Organizer: {event.organizer.username}</p>
      <h3>Participants:</h3>
      <ul>
        {event.participants.map(participant => (
          <li key={participant._id}>{participant.username} ({participant.email})</li>
        ))}
      </ul>
      <h3>Comments:</h3>
      <ul>
        {event.comments.map(comment => (
          <li key={comment._id}>
            <strong>{comment.author.username}:</strong> {comment.content}
            {(user && (user._id === comment.author._id || user.role === 'admin')) && (
              <button onClick={() => handleDeleteComment(comment._id)}>Delete</button>
            )}
          </li>
        ))}
      </ul>
      <TicketButton eventId={event._id} onPurchase={fetchEvent} />
      <CommentForm eventId={event._id} onCommentAdded={fetchEvent} />
      {user && (user._id === event.organizer._id || user.role === 'admin') && (
        <button onClick={handleDeleteEvent}>Delete Event</button>
      )}
      <Link to="/events" className="back-button">Go Back to Event List</Link>
    </div>
  );
};

export default EventDetails;
