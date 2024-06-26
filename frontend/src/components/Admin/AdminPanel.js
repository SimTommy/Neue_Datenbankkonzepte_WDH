import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../AuthContext';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [comments, setComments] = useState([]);

  const fetchTickets = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/tickets', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTickets(response.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/comments', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/events', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    if (user && user.role === 'admin') {
      fetchUsers();
      fetchEvents();
      fetchTickets();
      fetchComments();
    }
  }, [user]);

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:4000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(users.filter(user => user._id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error.response.data);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await axios.delete(`http://localhost:4000/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEvents(events.filter(event => event._id !== eventId));
      fetchTickets();
      fetchComments(); // Abrufen der Kommentare nach dem Löschen eines Events
    } catch (error) {
      console.error('Error deleting event:', error.response.data);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`http://localhost:4000/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setComments(comments.filter(comment => comment._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error.response.data);
    }
  };

  const handleDeleteAllComments = async () => {
    try {
      await axios.delete('http://localhost:4000/api/comments', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setComments([]);
    } catch (error) {
      console.error('Error deleting all comments:', error.response.data);
    }
  };

  const handleDeleteAllTickets = async () => {
    try {
      await axios.delete('http://localhost:4000/api/tickets', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTickets([]);
    } catch (error) {
      console.error('Error deleting all tickets:', error.response.data);
    }
  };

  if (!user || user.role !== 'admin') {
    return <p>Access denied. Admins only.</p>;
  }

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>
      <section>
        <h2>Users</h2>
        <ul>
          {users.map(user => (
            <li key={user._id}>
              {user.username} ({user.email}) - {user.role}
              <button onClick={() => handleDeleteUser(user._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Events</h2>
        <ul>
          {events.map(event => (
            <li key={event._id}>
              {event.title} - {event.location} - {event.startTime}
              <button onClick={() => handleDeleteEvent(event._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Tickets</h2>
        <button onClick={handleDeleteAllTickets}>Delete All Tickets</button>
        <ul>
          {tickets.map(ticket => (
            <li key={ticket._id}>
              Event: {ticket.event ? ticket.event.title : 'Unknown'}, 
              Holder: {ticket.holder ? ticket.holder.username : 'Unknown'}, 
              Purchased: {ticket.purchaseDate}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Comments</h2>
        <button onClick={handleDeleteAllComments}>Delete All Comments</button>
        <ul>
          {comments.map(comment => (
            <li key={comment._id}>
              Event: {comment.event ? comment.event.title : 'Unknown'}, 
              Author: {comment.author ? comment.author.username : 'Unknown'}, 
              Comment: {comment.content}
              <button onClick={() => handleDeleteComment(comment._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default AdminPanel;
