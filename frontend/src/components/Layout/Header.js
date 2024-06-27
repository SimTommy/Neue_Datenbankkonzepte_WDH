import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import NotificationBell from './NotificationBell';
import './Header.css';

const Header = ({ newMessageCount, newMessages, markAsRead }) => {
  const { user } = useAuth();

  return (
    <header>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/events">Events</Link>
        <Link to="/auth">Auth</Link>
        <Link to="/logout">Logout</Link>
        {user && user.role === 'admin' && <Link to="/admin">Admin Panel</Link>}
        {user && <Link to="/profile">Profile</Link>}
        {user && <Link to="/messages">Messages</Link>}
        {user && <NotificationBell newMessageCount={newMessageCount} newMessages={newMessages} markAsRead={markAsRead} />}
      </nav>
    </header>
  );
};

export default Header;
