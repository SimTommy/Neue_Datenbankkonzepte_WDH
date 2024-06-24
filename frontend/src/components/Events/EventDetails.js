import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import TicketButton from '../Tickets/TicketButton';
import CommentForm from '../Comments/CommentForm';
import './EventDetails.css';

const EventDetails = () => {
  const { id } = useParams();
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
  }, [fetchEvent]);

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
          </li>
        ))}
      </ul>
      <TicketButton eventId={event._id} onPurchase={fetchEvent} />
      <CommentForm eventId={event._id} onCommentAdded={fetchEvent} />
      <Link to="/events" className="back-button">Go Back to Event List</Link>
    </div>
  );
};

export default EventDetails;
