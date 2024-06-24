import React from 'react';
import { Link } from 'react-router-dom';
import UserProfile from '../../pages/UserProfile';
import './Header.css';

const Header = () => {
  return (
    <header>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/events">Events</Link>
        <Link to="/auth">Auth</Link>
        <Link to="/logout">Logout</Link>
        <UserProfile />
      </nav>
    </header>
  );
};

export default Header;
