import React, { useState } from 'react';
import axios from 'axios';
import './EditEventModal.css';

const EditEventModal = ({ show, event, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description,
    location: event.location,
    startTime: event.startTime,
    endTime: event.endTime,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Updating event with data:', formData); // Debugging output
    try {
      const response = await axios.put(`http://localhost:4000/api/events/${event._id}`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      onSave(response.data);
    } catch (error) {
      console.error('Error updating event:', error.response ? error.response.data : error.message);
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Edit Event</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Start Time</label>
            <input type="datetime-local" name="startTime" value={new Date(formData.startTime).toISOString().slice(0, 16)} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>End Time</label>
            <input type="datetime-local" name="endTime" value={new Date(formData.endTime).toISOString().slice(0, 16)} onChange={handleChange} required />
          </div>
          <button type="submit">Save</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default EditEventModal;
