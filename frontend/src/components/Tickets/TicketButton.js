import React from 'react';
import axios from 'axios';
import { useAuth } from '../../AuthContext';
import './TicketButton.css';

const TicketButton = ({ eventId, onPurchase }) => {
  const { user } = useAuth();

  const handlePurchase = async () => {
    try {
      await axios.post(`http://localhost:4000/api/events/${eventId}/tickets`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      onPurchase();
    } catch (error) {
      console.error('Error purchasing ticket:', error.response.data);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <button className="ticket-button" onClick={handlePurchase}>Buy Ticket</button>
  );
};

export default TicketButton;
