import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import './Header.css';

const Header = () => {
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
      </nav>
    </header>
  );
};

export default Header;
