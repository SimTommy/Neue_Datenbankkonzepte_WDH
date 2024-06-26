import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LogOut.css';

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Token aus dem LocalStorage entfernen
    localStorage.removeItem('token');
    alert('Sie wurden erfolgreich ausgeloggt! Token wurde entfernt.');

    // Weiterleitung zur Homepage und Seite nach 1 Sekunden neu laden
    navigate('/');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="logout-container">
      <h1>Logout</h1>
      <button className="logout-button" onClick={handleLogout}>Jetzt ausloggen</button>
    </div>
  );
};

export default Logout;
