import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../AuthContext';
import './EventForm.css';

const EventForm = ({ event, onSave }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: event ? event.title : '',
    description: event ? event.description : '',
    startTime: event ? event.startTime : '',
    endTime: event ? event.endTime : '',
    location: event ? event.location : '',
    organizer: user ? user.id : ''  // Ensure organizer is set
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = event ? `http://localhost:4000/api/events/${event._id}` : 'http://localhost:4000/api/events';
      const method = event ? 'put' : 'post';
      const eventData = { ...formData, organizer: user.id }; // Add organizer to the event data
      await axios[method](url, eventData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      onSave();
    } catch (error) {
      console.error('Error saving event:', error.response.data);
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'organizer')) {
    return null;
  }

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleChange} required />
      <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required />
      <input type="datetime-local" name="startTime" placeholder="Start Time" value={formData.startTime} onChange={handleChange} required />
      <input type="datetime-local" name="endTime" placeholder="End Time" value={formData.endTime} onChange={handleChange} required />
      <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange} required />
      <button type="submit">Save Event</button>
    </form>
  );
};

export default EventForm;
