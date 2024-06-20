import React from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Token aus dem LocalStorage entfernen
    localStorage.removeItem('token');
    alert('Sie wurden erfolgreich ausgeloggt! Token wurde entfernt.');

    // Weiterleitung zur Homepage und Seite nach 3 Sekunden neu laden
    navigate('/');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div>
      <h1>Logout</h1>
      <button onClick={handleLogout}>Jetzt ausloggen</button>
    </div>
  );
};

export default Logout;
