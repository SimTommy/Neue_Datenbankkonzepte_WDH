import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import EventForm from './EventForm';
import { useAuth } from '../../AuthContext';
import './EventList.css';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/events');
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/api/events/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEvents(events.filter(event => event._id !== id));
    } catch (error) {
      console.error('Error deleting event:', error.response.data);
    }
  };

  const handleSave = () => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/events');
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="event-list">
      <input
        type="text"
        placeholder="Search events..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="event-search"
      />
      {user && (user.role === 'admin' || user.role === 'organizer') && (
        <EventForm onSave={handleSave} />
      )}
      <ul>
        {filteredEvents.map(event => (
          <li key={event._id}>
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <p>{new Date(event.startTime).toLocaleString()}</p>
            <p>Location: {event.location}</p>
            <p>Organizer: {event.organizer.username}</p>
            <Link to={`/events/${event._id}`}>View Details</Link> {/* Korrigierter Link */}
            {user && (user.role === 'admin' || user.role === 'organizer') && (
              <button onClick={() => handleDelete(event._id)}>Delete</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventList;
